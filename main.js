(function () {
document.getElementById("search-box").addEventListener("keyup", updateMatchList);
function updateMatchList() {
	console.log("updateMatchList");
	var search_term = $("#search-box").val();
	var match_list = $('#match-list');
	match_list.empty(); // clear previous content
	var list_item = $('<li>' + 'test ' + search_term + '</li>');
	match_list.append(list_item);
}

})(); // Immediately-Invoked Function Expression (IIFE)
