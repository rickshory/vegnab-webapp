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

$.get('nrcs_spp.txt', function(data) {
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
}, 'text');

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
	var search_term = $("#search-box").val().toLowerCase();
	var match_list = $('#match-list');
	// todo: deal with backspace removal of characters
	match_list.empty(); // clear any previous content
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
			var list_item = $('<li class="' + display_class + '">' + obj.item_code +
			": " + obj.item_description + '</li>');
			match_list.append(list_item);
		});
	}
}

var sppSearchModal = document.getElementById('vnSppSearchScreen')
var sppSearchInput = document.getElementById('search-box')

sppSearchModal.addEventListener('shown.bs.modal', function () {
  sppSearchInput.focus()
})

$("#btn-add-site").click(function () {
	latest_site_date = new Date();
	$("#site_date").html(latest_site_date.toString());
});


$('#vnSiteInfoScreen').on('hide.bs.modal', function () {
	 console.log('site_name : '+$("#site_name").val());
	 console.log('site_notes : '+$("#site_notes").val());
})

// $("#btn-save-site-info").click(function () {
// 	let site_obj = {
// 		"site_name": $("#site_name").val(),
// 		"site_notes": $("#site_notes").val(),
// 		"site_date": latest_site_date
// 	};
// //	console.log(site_obj);
// 	site_info_array.push(site_obj);
// 	console.log(site_info_array);
// });

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
