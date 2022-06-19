(function () {

// for testing, region is "OR" (Oregon)
// todo: automatically acquire or input region
const region_code = "OR";

// testing observables
const observable = rxjs.from(["Hello", "world"]);

//observable.subscribe(val => obs_show(val));

// for testing, to view observable values
function obs_show(val) {
  let el = document.createElement('p');
  el.innerText = val;
  document.body.appendChild(el);
};

var site_info_array = [];
var current_site_id = "";
var latest_site_date = new Date();
var site_spp_array = []; // the species items for all the sites, internally
// indexed by which site each one belongs to.
var nrcs_spp_array = [];
var obsvAllSpp = rxjs.from(nrcs_spp_array);
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
    // for testing, redefine this global here
    obsvAllSpp = rxjs.from(nrcs_spp_array);
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
	var search_term = sppSearchInput.value.toLowerCase();
	// todo: deal with backspace removal of characters
	match_list.innerHTML = ""; // clear any previous content
	if (search_term.length > 1) {
    // test obsvAllSpp here
    obsvAllSpp
      .pipe(rxjs.filter(spp_obj =>
        spp_obj.distribution.includes(region_code + ",")))
      .pipe(rxjs.filter(spp_obj =>
        spp_obj.nrcs_code.toLowerCase().startsWith(search_term)))
      .subscribe(spp_obj => {
        let sppString = spp_obj.nrcs_code + ': ' + spp_obj.species_name;
        console.log(sppString);
      });

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
    // build list contents, then assign innerHTML all at once
    let list_string = "";
    spp_match_array.forEach(obj => {
			let display_class = obj.is_local ? "local" : "nonlocal";
			list_string += '<li class="' + display_class +
        '" id="' + obj.item_code + '">' + obj.item_code +
		 		': ' + obj.item_description + '</li>';
		});
    match_list.innerHTML = list_string;
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
        console.log(spp);
        // for testing, use the code and description as one string "species"
        let spp_entry_date = new Date();
        let new_spp_item = {
          "id": spp_entry_date.getTime().toString(),
          "site_id": current_site_id,
          "species": spp,
          "spp_date": spp_entry_date
        };
        site_spp_array.unshift(new_spp_item);
        // trigger to refresh site list
        showSitesTimeout = setTimeout(showSites, 10);
        // clear the search for next time


        // dismiss the modal
        console.log('About to hide the Species Search modal');
        bootstrap.Modal.getOrCreateInstance(document.getElementById('vnSppSearchScreen')).hide();
    }
});

var sppSearchModal = document.getElementById('vnSppSearchScreen');
var sppSearchInput = document.getElementById('search-box');
sppSearchInput.addEventListener("input", updateMatchList);
sppSearchModal.addEventListener('shown.bs.modal', function () {
  sppSearchInput.value = "";
  match_list.innerHTML = "";
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
    // multiple sites would never be created in the same millisecond, so id
    // would be unique
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
      obj.notes + '<br>' + obj.date + '<br>' +
'      <button type="button" id="' + obj.id +
'" class="btn btn-primary" data-bs-toggle="modal"' +
'        data-bs-target="#vnSppSearchScreen">' +
'        Add species' +
'      </button>' +
'      <ul id="spp-list-for-' + obj.id + '" class="list-unstyled">' +
'      </ul>'
'    </div>' +
'  </div>' +
'</div>';
  });
 // fill in species lists for sites
 site_info_array.forEach((obj, index) => {
   let this_site_spp_array = site_spp_array.filter(spp_obj =>
     spp_obj.site_id === obj.id)
     .sort((s1, s2) => (s1.spp_date < s2.spp_date) ? 1 : (s1.spp_date > s2.spp_date) ? -1 : 0);
  let this_site_spp_list = document.getElementById("spp-list-for-" + obj.id);
  let list_string = "";
  this_site_spp_array.forEach((spp_obj, spp_index) => {
    list_string += '<li id="' + spp_obj.id + '">' +
    spp_obj.species + '</li>';
  })
  this_site_spp_list.innerHTML = list_string;
 })

  // Assign listeners after all HTML written, emperically works.
  // If assigned in the same loop as writing hTML, only the first button
  // gets its listener, others not.
  site_info_array.forEach((obj, index) => {
    document.getElementById(obj.id).addEventListener('click',
    function(event) {
      // Set global 'current_site_id', to be used on any species items added in
      // the modal that opens from this button click.
      current_site_id = event.currentTarget.id;
      // The 'New spp' button on each site's card has the same id (numeric
      // text) as that site's internal id.
    }, false)
  })
}
// From what I have been able to find out, event listeners are deleted with the
// element if there are no refernces to that element, so re-creating them each
// time like this should work.

function openNav() {
		document.getElementById("vnSidenav").style.width = "250px";
		document.getElementById("main").style.marginLeft = "250px";
}

function closeNav() {
		document.getElementById("vnSidenav").style.width = "0";
		document.getElementById("main").style.marginLeft= "0";
}

})(); // Immediately-Invoked Function Expression (IIFE)
