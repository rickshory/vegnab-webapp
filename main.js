document.getElementById("search-box").addEventListener("keyup", updateList);
function updateList() {
	var elementValue = document.getElementById("search-box").value;
    document.getElementById("output-list").innerHTML = elementValue;
}
