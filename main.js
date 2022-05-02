document.getElementById("search-box").addEventListener("keyup", updateMatchList);
function updateMatchList() {
	console.log("updateMatchList");
	var match_list = $('#match-list');
	var list_item = $('<li>' + 'test' + '</li>');
	match_list.append(list_item);
};
