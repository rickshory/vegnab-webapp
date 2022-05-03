(function () {
document.getElementById("search-box").addEventListener("keyup", updateMatchList);

$.get('all_spp.txt', function(data) {
	var all_spp_array = data.split("\n");
  console.log(all_spp_array);
}, 'text');

function updateMatchList() {
	console.log("updateMatchList");
	var search_term = $("#search-box").val();
	var match_list = $('#match-list');
	match_list.empty(); // clear previous content
	var list_item = $('<li>' + 'test ' + search_term + '</li>');
	match_list.append(list_item);
}

})(); // Immediately-Invoked Function Expression (IIFE)
