import { UserGateway } from "../main/user_gateway.js";

// Check if user is signed in

async function check() {
    let [success, reason] = await UserGateway.getuser();
    if(success) window.location.href = "/home";
}

check();

// Modal code

var signInModal = document.getElementById('signInModal');
var signUpModal = document.getElementById('signUpModal');

var signUpBtn = document.getElementById('signUpBtn') 
var ctaButton = document.getElementById('cta-button') 
var bigBtn = document.getElementById('bigBtn');
var signInBtn = document.getElementById('signInBtn');

var closeBtn = document.getElementsByClassName('closeBtn');

signInBtn.onclick = function() {
    signInModal.style.display = "block";
}  
signUpBtn.onclick = function() {
    signUpModal.style.display = "block";
}
ctaButton.onclick = function() {
    signUpModal.style.display = "block";
}
closeBtn.onclick = function() {
    signInModal.style.display = "none";
    signUpModal.style.display = "none";
}

window.onclick = function(event) {
    if (event.target === signInModal || event.target === signUpModal) {
        signInModal.style.display = "none";
        signUpModal.style.display = "none";
    }
}

// Scroll Animation Code

const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            entry.target.classList.add('show');
        }
    })
});

const hiddenElements = document.querySelectorAll('.hidden');

hiddenElements.forEach((element) => observer.observe(element));

// Sign up + login functionality

const l_user = document.getElementById("signInUsername");
const l_pass = document.getElementById("signInPassword");
const s_user = document.getElementById("signUpUsername");
const s_pass = document.getElementById("signUpPassword");
const s_email = document.getElementById("signUpEmail");
const l_btn = document.getElementById("signInBtnM");
const s_btn = document.getElementById("signUpBtnM");

l_btn.addEventListener("mousedown", async () => {
    let [success, reason] = await UserGateway.login(l_user.value, l_pass.value);
    if(!success) return;
    window.location.href = "/home";
});
s_btn.addEventListener("mousedown", async () => {
    let [success, reason] = await UserGateway.signup(s_user.value, s_pass.value, s_email.value);
    if(!success) return;
    window.location.href = "/home";
});