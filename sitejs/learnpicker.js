import { UserGateway } from "../server/client-gateway/user-gateway.js";
import { DeckGateway } from "../server/client-gateway/deck-gateway.js";

const mainContainer = document.getElementById("overall-container");
const deckContainer = document.getElementsByClassName("deck-container")[0];
const reviewBtn = document.getElementById("reviewBtn");
const errmsg = document.getElementById("errmsg");

const o_mode = document.getElementsByClassName("mode");
const o_speed = document.getElementsByClassName("speed");
const o_repeat = document.getElementsByClassName("repeat");
const o_shuffle = document.getElementsByClassName("shuffle");

const deckSelect = document.getElementById("deckSelectAll");

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
    if(reviews.length == 0) {
        window.location.href = "/learn/kitchen";
        return;
    }
    let decks = [];
    let r_keys = Object.keys(reviews);
    for(let i = 0; i < r_keys.length; i++) {
        let id = parseInt(r_keys[i]);
        let [success, deck] = await DeckGateway.get(id);
        if(!success) {
            decks.push(0);
            continue;
        }
        decks.push(deck);
        deckContainer.innerHTML += `
            <div class='deck-box' data-idx='${id}'>
                <p>${deck.name}</p>
                <input type='checkbox' class='deckCheck'>    
            </div>
        `;
    }
    o_mode[0].addEventListener("change", () => {
        if(o_mode[0].checked == true) {
            deckContainer.innerHTML = "";
            let r_keys = Object.keys(reviews);
            for(let i = 0; i < r_keys.length; i++) {
                if(decks[i] == 0) continue;
                let deck = decks[i];
                deckContainer.innerHTML += `
                    <div class='deck-box' data-idx='${deck.id}'>
                        <p>${deck.name}</p>
                        <input type='checkbox' class='deckCheck'>    
                    </div>
                `;
            }
        }
    })
    o_mode[1].addEventListener("change", () => {
        if(o_mode[1].checked == true) {
            deckContainer.innerHTML = "";
            let r_keys = Object.keys(reviews);
            for(let i = 0; i < r_keys.length; i++) {
                if(decks[i] == 0) continue;
                let deck = decks[i];
                let count = 0;
                let c_keys = Object.keys(reviews[r_keys[i]]);
                for(let j = 0; j < c_keys.length; j++) {
                    let term = reviews[r_keys[i]][c_keys[j]];
                    if(UserGateway.calculateNTR(term.box, term.last)) count++;
                }
                count += Object.keys(deck.data.contnt).length - c_keys.length;
                if(count > 0) {
                    deckContainer.innerHTML += `
                        <div class="deck-box" data-idx='${deck.id}'>
                            <p>${decks[i].name}</p>
                            <input type='checkbox' class='deckCheck'>
                        </div>
                    `;
                }
            }
            if(deckContainer.innerHTML == "") deckContainer.innerHTML = "<p class=\"info-blank\">You don't have any decks to review.</p>";
        }
    });
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
        if(selectedDecks.length == 0) {
            errmsg.innerHTML = "Please select at least one deck to review.";
            return;
        }
        // Set options
        let mode = 0, speed, repeat, shuffle;
        if(o_mode[1].checked == true) mode = 1;
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
    deckSelect.addEventListener("mousedown", () => {
        let allChecked = false;
        for(let i = 0; i < deckContainer.children.length; i++) {
            let item = deckContainer.children[i];
            let checkbox = item.getElementsByClassName('deckCheck')[0];
            if(!checkbox.checked) {
                allChecked = true;
            }
        }
        if (allChecked) {
            for(let i = 0; i < deckContainer.children.length; i++) {
                let item = deckContainer.children[i];
                let checkbox = item.getElementsByClassName('deckCheck')[0];
                checkbox.checked = true;
            }
        } else {
            for(let i = 0; i < deckContainer.children.length; i++) {
                let item = deckContainer.children[i];
                let checkbox = item.getElementsByClassName('deckCheck')[0];
                checkbox.checked = false;
            }
        
        }
    });
})();