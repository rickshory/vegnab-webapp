(function () {
document.getElementById("search-box").addEventListener("keyup", updateMatchList);

// for testing, region is "OR" (Oregon)
// todo: automatically acquire or input region
const region_code = "OR";

var site_info_array = [];
var latest_site_date = new Date();
var nrcs_spp_array = [];
var local_spp_array = [];
var nonlocal_spp_array = [];

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
//	var match_list = $('#match-list');
	var match_list = document.getElementById("match-list");
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
			match_list.innerHTML += '<li class="' + display_class + '">' + obj.item_code +
		 		": " + obj.item_description + '</li>';
		});
	}
}

var sppSearchModal = document.getElementById('vnSppSearchScreen');
var sppSearchInput = document.getElementById('search-box');

sppSearchModal.addEventListener('shown.bs.modal', function () {
  sppSearchInput.focus();
})

var vnAddSiteButton = document.getElementById('btn-add-site');
var vnSiteDate = document.getElementById('site_date');

vnAddSiteButton.addEventListener('onclick', function () {
	latest_site_date = new Date();
	vnSiteDate.innerHTML = latest_site_date.toString();
});

var vnSiteInfoModal = document.getElementById('vnSiteInfoScreen');
var vnSiteName = document.getElementById('site_name');
var vnSiteNotes = document.getElementById('site_notes');
vnSiteInfoModal.addEventListener('hide.bs.modal', function (event) {
	event.preventDefault();
	console.log("In modal Hide event");
	let SiteNameString = vnSiteName.value.toString();
	let SiteNotesString = vnSiteNotes.value.toString();
	console.log('site_name : '+ SiteNameString);
	console.log('site_notes : '+ SiteNotesString);
});

document.getElementById('btn-save-site-info').addEventListener('click', useSiteInfo);

function useSiteInfo() {
	console.log("in useSiteInfo");
	alert("in useSiteInfo");
}

function storeSiteInfo() {

}

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
