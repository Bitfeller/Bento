
var previewModal = document.getElementById('previewModal');
var getModal = document.getElementById('getModal');
function previewModalShow() {
    previewModal.style.display = "block";
}
function getModalShow() {
    getModal.style.display = "block";    
}

window.onclick = function(event) {
    if (event.target === getModal || event.target === previewModal) {
        getModal.style.display = "none";
        previewModal.style.display = "none";
    }
} 