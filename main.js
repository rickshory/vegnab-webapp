(function () {
document.getElementById("search-box").addEventListener("keyup", updateMatchList);

// for testing, region is "OR" (Oregon)
// todo: automatically acquire or input region
const region_code = "OR";

var nrcs_spp_array = [];
var tagged_spp_array = [];
var local_spp_array = [];
var nonlocal_spp_array = [];
// experimenting to color list items by local or nonlocal
// for now, maintain way too many arrays
var local_spp_display_array = [];
var nonlocal_spp_display_array = [];

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
	makeLocalSppArray();
	makeTaggedSppArray();
	console.log(tagged_spp_array);
}, 'text');

function makeLocalSppArray() {
	local_spp_array = nrcs_spp_array.filter(spp_obj =>
		spp_obj.distribution.includes(region_code + ","));
//	console.log(local_spp_array);
	nonlocal_spp_array = nrcs_spp_array.filter(spp_obj =>
		!local_spp_array.includes(spp_obj));
//	console.log(nonlocal_spp_array);
	// for testing, do it laboriously
	local_spp_display_array = local_spp_array.map(orig_obj => {
		let new_properties = {
			"item_code": orig_obj.nrcs_code,
			"item_description": orig_obj.species_name,
			"display_class": "local"
		};
		return new_properties;
	});
	nonlocal_spp_display_array = nonlocal_spp_array.map(orig_obj => {
		let new_properties = {
			"item_code": orig_obj.nrcs_code,
			"item_description": orig_obj.species_name,
			"display_class": "nonlocal"
		};
		return new_properties;
	});
}

function makeTaggedSppArray() {
	tagged_spp_array = nrcs_spp_array.map(orig_obj => {
		let new_properties = {
			"item_code": orig_obj.nrcs_code,
			"item_description": orig_obj.species_name,
			"is_local": false
		};
		if (orig_obj.distribution.includes(region_code + ",")) {
			new_properties["is_local"] = true;
		}
		return new_properties;
	});
}

function updateMatchList() {
	console.log("updateMatchList");
	var search_term = $("#search-box").val().toLowerCase();
	var match_list = $('#match-list');
	// todo: deal with backspace removal of characters
	if (search_term.length > 1) {
		match_list.empty(); // clear any previous content
		// get the strict matches on item_code for local species
		var spp_match_array = tagged_spp_array.filter(obj =>
			obj.is_local && obj.item_code.toLowerCase().startsWith(search_term));
			if (search_term.length > 2) { // at least 3 characters
				// to include short genera such as "Poa" and "Zea"
				// add the full-text matches on local species names
				// no need to duplicate any item_code matches
				let local_no_code_array = tagged_spp_array.filter(obj =>
					obj.is_local && !spp_match_array.includes(obj));
				let local_fulltext_spp_match_array = local_no_code_array.filter(obj =>
					obj.item_description.toLowerCase().includes(search_term));
				spp_match_array = spp_match_array.concat(local_fulltext_spp_match_array);
				spp_match_array.sort();

				// for testing, add nrcs_code matches of non-local species
				// todo: use CSS to color them differently
				let nonlocal_spp_code_match_array = tagged_spp_array.filter(obj =>
					!obj.is_local && obj.item_code.toLowerCase().startsWith(search_term));
				console.log(nonlocal_spp_code_match_array);
				spp_match_array = spp_match_array.concat(nonlocal_spp_code_match_array);
				// don't sort here; put the nonlocal after the sorted local species
			}


		spp_match_array.forEach(obj => {
			var list_item = $('<li>' + obj.item_code +
			": " + obj.item_description + '</li>');
			match_list.append(list_item);
		});
	}
}
})(); // Immediately-Invoked Function Expression (IIFE)
