// Mode - defines the mode you want to see.
// 0 - EMAIL VERIFICATION - shows you the default screen for verifying your email.
// 1 - PASSWORD RESET - shows you the default screen for resetting your password.
const MODE = 1;
// No requests are made to the main server; all generated responses and messages are programmatically controlled.



// Imported in the main script; kept here as a reference.
// import { UserGateway } from '../server/client-gateway/user-gateway.js';

const section = document.getElementsByClassName('holder')[0];
const newPassword = document.getElementById('new-password');
const resetPwdBtn = document.getElementById('changepwd');
const error = document.getElementsByClassName('info-error')[0];
const passwordInputs = document.getElementsByClassName('password-inputs')[0];

(async () => {
    const params = new URLSearchParams("?hash=abc123&v=" + MODE + "&user=TEST_USER");
    if(!params.get("hash") || !params.get("v") || !params.get("user")) {
        window.LOAD_ERROR("Looks like that URL is invalid. Did you come here from an email?");
        return;
    }
    let hash = params.get("hash");
    let mode = params.get("v") == 0 ? "emailverif" : "pwdrecover";
    let user = parseInt(params.get("user"));
    // let [success, _] = await UserGateway.userdir(mode, user, hash);
    // if(!success) {
    //     window.LOAD_ERROR("Looks like that URL is invalid. Did you come here from an email?");
    //     return;
    // }
    if(mode == 'emailverif') {
        section.innerHTML = "<h1>You're all set!</h1><p>Your email's been verified. Thanks!</p><p>You can close this window when you're done.</p>";
        passwordInputs.style.display = 'none';
        window.LOADED();
        return;
    } else if (mode == 'pwdrecover') {
        section.innerHTML = "<h1>Reset your password</h1>";
    }
    let handled = false;
    let tick = Date.now();
    resetPwdBtn.addEventListener('mousedown', async () => {
        if(handled) return;
        if(newPassword.value == "") return;
        if(Date.now() > tick) {
            handled = true;
            error.innerHTML = "For security purposes, there's only a 10 minute window between opening this site and resetting your password. Reload this page to restart that window, and then try again.";
        }
        error.className = 'info-success';
        error.innerHTML = "Success! Your password has been reset. You can close this page now and login normally when you're done.";
        handled = true;
    });
    window.LOADED();
})();