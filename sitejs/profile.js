import { UserGateway } from "../server/client-gateway/user-gateway.js";

let user;

const pfp = document.getElementById("pfp");
const editpfp = document.getElementById("pfpAddBtn");
const pfpReset = document.getElementById("pfpResetBtn");
const fileSelectTrigger = document.getElementById("fileselecttrigger");

const newEmailField = document.getElementById("email");
const emailCurrPassword = document.getElementById("email-curr-password");
const emailbtn = document.getElementById("change-email");
const emailerr = document.getElementById("email-error");

const pwdfield = document.getElementById("password");
const currentPassword = document.getElementById("password-curr-password");
const passwordButton = document.getElementById("change-password");
const passwordError = document.getElementById("password-error");

const usernameField = document.getElementById("new-username");
const usernameButton = document.getElementById("submit-username");
const usernameDisplay = document.getElementById("username");
const usernameError = document.getElementById("username-error");

const warningDialog = document.getElementById("warning-dialog");
const deleteAccount = document.getElementById("delete-account");
const resetAccount = document.getElementById("reset-account");


const nordRadio = document.getElementById("nord-radio");
const coffeeMidnightRadio = document.getElementById("coffee-midnight-radio");
const catppuccinRadio = document.getElementById("catppuccin-radio");
// const grayscaleRadio = document.getElementById("grayscale-radio");

async function changeTheme(current, theme) {
    if(current == theme) return;
    await UserGateway.editUser('theme', "" + theme);
    window.location.reload();
}
// main
(async () => {
    let [success, data] = await UserGateway.getuser(true, true, false, false);
    if(!success) console.error(data);
    user = data;

    usernameDisplay.innerHTML = user.username;
    if(user.pfp && user.pfp.length > 0) pfp.src = user.pfp;
    editpfp.addEventListener("mousedown", () => fileSelectTrigger.click()); // show file upload option
    pfpReset.addEventListener("mousedown", async () => {
        pfp.src = "../../img/defaultpfp.png";
        await UserGateway.editUser("pfp", "");
        window.location.reload();
    });

    fileSelectTrigger.addEventListener('change', () => {
        let files = fileSelectTrigger.files;
        if(files && files[0]) {
            let file = files[0];
            if(!file.type.startsWith("image/")) return console.log('failed - file type; ' + file.type);
            let reader = new FileReader();
            reader.onload = async e => {
                let content = e.target.result;
                if(content.byteLength > 3 * 1000 * 100) return console.log("Failed! Past size limit of 3 MB.");
                await UserGateway.editUser("pfp", content);
                window.location.reload();
            }
            reader.readAsDataURL(file);
        }
    });

    emailbtn.addEventListener("mousedown", async () => {
        if(newEmailField.value == "" || emailCurrPassword.value == "") return;
        await UserGateway.editUser("email", newEmailField.value, emailCurrPassword.value);
        window.location.reload();
    });
    passwordButton.addEventListener("mousedown", async () => {
        if(pwdfield.value == "" || currentPassword.value == "") return;
        await UserGateway.editUser("password", pwdfield.value, currentPassword.value);
        window.location.reload();
    });
    usernameButton.addEventListener("mousedown", async () => {
        if(usernameField.value == "") return;
        await UserGateway.editUser("username", usernameField.value);
        window.location.reload();
    });

    deleteAccount.addEventListener("mousedown", async () => {
        warningDialog.showModal();
        warningDialog.innerHTML = `
            <h2>Are You Sure?</h2>
            <p>This action is irreversible and will remove all of your data from our servers.</p>
            <br>
            <p>Enter your current password to continue...</p>
            <input type="password" id="delete-account-password" placeholder="Current Password">
            <div class="dialog-button-container">
                <button id="delete-account-confirm">Delete Account</button>
                <button id="delete-account-cancel">Cancel</button>
            </div>
        `;
        const deleteAccountPassword = document.getElementById("delete-account-password");
        const deleteAccountConfirm = document.getElementById("delete-account-confirm");
        const deleteAccountCancel = document.getElementById("delete-account-cancel");
        deleteAccountConfirm.addEventListener("mousedown", async () => {
            if(deleteAccountPassword.value == "") return;
            await UserGateway.editUser("delete", "", deleteAccountPassword.value);
            window.location.reload();
        });
        deleteAccountCancel.addEventListener("mousedown", () => warningDialog.close());
    });
    resetAccount.addEventListener("mousedown", async () => {
        warningDialog.showModal();
        warningDialog.innerHTML = `
            <h2>Are You Sure?</h2>
            <p>Once you reset your account, all of your user data and preferences (reviews, draft decks, theme preferences, etc.) will be deleted.</p>
            <br>
            <p>Enter your current password to continue...</p>
            <input type="password" id="reset-account-password" placeholder="Current Password">
            <div class="dialog-button-container">
                <button id="reset-account-confirm">Reset Account</button>
                <button id="reset-account-cancel">Cancel</button>
            </div>
        `;
        const resetAccountPassword = document.getElementById("reset-account-password");
        const resetAccountConfirm = document.getElementById("reset-account-confirm");
        const resetAccountCancel = document.getElementById("reset-account-cancel");
        resetAccountConfirm.addEventListener("mousedown", async () => {
            if(resetAccountPassword.value == "") return;
            await UserGateway.editUser("userdata", '{"reviews":{},"draftdecks":{},"theme":0}', resetAccountPassword.value);
            warningDialog.close();
            window.location.reload();
        });
        resetAccountCancel.addEventListener("mousedown", () => warningDialog.close());
    });
    let currentTheme = data.userdata.theme;
    
    if(currentTheme == 0) nordRadio.checked = true;
    else if(currentTheme == 1) coffeeMidnightRadio.checked = true;
    else if(currentTheme == 2) catppuccinRadio.checked = true;
    // else if(currentTheme == 3) grayscaleRadio.checked = true;

    nordRadio.addEventListener("change", () => changeTheme(currentTheme, 0));
    coffeeMidnightRadio.addEventListener("change", () => changeTheme(currentTheme, 1));
    catppuccinRadio.addEventListener("change", () => changeTheme(currentTheme, 2));
    // grayscaleRadio.addEventListener("change", () => changeTheme(currentTheme, 3));
})();
window.onclick = e => {
    if(e.target == warningDialog) warningDialog.close();
};