(function () {
document.getElementById("search-box").addEventListener("keyup", updateMatchList);

var all_spp_array;
$.get('all_spp.txt', function(data) {
	all_spp_array = data.split("\n");
//  console.log(all_spp_array);
}, 'text');

function updateMatchList() {
	console.log("updateMatchList");
	var search_term = $("#search-box").val();
	var match_list = $('#match-list');
	if (search_term.length > 1) {
		match_list.empty(); // clear any previous content
		var spp_match_array = all_spp_array.filter(word => word.startsWith(search_term));
		spp_match_array.forEach(value => {
			var list_item = $('<li>' + value + '</li>');
			match_list.append(list_item);
		});
	}
}
})(); // Immediately-Invoked Function Expression (IIFE)
