import { UserGateway } from '../server/client-gateway/user-gateway.js';

const resend = document.getElementById('resend');
const resendSuccess = document.getElementById('resend-suc');

const changePwd = document.getElementById('change-pwd');
const email = document.getElementById('change-email');
const changeEmailBtn = document.getElementById('change-email-btn');
const changeSuccess = document.getElementById('change-suc');
const delaccPwd = document.getElementById('curr-pwd');
const delaccBtn = document.getElementById('delacc-btn');

let confirmTick = 0;

resend.addEventListener('mousedown', async () => {
    let [success, err] = await UserGateway.editUser('resend-verif-email', '');
    if(success) resendSuccess.innerHTML = "We sent you another verification email.";
    else if(!success) {
        resendSuccess.innerHTML = "";
        if(err == 'timeout') window.SHOW_ERROR("You can only send a verification email every 5 minutes. Wait less than 5 minutes...");
        else window.SHOW_ERROR("Looks like there's something wrong on our side. Try again later.");
    }
});
changeEmailBtn.addEventListener('mousedown', async () => {
    let [success, err] = await UserGateway.editUser('email', email.value, changePwd.value);
    if(success) changeSuccess.innerHTML = "Email changed successfully.";
    else {
        changeSuccess.innerHTML = "";
        switch(err) {
            case 'invalid pwd':
                window.SHOW_ERROR("Wrong password.");
            break;
            case 'invalid email':
                window.SHOW_ERROR("That email isn't valid.");
            break;
            case 'email taken':
                window.SHOW_ERROR("That email is already taken.");
            break;
            default:
                window.SHOW_ERROR("Looks like there's something wrong on our side. Try again later.");
            break;
        }
    }
});
delaccBtn.addEventListener('mousedown', async () => {
    if(Date.now() - confirmTick > 5000) {
        confirmTick = Date.now();
        delaccBtn.innerHTML = "Are you sure?";
        window.setTimeout(() => {
            delaccBtn.innerHTML = "Delete Account";
        });
        return;
    }
    let [s, err] = await UserGateway.editUser('delete', '', delaccPwd.value);
    if(s) window.location.href = '/login';
    else {
        switch(err) {
            case 'invalid pwd':
                window.SHOW_ERROR("Wrong password.");
            break;
            default:
                window.SHOW_ERROR("Looks like there's something wrong on our side. Try again later.");
            break;
        }
    }
});

window.LOADED();