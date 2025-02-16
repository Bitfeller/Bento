import { UserGateway } from '../server/client-gateway/user-gateway.js';

const section = document.getElementsByClassName('holder')[0];
const newPassword = document.getElementById('new-password');
const resetPwdBtn = document.getElementById('changepwd');
const successEl = document.getElementsByClassName('info-success')[0];
const passwordInputs = document.getElementsByClassName('password-inputs')[0];

(async () => {
    const params = new URLSearchParams(window.location.search);
    if(!params.get("hash") || !params.get("v") || !params.get("user")) return void (location.href = "/home");
    let hash = params.get("hash");
    let mode = params.get("v") == 0 ? "emailverif" : "pwdrecover";
    let user = parseInt(params.get("user"));
    let [success, _] = await UserGateway.userdir(mode, user, hash);
    if(!success) return window.LOAD_ERROR("Looks like that URL is invalid. Did you come here from an email?");
    if(mode == 'emailverif') {
        section.innerHTML = "<h1>You're all set!</h1><p>Your email's been verified. Thanks!</p><p>You can close this window when you're done.</p>";
        passwordInputs.style.display = 'none';
        return window.LOADED();
    } else if (mode == 'pwdrecover') section.innerHTML = "<h1>Reset your password</h1>";
    let handled = false;
    resetPwdBtn.addEventListener('mousedown', async () => {
        if(handled) return;
        let [success, data] = await UserGateway.userdir('newpwd', user, hash, newPassword.value);
        if(!success) {
            switch(data) {
                case 'not valid':
                    window.SHOW_ERROR("Looks like there's an issue on our side. Try again later.");
                break;
                case 'past time':
                    handled = true;
                    window.SHOW_ERROR("For security purposes, there's only a 10 minute window between opening this site and resetting your password. Reload this page to restart that window, and then try again.");
                break;
                case 'no pwd':
                    window.SHOW_ERROR("Did you specify a password?");
                break;
                default:
                    console.log(data);
                    window.SHOW_ERROR("Looks like there's an issue on our side. Try again later.");
                break;
            }
        } else {
            successEl.innerHTML = "Success! Your password has been reset. You can close this page now and login normally when you're done.";
            handled = true;
        }
    });
    window.LOADED();
})();