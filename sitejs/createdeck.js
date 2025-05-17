import { UserGateway } from "../server/client-gateway/user-gateway.js";
import { DeckGateway } from "../server/client-gateway/deck-gateway.js";
import { DeckBind } from "./client-modules/deck-lib.js";

const title = document.getElementById("name");
const desc = document.getElementById("description");
const deckpic = document.getElementById("deckpic");
const ispub = document.getElementById("isPublic");

const cardContain = document.getElementById("cardcontain");
const createBtn = document.getElementById("create");
const draftdecks_history = document.getElementById("draftdecks-history");

let lastTick = 0;

createBtn.addEventListener('mousedown', async () => {
    let res = DeckBind.toDeck(v => window.SHOW_ERROR(v), false, Date.now() - lastTick < 5000);
    lastTick = Date.now();
    if(!res) return;
    let [name, deckpic, data, isPublic] = res; // unpack
    console.log(data.tags);
    let [success, reason] = await DeckGateway.add(name, deckpic || "", JSON.stringify(data), isPublic);
    if(!success) 
        switch(reason) {
            case "no session":
                window.SHOW_ERROR("Looks like you're not logged in! We can't create this deck unless you log in again. (If you'd like, open another tab and login there.)");
            break;
            case "invalid name":
                window.SHOW_ERROR("That name has invalid characters or is empty. (Valid characters include dashes, a-z, A-Z, and 0-9)");
            break;
            case "invalid tag":
                window.SHOW_ERROR("One of your tags are invalid.");
            break;
            case "flagged":
                window.SHOW_ERROR("Your deck was flagged for inappropriate content.");
            break;
            case "name exists":
                window.SHOW_ERROR("You've already created another deck with that name");
            break;
            case "size limit":
                window.SHOW_ERROR("Looks like the deck's image exceeds the size limit of 2 MB.");
            break;
            case "same problem":
                window.SHOW_ERROR("It seems like two or more cards in your deck have the exact same question. (We currently don't support duplicate questions.)");
            break;
            default:
                console.log(reason);
                window.SHOW_ERROR("Looks like there's an issue on our side. Try again later.");
            break;
        }
    else window.location.href = "/home?l=cd&s=1";
});
// tagInput.addEventListener('keydown', (e) => {
//     if (e.key == 'Enter') {
//         e.preventDefault(); 
//         console.log(tagInput.value)
//         tags.innerHTML += /*html*/`                
//             <div class="tag remove-tag">
//                 <div class="material-symbols-outlined">remove</div>
//                 <p>${tagInput.value}</p>
//             </div>
//         `;
//         tagInput.value = '';
//         tagInput.focus();
//     }
// });

(async () => {
    await DeckBind.init();
    let user = DeckBind.user();
    let drafts_save = user.userdata.draftdecks;
    let keys = Object.keys(user.userdata.draftdecks);
    if(keys.length > 0) draftdecks_history.innerHTML = "";
    for(let i = 0; i < keys.length; i++) {
        let time = parseInt(keys[i]);
        let date = new Date(time);
        let deck = user.userdata.draftdecks[keys[i]];
        let div = document.createElement("div");
        div.className = "draftdeck";
        let month = "0".repeat(2 - String(date.getMonth()).length) + date.getMonth();
        let day = "0".repeat(2 - String(date.getDate()).length) + date.getDate();
        let min = "0".repeat(2 - String(date.getMinutes()).length) + date.getMinutes();
        div.innerHTML = `
            <p>${date.toLocaleString('en-us', { weekday: 'short' })} ${month}/${day}/${date.getFullYear().toString().slice(2)}, ${date.getHours()}:${min}</p>
            <div><button class='show'><span class="material-symbols-outlined">resume</span></button>
            <button class='del'><span class="material-symbols-outlined">delete</span></button></div>`;
        draftdecks_history.appendChild(div);
        div.getElementsByClassName("show")[0].addEventListener("mousedown", async () => {
            cardContain.innerHTML = "";
            DeckBind.appendToCards(deck.contnt);
            DeckBind.appendTags(window.lib.recur_decode(deck.tags));
            title.value = window.lib.decode(deck.name);
            desc.value = window.lib.decode(deck.desc);
            ispub.checked = deck.pub;
            let [success, img] = await UserGateway.getDraftImage(time);
            if(!success) return void console.warn("Couldn't get draft img: " + img);
            deckpic.src = img && img.length > 0 ? img : "../../img/defaultdeckpic.png";
        });
        div.getElementsByClassName("del")[0].addEventListener("mousedown", async () => {
            div.remove();
            if(Object.keys(user.userdata.draftdecks).length == 1) draftdecks_history.innerHTML = "<p class='info-blank'>-- You don't have any draft decks. You'll see one if you start making a deck but don't finish. --</p>";
            delete user.userdata.draftdecks[keys[i]];
            delete drafts_save[keys[i]];
            await UserGateway.editUser("draftdecks", JSON.stringify(drafts_save));
        });
    }
    window.setInterval(async () => {
        let copy = window.lib.recur_decode(structuredClone(drafts_save));
        let res = DeckBind.toDeck(() => {}, true);
        if(!res) return;
        let [name, img, data, pub] = res; // unpack
        if(Object.keys(data.contnt).length == 0) return;
        data.name = name;
        data.img = img;
        data.pub = pub;
        copy[String(Date.now())] = data;
        if(Object.keys(copy).length > 5) {
            let keys = Object.keys(copy);
            let newKeys = [];
            keys.forEach(val => newKeys.push(parseInt(val)));
            let min = Math.min(...newKeys);
            delete copy[String(min)];
        }
        await UserGateway.editUser("draftdecks", JSON.stringify(copy));
    }, 15_000);
    window.LOADED();
})();