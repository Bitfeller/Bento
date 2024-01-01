import { DeckGateway } from "../server/client-gateway/deck-gateway.js";
import { DeckBind } from "./client-modules/deck-lib.js";
// Other objects
const name = document.getElementById("name");
const isPublic = document.getElementById("isPublic");
const description = document.getElementById("description");
const cardContain = document.getElementById("cardcontain");
const createBtn = document.getElementById("create");
const errmsg = document.getElementById("edit-err");
const picimg = document.getElementById("deckpic");
// Deck
let deck, last = 0;

createBtn.addEventListener('mousedown', async () => {
    let res = DeckBind.toDeck((v) => errmsg.innerHTML = v, false, (Date.now() - last) < 5000);
    last = Date.now();
    if(!res) return;
    let [name, deckpic, data, isPublic] = res; // unpack
    let [s1, res1] = await DeckGateway.modify(deck, "name", name);
    let [s2, res2] = await DeckGateway.modify(deck, "deckpic", deckpic);
    let [s3, res3] = await DeckGateway.modify(deck, "public", isPublic ? "1" : "0");
    let [s4, res4] = await DeckGateway.modify(deck, "data", JSON.stringify(data));
    if(!s1) {
        switch(res1) {
            case "no session":
                errmsg.innerHTML = "Looks like you're not logged in! We can't create this deck unless you log in again. (If you'd like, open another tab and login there.)";
            break;
            case "invalid name":
                errmsg.innerHTML = "That name has invalid characters or is empty. (Valid characters include dashes, a-z, A-Z, and 0-9)";
            break;
            case "name taken":
                errmsg.innerHTML = "You've already created another deck with that name";
            break;
            default:
                console.log(res1);
                errmsg.innerHTML = "Looks like there's an issue on our side. Try again later.";
            break;
        }
        return;
    }
    if(!s2) {
        switch(res2) {
            case "size limit":
                errmsg.innerHTML = "Looks like the deck's image exceeds the size limit of 2 MB.";
            break;
            default:
                console.log(res2);
                errmsg.innerHTML = "Looks like there's an issue on our side. Try again later.";
            break;
        }
        return;
    }
    if(!s3) {
        console.log(res3);
        errmsg.innerHTML = "Looks like there's an issue on our side. Try again later.";
        return;
    }
    if(!s4) {
        switch(res4) {
            case "same problem":
                errmsg.innerHTML = "It seems like two or more cards in your deck have the exact same question. (We currently don't support duplicate questions.)";
            break;
            default:        
                console.log(res4);
                errmsg.innerHTML = "Looks like there's an issue on our side. Try again later.";
            break;
        }
        return;
    }
    window.location.href = "/home?l=ed&s=1";
});

(async () => {
    await DeckBind.init();
    let data = DeckBind.user();
    const paramList = new URLSearchParams(window.location.search);
    if(!paramList.get("d")) return errmsg.innerHTML = "Looks like there was an error. Go back to where you came from, and try again. (If you continue to experience errors, please inform us.)";
    deck = parseInt(paramList.get('d'));
    let [success, contnt] = await DeckGateway.get(deck, true, true);
    if(!success) window.location.href = "/home";
    if(contnt.owner != data.username) window.location.href = "/home";
    name.value = window.lib.decode(contnt.name);
    if(contnt.deckpic && contnt.deckpic.length > 0) picimg.src = contnt.deckpic;
    isPublic.checked = contnt.public;
    description.value = window.lib.decode(contnt.data.desc);
    cardContain.innerHTML = "";
    DeckBind.appendToCards(contnt.data.contnt);
    window.LOADED();
})();