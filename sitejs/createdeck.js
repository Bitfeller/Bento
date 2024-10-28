import { UserGateway } from "../server/client-gateway/user-gateway.js";
import { DeckGateway } from "../server/client-gateway/deck-gateway.js";
import { DeckBind } from "./client-modules/deck-lib.js";

let userdata_save;
const desc = document.getElementById("description");
const cardContain = document.getElementById("cardcontain");
const createBtn = document.getElementById("create");
const errmsg = document.getElementById("create-err");
const draftdecks_history = document.getElementById("draftdecks-history");
let last = 0;

createBtn.addEventListener('mousedown', async () => {
    let res = DeckBind.toDeck((v) => errmsg.innerHTML = v, false, (Date.now() - last) < 5000);
    last = Date.now();
    if(!res) return;
    let [name, deckpic, data, isPublic] = res; // unpack
    let [success, reason] = await DeckGateway.add(name, deckpic || "", JSON.stringify(data), isPublic);
    if(!success) 
        switch(reason) {
            case "no session":
                errmsg.innerHTML = "Looks like you're not logged in! We can't create this deck unless you log in again. (If you'd like, open another tab and login there.)";
            break;
            case "invalid name":
                errmsg.innerHTML = "That name has invalid characters or is empty. (Valid characters include dashes, a-z, A-Z, and 0-9)";
            break;
            case "name exists":
                errmsg.innerHTML = "You've already created another deck with that name";
            break;
            case "size limit":
                errmsg.innerHTML = "Looks like the deck's image exceeds the size limit of 2 MB.";
            break;
            case "same problem":
                errmsg.innerHTML = "It seems like two or more cards in your deck have the exact same question. (We currently don't support duplicate questions.)";
            break;
            default:
                console.log(reason);
                errmsg.innerHTML = "Looks like there's an issue on our side. Try again later.";
            break;
        }
    else window.location.href = "/home?l=cd&s=1";
});

(async () => {
    await DeckBind.init();
    let user = DeckBind.user();
    userdata_save = user.userdata;
    let keys = Object.keys(user.userdata.draftdecks);
    if(keys.length > 0) draftdecks_history.innerHTML = "";
    for(let i = 0; i < keys.length; i++) {
        let time = parseInt(keys[i]);
        let diff = Date.now() - time;
        let deck = user.userdata.draftdecks[keys[i]];
        let div = document.createElement("div");
        div.className = "draftdeck";
        div.innerHTML = `
            <p>${diff > 2 * 24 * 60 * 60 * 1000 ? "A while ago" : (diff > 24 * 60 * 60 * 1000 ? "Yesterday" : (diff > 12 * 60 * 60 * 1000 ? "Today" : (diff > 5 * 60 * 1000 ? "This hour" : "Moments ago")))}</p>
            <div><button class='show'><span class="material-symbols-outlined">resume</span></button>
            <button class='del'><span class="material-symbols-outlined">delete</span></button></div>`;
        draftdecks_history.appendChild(div);
        div.getElementsByClassName("show")[0].addEventListener("mousedown", () => {
            cardContain.innerHTML = "";
            DeckBind.appendToCards(deck.contnt);
        });
        div.getElementsByClassName("del")[0].addEventListener("mousedown", async () => {
            div.remove();
            delete user.userdata.draftdecks[keys[i]];
            delete userdata_save.draftdecks[keys[i]];
            let copy = JSON.stringify(userdata_save);
            await UserGateway.editUser("userdata", copy);
        });
    }
    window.setInterval(async () => {
        let copy = structuredClone(userdata_save);
        let res = DeckBind.toDeck(() => {}, true);
        if(!res) return;
        let [_, __, data, ___] = res; // unpack
        if(Object.keys(data.contnt).length == 0) return;
        copy.draftdecks[String(Date.now())] = data;
        if(Object.keys(copy.draftdecks).length > 5) {
            let keys = Object.keys(copy.draftdecks);
            let newKeys = [];
            keys.forEach((val) => newKeys.push(parseInt(val)));
            let min = Math.min(...newKeys);
            delete copy.draftdecks[String(min)];
        }
        copy = JSON.stringify(copy);
        await UserGateway.editUser("userdata", copy);
    }, 15_000);
    window.LOADED();
})();

const b_modal = document.getElementById("bento-import-modal");
const q_modal = document.getElementById("quizlet-import-modal");
const g_modal = document.getElementById("gimkit-import-modal");

const b_importbtn = document.getElementById("bento-import-btn");
const b_replacename = document.getElementById("BI-replace-name");
const b_replacedesc = document.getElementById("BI-replace-desc");
const b_file = document.getElementById("BI-file");
const b_createbtn = document.getElementById("BI-createBtn");
const b_err = document.getElementById("BI-err");

const q_importbtn = document.getElementById("quizlet-import-btn");
const q_txt = document.getElementById("QI-importText");
const q_createbtn = document.getElementById("QI-createBtn");
const q_reverse = document.getElementById("QI-reverse");
const q_err = document.getElementById("QI-err");

const g_importbtn = document.getElementById("gimkit-import-btn");
const g_txt = document.getElementById("GK-importText");
const g_createbtn = document.getElementById("GK-createBtn");
const g_err = document.getElementById("GK-err");
b_importbtn.addEventListener("mousedown", () => b_modal.style.display = "block");
q_importbtn.addEventListener("mousedown", () => q_modal.style.display = "block");
g_importbtn.addEventListener("mousedown", () => g_modal.style.display = "block");

b_createbtn.addEventListener("mousedown", () => {
    let files = b_file.files;
    if(files && files[0]) {
        let file = files[0];
        if(file.type !== "text/plain") return console.log('failed - file type; ' + file.type);
        let reader = new FileReader();
        reader.onload = (e) => {
            let content = e.target.result;
            try {
                let main = JSON.parse(content);
                if(main.name == undefined || !main.desc == undefined || !main.contnt == undefined) return void (b_err.innerHTML = "This file seems to be corrupted, formatted incorrectly, or isn't a valid Bento deck.");
                let val_name = main.name;
                let val_desc = main.desc;
                let val_contnt = main.contnt;
                if(b_replacename.checked) name.value = val_name;
                if(b_replacedesc.checked) desc.value = val_desc;
                try {
                    DeckBind.appendToCards(val_contnt);
                    b_modal.style.display = "none";
                } catch(e) {
                    return void (b_err.innerHTML = "This file seems to be corrupted, formatted incorrectly, or isn't a valid Bento deck.");
                }
            } catch(e) {
                console.log("failed; reason:", e);
            }
        }
        reader.readAsText(file);
    }
});
q_createbtn.addEventListener("mousedown", () => {
    let importText = q_txt.value;
    let format = importText.split("^");
    let contnt = {};
    if(format.length == 1) return void (q_err.innerHTML = "This export doesn't seem to be formatted properly, or isn't a valid Quizlet export.");
    format.pop();
    let isValid = true;
    format.forEach(card => {
        if(!isValid) return;
        const [q, ans] = card.split(">");
        if(ans == undefined) {
            q_err.innerHTML = "This export doesn't seem to be formatted properly, or isn't a valid Quizlet export.";
            isValid = false;
            return;
        }
        if(q_reverse.checked) contnt[ans] = {type: "txt", ans: q}; else contnt[q] = {type: "txt", ans};
    });
    if(!isValid) return;
    try {
        DeckBind.appendToCards(contnt);
    } catch(e) {
        return void (q_err.innerHTML = "This export doesn't seem to be formatted properly, or isn't a valid Quizlet export.");
    }
    q_modal.style.display = "none";
});
g_createbtn.addEventListener("mousedown", () => {
    let importText = g_txt.value;
    let format = importText.split("\n");
    let contnt = {};
    let isValid = true;
    format.forEach(card => {
        if(!isValid) return;
        const [q, ans] = card.split("\t");
        if(ans == undefined) {
            g_err.innerHTML = "This export doesn't seem to be formatted properly, or isn't a valid Gimkit export.";
            isValid = false;
            return;
        }
        contnt[q] = {
            type: "txt",
            ans
        };
    });
    if(!isValid) return;
    try {
        DeckBind.appendToCards(contnt);
    } catch(e) {
        return void (g_err.innerHTML = "This export doesn't seem to be formatted properly, or isn't a valid Gimkit export.");
    }
    g_modal.style.display = "none";
});
window.addEventListener("mousedown", (e) => {
    if(e.target === b_modal || e.target == q_modal || e.target == g_modal) {
        b_modal.style.display = "none";
        q_modal.style.display = "none";
        g_modal.style.display = "none";
    }
});