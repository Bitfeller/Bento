import { UserGateway } from "../server/client-gateway/user-gateway.js";

let user;

const pfp = document.getElementById("pfp");
const editpfp = document.getElementById("pfpAddBtn");
const pfpReset = document.getElementById("pfpReset");
const fileSelectTrigger = document.getElementById("fileselecttrigger");

const emailfield = document.getElementById("emailfield");
const e_currpwd = document.getElementById("e_currpwd");
const emailbtn = document.getElementById("emailbtn");
const pwdfield = document.getElementById("pwdfield");
const currPwd = document.getElementById("currpwd");
const pwdbtn = document.getElementById("pwdbtn");
const userfield = document.getElementById("userfield");
const userbtn = document.getElementById("userbtn");

const delacc = document.getElementById("delacc");
const resetacc = document.getElementById("resetacc");

const warningDialog = document.getElementById("warningdialog");
const leaveBtn = document.getElementById("leave");
const wd_main = document.getElementsByClassName("main")[0];

const usernameEl = document.getElementById("username");

const themeSelect = document.getElementById("theme-select");

// main
(async () => {
    let [success, data] = await UserGateway.getuser(true, true, false, false);
    if(!success) console.error(data);
    user = data;
    usernameEl.innerHTML = user.username;
    if(user.pfp && user.pfp.length > 0) {
        pfp.src = user.pfp;
    }
    editpfp.addEventListener("mousedown", () => fileSelectTrigger.click()); // show file upload option
    pfpReset.addEventListener("mousedown", async () => {
        pfp.src = "../../img/defaultpfp.png";
        await UserGateway.editUser("pfp", "");
        window.location.reload();
    })
    fileSelectTrigger.addEventListener('change', () => {
        let files = fileSelectTrigger.files;
        if(files && files[0]) {
            let file = files[0];
            if(!file.type.startsWith("image/")) return console.log('failed - file type; ' + file.type);
            let reader = new FileReader();
            reader.onload = async (e) => {
                let content = e.target.result;
                if(content.byteLength > 3 * 1000 * 100) return console.log("Failed! Past size limit of 3 MB.");
                await UserGateway.editUser("pfp", content);
                window.location.reload();
            }
            reader.readAsDataURL(file);
        }
    });
    emailbtn.addEventListener("mousedown", async () => {
        if(emailfield.value == "" || e_currpwd.value == "") return;
        await UserGateway.editUser("email", emailfield.value, e_currpwd.value);
        window.location.reload();
    });
    pwdbtn.addEventListener("mousedown", async () => {
        if(pwdfield.value == "" || currPwd.value == "") return;
        await UserGateway.editUser("password", pwdfield.value, currPwd.value);
        window.location.reload();
    });
    userbtn.addEventListener("mousedown", async () => {
        if(userfield.value == "") return;
        await UserGateway.editUser("username", userfield.value);
        window.location.reload();
    });
    delacc.addEventListener("mousedown", () => {
        warningDialog.showModal();
        wd_main.innerHTML = `
            <p>Once you delete your account, you won't be able to recover it again.</p><br>
            <p>Enter your current password to continue...</p>
            <input type='password' class='password-field' placeholder='Current Password'><br><br><br>
            <button class='confirm'>Delete Account</button> or 
            <button class='go_back'>Go Back</button>
        `;
        const pwd = wd_main.getElementsByClassName('password-field')[0];
        const confirm = wd_main.getElementsByClassName('confirm')[0];
        const goBack = wd_main.getElementsByClassName('go_back')[0];
        confirm.addEventListener("mousedown", async () => {
            if(pwd.value == "") return;
            await UserGateway.editUser('delete', '', pwd.value); // got too lazy to make another script for this function
            window.location.reload();
        });
        goBack.addEventListener("mousedown", () => warningDialog.close());
    });
    resetacc.addEventListener("mousedown", () => {
        warningDialog.showModal();
        wd_main.innerHTML = `
            <p>Once you reset your account, all of your user data and preferences (reviews, draft decks, theme preferences, etc.) will be deleted.</p><br><br>
            <button class='confirm'>Reset Account</button> or 
            <button class='go_back'>Go Back</button>
        `;
        const confirm = wd_main.getElementsByClassName('confirm')[0];
        const goBack = wd_main.getElementsByClassName('go_back')[0];
        confirm.addEventListener("mousedown", async () => {
            await UserGateway.editUser("userdata", '{"reviews":{},"draftdecks":{},"theme":0}');
            warningDialog.close();
            window.location.reload();
        });
        goBack.addEventListener("mousedown", () => warningDialog.close());
    });
    leaveBtn.addEventListener("mousedown", () => warningDialog.close());
    themeSelect.selectedIndex = data.userdata.theme;
    themeSelect.addEventListener("change", async () => {
        data.userdata.theme = themeSelect.selectedIndex ?? 0;
        await UserGateway.editUser('theme', "" + data.userdata.theme);
        window.location.reload();
    });
})();

window.onclick = (e) => {
    if(e.target == warningDialog) warningDialog.close();
}