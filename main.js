(function () {
document.getElementById("search-box").addEventListener("keyup", updateMatchList);

// for testing, region is "OR" (Oregon)
// todo: automatically acquire or input region
const region_code = "OR";

var nrcs_spp_array = [];
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
  console.log(nrcs_spp_array);
}, 'text');

var local_spp_array = [];
// const? or allow to change on-the-fly?
local_spp_array = nrcs_spp_array.filter(spp_obj =>
	spp_obj.distribution.includes(region_code + ","));
console.log(local_spp_array);

function updateMatchList() {
	console.log("updateMatchList");
	var search_term = $("#search-box").val();
	var match_list = $('#match-list');
	if (search_term.length > 1) {
		match_list.empty(); // clear any previous content
		var spp_match_array = local_spp_array.filter(spp_obj =>
			spp_obj.nrcs_code.startsWith(search_term));
		spp_match_array.forEach(spp_obj => {
			var list_item = $('<li>' + spp_obj.nrcs_code +
			": " + spp_obj.species_name + '</li>');
			match_list.append(list_item);
		});
	}
}
})(); // Immediately-Invoked Function Expression (IIFE)
