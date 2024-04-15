
const previewDialog = document.getElementById("previewDialog");
const addDialog = document.getElementById("addDialog");
const previewBtns = document.getElementsByClassName("previewBtns");
const addBtns = document.getElementsByClassName("addBtns");
const closeBtns = document.getElementsByClassName("closeBtns");

window.onclick = function(event) {
    if (event.target === previewDialog || event.target === addDialog) {
        previewDialog.close();
        addDialog.close();
    }
}