import { UserGateway } from "../main/user_gateway.js";
import { DeckGateway } from "../main/deck_gateway.js";

const mainContainer = document.getElementById("overall-container");
const deckContainer = document.getElementById("deck-container");
const reviewBtn = document.getElementById("reviewBtn");
let user;

async function init() {
    let [success, data] = await UserGateway.getuser();
    if(!success && data == "no session") {
        mainContainer.innerHTML = "You're not logged in!";
        return;
    }
    deckContainer.innerHTML = "";
    user = data;
    let reviews = user.reviews;
    for(let i = 0; i < reviews.length; i++) {
        let id = reviews[i].deckid;
        let [success, deck] = await DeckGateway.get(id);
        if(!success) continue;
        deckContainer.innerHTML += `
            <div class='deck-box' data-idx='${id}'>
                <p>${deck.name}</p>
                <input type='checkbox' class='deckCheck'>    
            </div>
        `;
    }
    reviewBtn.addEventListener("mousedown", () => {
        let selectedDecks = [];
        for(let i = 0; i < deckContainer.children.length; i++) {
            let item = deckContainer.children[i];
            let idx = item.dataset.idx;
            let checkbox = item.getElementsByClassName('deckCheck')[0];
            if(checkbox.checked) {
                selectedDecks.push(parseInt(idx));
            }
        }
        window.location.href = "/learn/game?ds=" + selectedDecks.join(",");
    })
}

init();