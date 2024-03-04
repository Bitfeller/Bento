var signInModel = document.getElementById('signInModal');
var signUpModal = document.getElementById('signUpModal');

var signUpBtn = document.getElementById('signUpBtn') 
var bigBtn = document.getElementById('bigBtn');
var signInBtn = document.getElementById('signInBtn');

var closeBtn = document.getElementsByClassName('closeBtn');

signInBtn.onclick = function() {
    signInModel.style.display = "block";
}

bigBtn.onclick = function() {
    signUpModal.style.display = "block";
}

signUpBtn.onclick = function() {
    signUpModal.style.display = "block";
}

closeBtn.onclick = function() {
    signInModel.style.display = "none";
    signUpModal.style.display = "none";
}

window.onclick = function(event) {
    if (event.target === signInModel || event.target === signUpModal) {
        signInModel.style.display = "none";
        signUpModal.style.display = "none";
    }
} 
