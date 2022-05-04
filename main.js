(function () {
document.getElementById("search-box").addEventListener("keyup", updateMatchList);

var nrcs_spp_array;
$.get('nrcs_spp.txt', function(data) {
	var tmp_array = data.split("\n");
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

function updateMatchList() {
	console.log("updateMatchList");
	var search_term = $("#search-box").val();
	var match_list = $('#match-list');
	if (search_term.length > 1) {
		match_list.empty(); // clear any previous content
		var spp_match_array = nrcs_spp_array.filter(spp_obj =>
			spp_obj.nrcs_code.startsWith(search_term));
		spp_match_array.forEach(spp_obj => {
			var list_item = $('<li>' + spp_obj.nrcs_code +
			": " + spp_obj.species_name + '</li>');
			match_list.append(list_item);
		});
	}
}
})(); // Immediately-Invoked Function Expression (IIFE)
