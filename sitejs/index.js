import { UserGateway } from "../server/client-gateway/user-gateway.js";

// Check if user is signed in

(async () => {
    let [success, _] = await UserGateway.getuser(false, false, false, false);
    if(success) window.location.href = "/home";
})();

// Modal code

// const signInModal = document.getElementById('signInModal');
// const signUpModal = document.getElementById('signUpModal');

// const signUpBtn = document.getElementById('signUpBtn');
// const ctaButton = document.getElementById('cta-button');
// const signInBtn = document.getElementById('signInBtn');

// signInBtn.onclick = () => signInModal.style.display = "block";
// signUpBtn.onclick = () => signUpModal.style.display = "block";
// ctaButton.onclick = () => signUpModal.style.display = "block";

// window.onclick = e => {
//     if (e.target == signInModal || e.target == signUpModal) {
//         signInModal.style.display = "none";
//         signUpModal.style.display = "none";
//     }
// }

// Scroll Animation Code
const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add('show');
    });
});

const hiddenElements = document.querySelectorAll('.hidden');

hiddenElements.forEach(el => observer.observe(el));

// Sign up + login functionality

// const l_user = document.getElementById("signInUsername");
// const l_pass = document.getElementById("signInPassword");
// const s_user = document.getElementById("signUpUsername");
// const s_pass = document.getElementById("signUpPassword");
// const s_pass2 = document.getElementById("signUpPassword2");
// const s_email = document.getElementById("signUpEmail");
// const l_btn = document.getElementById("signInBtn");
// const s_btn = document.getElementById("signUpBtn");

// async function l_fn() {
//     let [success, reason] = await UserGateway.login(l_user.value, l_pass.value);
//     if(!success) {
//         switch(reason) {
//             case "bad u/p":
//                 window.SHOW_ERROR("Bad username or password.");
//             break;
//             default:
//                 console.log(reason);
//                 window.SHOW_ERROR("Looks like there's an issue on our side. Try again later.");
//             break;
//         }
//         return;
//     }
//     window.location.href = "/home";
// }
// async function s_fn() {
//     if(s_pass.value != s_pass2.value) return window.SHOW_ERROR("Passwords don't match!");
//     let [success, reason] = await UserGateway.signup(s_user.value, s_pass.value, s_email.value);
//     if(!success) {
//         switch(reason) {
//             case "bad pwd":
//                 window.SHOW_ERROR("Password is either common or less than 8 characters long.");
//             break;
//             case "invalid username":
//                 window.SHOW_ERROR("That username has invalid characters. (Valid characters include a-z, A-Z, and 0-9)");
//             break;
//             case "flagged":
//                 window.SHOW_ERROR("Your username was flagged for inappropriate content.");
//             break;
//             case "invalid email":
//                 window.SHOW_ERROR("Please enter in a valid email.");
//             break;
//             case "user exists":
//                 window.SHOW_ERROR("That username/email is already taken.");
//             break;
//             case "autologin":
//                 window.SHOW_ERROR("We successfully made an account for you; but we failed to log you in automatically. Try logging in with your new account manually.");
//             break;
//             default:
//                 console.log(reason);
//                 window.SHOW_ERROR("Looks like there's an issue on our side. Try again later.");
//             break;
//         }
//         return;
//     }
//     window.location.href = "/home?new=1";
// }
// l_btn.addEventListener("mousedown", l_fn);
// s_btn.addEventListener("mousedown", s_fn);

// [l_user, l_pass].forEach(el => {
//     el.addEventListener("keydown", e => {
//         if(e.key == "Enter") l_fn();
//     });
// });
// [s_user, s_email, s_pass, s_pass2].forEach(el => {
//     el.addEventListener("keydown", e => {
//         if(e.key == "Enter") s_fn();
//     });
// });