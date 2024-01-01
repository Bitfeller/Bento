import { UserGateway } from "../main/user_gateway.js";
import { DeckGateway } from "../main/deck_gateway.js";

const mainContainer = document.getElementById("overall-container");
const deckContainer = document.getElementsByClassName("deck-container")[0];
const reviewBtn = document.getElementById("reviewBtn");

const o_mode = document.getElementsByClassName("mode");
const o_speed = document.getElementsByClassName("speed");
const o_repeat = document.getElementsByClassName("repeat");
const o_shuffle = document.getElementsByClassName("shuffle");

let user;

(async() => {
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
        // Set options
        let mode, speed, repeat, shuffle;
        for(let i = 0; i < o_mode.length; i++) {
            if(o_mode[i].checked == true && i == 1) {
                mode = 1;
            }
        }
        for(let i = 0; i < o_speed.length; i++) {
            if(o_speed[i].checked == true) {
                speed = i + 1;
            }
        }
        for(let i = 0; i < o_repeat.length; i++) {
            if(o_repeat[i].checked == true) {
                repeat = i + 1;
            }
        }
        for(let i = 0; i < o_shuffle.length; i++) {
            if(o_shuffle[i].checked == true) {
                shuffle = i + 1;
            }
        }
        window.location.href = "/learn/game?ds=" + selectedDecks.join(",") + "&m=" + mode + "&s=" + speed + "&r=" + repeat + "&sh=" + shuffle;
    })
})();