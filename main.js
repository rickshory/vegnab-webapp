(function () {
document.getElementById("search-box").addEventListener("keyup", updateMatchList);

// for testing, region is "OR" (Oregon)
// todo: automatically acquire or input region
const region_code = "OR";

var site_info_array = [];
var current_site_id = "";
var latest_site_date = new Date();
var nrcs_spp_array = [];
var local_spp_array = [];
var nonlocal_spp_array = [];
var showSitesTimeout = setTimeout(showSites, 10); // first time, there are no
// sites, so nothing visible will happen
var match_list = document.getElementById("match-list");

fetch('nrcs_spp.txt')
  .then(response => response.text())
  .then(data => {
		let tmp_array = data.split("\n");
		nrcs_spp_array = tmp_array.map(str => {
			spp_flds = str.split("\t");
			let spp_obj = {
				"nrcs_code": spp_flds[0],
				"species_name": spp_flds[1],
				"distribution": spp_flds[2]
			};
			return spp_obj;
		});
	//  console.log(nrcs_spp_array);
		makeLocalAndNonlocalSppArrays();
  });

function makeLocalAndNonlocalSppArrays() {
	// for performance, create these two smaller arrays, each seldom updated,
	// that will be filtered for matches on each keystroke
	let tmp_local_array = nrcs_spp_array.filter(spp_obj =>
		spp_obj.distribution.includes(region_code + ","));
	local_spp_array = tmp_local_array.map(orig_obj => {
		let new_properties = {
			"item_code": orig_obj.nrcs_code,
			"item_description": orig_obj.species_name,
			"is_local": true
		};
		return new_properties;
	});
	let tmp_nonlocal_array = nrcs_spp_array.filter(spp_obj =>
		!tmp_local_array.includes(spp_obj));
//	console.log(local_spp_array);
	nonlocal_spp_array = tmp_nonlocal_array.map(orig_obj => {
		let new_properties = {
			"item_code": orig_obj.nrcs_code,
			"item_description": orig_obj.species_name,
			"is_local": false
		};
		return new_properties;
	});
//	console.log(nonlocal_spp_array);
}

function updateMatchList() {
	console.log("updateMatchList");
//	var search_term = $("#search-box").val().toLowerCase();
	var search_term = document.getElementById("search-box").value.toLowerCase();
	// todo: deal with backspace removal of characters
	match_list.innerHTML = ""; // clear any previous content
	if (search_term.length > 1) {
		// first, get the strict matches on item_code for local species
		let spp_match_array = local_spp_array.filter(obj =>
			obj.item_code.toLowerCase().startsWith(search_term));

			if (search_term.length > 2) {
				// get local full-text matches local
				// at least 3 characters
				// to include short genera such as "Poa" and "Zea"

				// no need to duplicate any item_code matches
				let local_no_code_array = local_spp_array.filter(obj =>
					!spp_match_array.includes(obj));
				let local_fulltext_spp_match_array = local_no_code_array.filter(obj =>
					obj.item_description.toLowerCase().includes(search_term));
				spp_match_array = spp_match_array.concat(local_fulltext_spp_match_array);
				spp_match_array.sort(); // internally sort local spp, by code

				// add matches of non-local species, CSS will color them differently
				// first, get strict code matches
				let nonlocal_spp_match_array = nonlocal_spp_array.filter(obj =>
					obj.item_code.toLowerCase().startsWith(search_term));
				// next, get full-text matches
				// no need to repeat any of the code matches
				let nonlocal_no_code_array = nonlocal_spp_array.filter(obj =>
					!nonlocal_spp_match_array.includes(obj));

				let nonlocal_fulltext_spp_match_array = nonlocal_no_code_array.filter(obj =>
					obj.item_description.toLowerCase().includes(search_term));
				// put the nonlocal code and full-text results together
				nonlocal_spp_match_array =
					nonlocal_spp_match_array.concat(nonlocal_fulltext_spp_match_array);
				// internally sort
				nonlocal_spp_match_array.sort();
				// put the nonlocal below the local
//				console.log(nonlocal_spp_match_array);
				spp_match_array = spp_match_array.concat(nonlocal_spp_match_array);
				// don't sort here; leave the nonlocal after the sorted local species
			}

		spp_match_array.forEach(obj => {
			let display_class = obj.is_local ? "local" : "nonlocal";
			match_list.innerHTML += '<li class="' + display_class +
        '" id="' + obj.item_code + '">' + obj.item_code +
		 		': ' + obj.item_description + '</li>';
		});
	}
}

match_list.addEventListener('click', function (e) {
  // match_list is parent of all the list items
    var target = e.target; // Clicked element
    while (target && target.parentNode !== match_list) {
        target = target.parentNode; // If the clicked element isn't a direct child
        if(!target) { return; } // If element doesn't exist
    }
    if (target.tagName === 'LI'){ // tagName returns uppercase
//        alert(target.id);
        let spp = target.textContent;
        alert(spp);
    }
});

var sppSearchModal = document.getElementById('vnSppSearchScreen');
var sppSearchInput = document.getElementById('search-box');

sppSearchModal.addEventListener('shown.bs.modal', function () {
  sppSearchInput.focus();
})

var vnAddSiteButton = document.getElementById('btn-add-site');
var vnSiteDate = document.getElementById('site_date');

var vnSiteInfoModal = document.getElementById('vnSiteInfoScreen');
// following syntax breaks the addEventListener
// var vnSiteInfoModal = new bootstrap.Modal(document.getElementById('vnSiteInfoScreen'), {
//   keyboard: true
// });
var vnSiteName = document.getElementById('site_name');
var vnSiteNotes = document.getElementById('site_notes');

vnSiteInfoModal.addEventListener('shown.bs.modal', function (event) {
	latest_site_date = new Date();
	vnSiteDate.innerHTML = latest_site_date.toString();
});

vnSiteInfoModal.addEventListener('hide.bs.modal', function (event) {
//	event.preventDefault();
	console.log("In modal Hide event");
});

document.getElementById('btn-save-site-info').addEventListener('click', storeSiteInfo);

function storeSiteInfo() {
//	console.log("In storeSiteInfo fn");
//	console.log('self element : ' + self.id);
	let SiteNameString = vnSiteName.value.toString().trim();
//	console.log('site_name : '+ SiteNameString);
	// do verification
  if (SiteNameString === "") {
    alert("Need a site name");
    vnSiteName.value = ""; // in case some whitespace was there
    vnSiteName.focus();
    return;
  }
  let SiteNotesString = vnSiteNotes.value.toString().trim();
//  console.log('site_notes : '+ SiteNotesString);
  if (SiteNotesString === "") {
    alert("Need some site notes");
    vnSiteNotes.value = ""; // in case some whitespace was there
    vnSiteNotes.focus();
    return;
  }
  // store data
  let site_obj = {
    // multiple sites would never be created in the same millisecond
    "id": new Date().getTime().toString(),
    "name": SiteNameString,
    "notes": SiteNotesString,
    "date": latest_site_date
  };
  current_site_id = site_obj.id;
  // new item at the beginning
  site_info_array.unshift(site_obj);
  // clear form for next time
  vnSiteName.value = "";
  vnSiteNotes.value = "";
  // trigger to refresh site list
  showSitesTimeout = setTimeout(showSites, 10);
  // dismiss the modal
  console.log('About to hide the Site Info modal');
  bootstrap.Modal.getOrCreateInstance(document.getElementById('vnSiteInfoScreen')).hide();
}

var sites_accordion = document.getElementById("sites-accordion");

function showSites() {
  // show the sites in an accordion list, top item expanded by default
  if (site_info_array.length == 0) {
    sites_accordion.innerHTML = '<h2>No sites yet</h2>';
    current_site_id = "";
    return;
  }
  sites_accordion.innerHTML = "";
  site_info_array.forEach((obj, index) => {
    if (index === 0) {
      current_site_id = obj.id;
    }
    sites_accordion.innerHTML += '<div class="card">' +
'  <div class="card-header" id="heading' + (index + 1) + '">' +
'    <a class="' + (index == 0 ? '' : 'collapsed ') +
'btn" data-bs-toggle="collapse" href="#collapse' + (index + 1) +
'" aria-expanded="' + (index == 0 ? 'true' : 'false') +
'" aria-controls="collapse' + (index + 1) + '">' +
      obj.name +
'    </a>' +
'  </div>' +
'  <div id="collapse' + (index + 1) + '" class="collapse' +
(index == 0 ? ' show' : '') + '" data-bs-parent="#sites-accordion">' +
'    <div class="card-body">' +
      obj.id + '<br>' + obj.notes + '<br>' + obj.date + '<br>' +
'      <button type="button" id="' + obj.id +
'" class="btn btn-primary" data-bs-toggle="modal"' +
'        data-bs-target="#vnSppSearchScreen">' +
'        Add species' +
'      </button>' +
'    </div>' +
'  </div>' +
'</div>';
    document.getElementById(obj.id).addEventListener('click',
    function(event) {
      console.log("In button '" + obj.id + "' click event");
      console.log("currentTarget: " + event.currentTarget.id);
      console.log("target: " + event.target.id);
    }, false)
  });
}

sites_accordion.addEventListener('shown.bs.collapse', function (event) {
	console.log("In accordion shown event");
  console.log("currentTarget: " + event.currentTarget.id);
  console.log("target: " + event.target.id);
  let cardList = document.getElementsByClassName('card');
  for (let thisCard of cardList) {
    console.log(thisCard);
  }
});

// sites_accordion.addEventListener('show.bs.collapse', function (event) {
// 	console.log("Begin accordion show event");
// });
//
// sites_accordion.addEventListener('hide.bs.collapse', function (event) {
// 	console.log("Begin accordion hide event");
// });
//
// sites_accordion.addEventListener('hidden.bs.collapse', function (event) {
// 	console.log("In accordion hidden event");
// });

function openNav() {
		document.getElementById("vnSidenav").style.width = "250px";
		document.getElementById("main").style.marginLeft = "250px";
}

function closeNav() {
		document.getElementById("vnSidenav").style.width = "0";
		document.getElementById("main").style.marginLeft= "0";
}

// // manually enable, from bootstrap
// var collapseElementList = [].slice.call(document.querySelectorAll('.collapse'))
// var collapseList = collapseElementList.map(function (collapseEl) {
//   return new bootstrap.Collapse(collapseEl)
// })

})(); // Immediately-Invoked Function Expression (IIFE)
