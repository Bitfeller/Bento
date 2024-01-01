import { UserGateway } from "../server/client-gateway/user-gateway.js";
import { DeckGateway } from "../server/client-gateway/deck-gateway.js";

const mainContainer = document.getElementById("overall-container");
const deckContainer = document.getElementsByClassName("deck-container")[0];
const reviewBtn = document.getElementById("reviewBtn");
const errmsg = document.getElementById("errmsg");

const o_mode = document.getElementsByClassName("mode");
const o_repeat = document.getElementsByClassName("repeat");
const o_shuffle = document.getElementsByClassName("shuffle");
const o_infinite_mode = document.getElementsByClassName("infinite-mode")[0];
const infinite_mode_text = document.getElementsByClassName("infinite_mode_text")[0];
const o_require_correct = document.getElementsByClassName('require_correct')[0];
const inertiaButton = document.getElementById("inertia-btn");

const deckSelect = document.getElementById("deckSelectAll");
const settingsBoxs = document.getElementsByClassName("setting-box");

let user;

function updateDecks(decks) {
    let reviews = user.userdata.reviews;
    if (o_mode[1].checked == true) {
        o_infinite_mode.disabled = false;
        o_infinite_mode.checked = o_infinite_mode.getAttribute("data-enabled") == "true" ? true : false;
        infinite_mode_text.innerHTML = "| Infinite Mode";
        deckContainer.innerHTML = "";
        let r_keys = Object.keys(reviews);
        for (let i = 0; i < r_keys.length; i++) {
            if (decks[i] == 0) continue;
            let deck = decks[i];
            deckContainer.innerHTML += `
                <div class='deck-box' data-idx='${deck.id}'>
                    <p>${deck.name}</p>
                    <input type='checkbox' class='deckCheck'>
                </div>
            `;
        }
    }
    if (o_mode[0].checked == true) {
        deckContainer.innerHTML = "";
        o_infinite_mode.disabled = true;
        o_infinite_mode.setAttribute("data-enabled", String(o_infinite_mode.checked));
        o_infinite_mode.checked = false;
        infinite_mode_text.innerHTML =
            "You can't use Infinite Mode when learning decks to review.";
        let r_keys = Object.keys(reviews);
        for (let i = 0; i < r_keys.length; i++) {
            if (decks[i] == 0) continue;
            let deck = decks[i];
            let count = 0;
            let c_keys = Object.keys(reviews[r_keys[i]]);
            for (let j = 0; j < c_keys.length; j++) {
                let term = reviews[r_keys[i]][c_keys[j]];
                if (UserGateway.calculateNTR(term.box, term.last)) count++;
            }
            count += Object.keys(deck.data.contnt).length - c_keys.length;
            if (count > 0) {
                deckContainer.innerHTML += `
                    <div class="deck-box" data-idx='${deck.id}'>
                        <p>${decks[i].name}</p>
                        <input type='checkbox' class='deckCheck'>
                    </div>
                `;
            }
        }
    }
    for(let i = 0; i < deckContainer.children.length; i++) {
        let deckBox = deckContainer.children[i];
        let checkbox = deckBox.getElementsByClassName("deckCheck")[0];
        deckBox.addEventListener("mousedown", (e) => {
            if (e.target != checkbox) checkbox.checked = !checkbox.checked;
            let allSelected = true;
            let isSelected = false;
            for (let j = 0; j < deckContainer.children.length; j++) {
                let thatcheckbox =
                    deckContainer.children[j].getElementsByClassName(
                        "deckCheck",
                    )[0];
                if (thatcheckbox.checked == false) {
                    allSelected = false;
                } else {
                    isSelected = true;
                }
            }
            if (allSelected) {
                deckSelect.innerHTML = "check_box";
            } else {
                if (isSelected) {
                    deckSelect.innerHTML = "indeterminate_check_box";
                } else {
                    deckSelect.innerHTML = "check_box_outline_blank";
                }
            }
        });
    }
    if (deckContainer.innerHTML == "")
        deckContainer.innerHTML =
            '<p class="info-blank">You don\'t have any decks to review.</p>';
}

(async () => {
    let [success, data] = await UserGateway.getuser();
    if (!success && data == "no session") {
        mainContainer.innerHTML = "You're not logged in!";
        return;
    }
    deckContainer.innerHTML = "";
    user = data;
    let reviews = user.userdata.reviews;
    if (reviews.length == 0) {
        window.location.href = "/learn/kitchen";
        return;
    }
    let decks = [];
    deckContainer.innerHTML = "";
    o_infinite_mode.disabled = true;
    o_infinite_mode.setAttribute("data-enabled", String(o_infinite_mode.checked));
    o_infinite_mode.checked = false;
    infinite_mode_text.innerHTML =
        "You can't use Infinite Mode when learning decks to review.";
    o_mode[0].checked = true;
    let r_keys = Object.keys(reviews);
    for (let i = 0; i < r_keys.length; i++) {
        let id = parseInt(r_keys[i]);
        let [success, deck] = await DeckGateway.get(id, true, false);
        if (!success) {
            decks.push(0);
            continue;
        }
        decks.push(deck);
        let count = 0;
        let c_keys = Object.keys(reviews[r_keys[i]]);
        for (let j = 0; j < c_keys.length; j++) {
            let term = reviews[r_keys[i]][c_keys[j]];
            if (UserGateway.calculateNTR(term.box, term.last)) count++;
        }
        count += Object.keys(deck.data.contnt).length - c_keys.length;
        if (count > 0) {
            deckContainer.innerHTML += `
                <div class="deck-box" data-idx='${deck.id}'>
                    <p>${decks[i].name}</p>
                    <input type='checkbox' class='deckCheck'>
                </div>
            `;
        }
    }
    if (deckContainer.innerHTML == "")
        deckContainer.innerHTML =
            "<p class='info-blank'>You don't have any decks to review.<br>If you're trying to find all the decks in your reviews, click on \"Review select decks\" above.</p>";
    // Settings box input box click event
    for(let i = 0; i < settingsBoxs.length; i++) {
        let box = settingsBoxs[i];
        if (box.querySelectorAll('input[type="radio"]')[0]) {
            let radioButton = box.querySelectorAll('input[type="radio"]')[0];
            box.addEventListener("mousedown", () => {
                radioButton.checked = true;
                updateDecks(decks);
            });
        } else if (box.querySelectorAll('input[type="checkbox"]').length > 0) {
            let checkbox = box.querySelectorAll('input[type="checkbox"]')[0];
            box.addEventListener("mousedown", () => {
                if(checkbox.disabled) return;
                checkbox.checked = !checkbox.checked;
            });
        }
    };
    for(let i = 0; i < deckContainer.children.length; i++) {
        let deckBox = deckContainer.children[i];
        let checkbox = deckBox.getElementsByClassName("deckCheck")[0];
        deckBox.addEventListener("mousedown", (e) => {
            if (e.target != checkbox) checkbox.checked = !checkbox.checked;
            let allSelected = true;
            let isSelected = false;
            for (let j = 0; j < deckContainer.children.length; j++) {
                let thatcheckbox =
                    deckContainer.children[j].getElementsByClassName(
                        "deckCheck",
                    )[0];
                if (thatcheckbox.checked == false) {
                    allSelected = false;
                } else {
                    isSelected = true;
                }
            }
            if (allSelected) {
                deckSelect.innerHTML = "check_box";
            } else {
                if (isSelected) {
                    deckSelect.innerHTML = "indeterminate_check_box";
                } else {
                    deckSelect.innerHTML = "check_box_outline_blank";
                }
            }
        });
    }
    o_mode[1].addEventListener("change", () => updateDecks(decks));
    o_mode[0].addEventListener("change", () => updateDecks(decks));
    reviewBtn.addEventListener("mousedown", () => {
        let selectedDecks = [];
        for (let i = 0; i < deckContainer.children.length; i++) {
            let item = deckContainer.children[i];
            let idx = item.dataset.idx;
            let checkbox = item.getElementsByClassName("deckCheck")[0];
            if (checkbox.checked) {
                selectedDecks.push(parseInt(idx));
            }
        }
        if (selectedDecks.length == 0) {
            errmsg.innerHTML = "Please select at least one deck to review.";
            return;
        }
        // Set options
        let mode = o_mode[0].checked ? 1 : 0,
            repeat,
            shuffle,
            infinite_mode = o_infinite_mode.checked ? 1 : 0,
            require_correct = o_require_correct.checked ? 1 : 0;
        for (let i = 0; i < o_repeat.length; i++) {
            if (o_repeat[i].checked == true) {
                repeat = i + 1;
            }
        }
        for (let i = 0; i < o_shuffle.length; i++) {
            if (o_shuffle[i].checked == true) {
                shuffle = i + 1;
            }
        }
        window.location.href =
            "/learn/game?ds=" +
            selectedDecks.join(",") +
            "&m=" +
            mode +
            "&r=" +
            repeat +
            "&sh=" +
            shuffle +
            "&i=" +
            infinite_mode +
            "&rc=" +
            require_correct;
    });
    deckSelect.addEventListener("mousedown", () => {
        let allChecked = false;
        for (let i = 0; i < deckContainer.children.length; i++) {
            let item = deckContainer.children[i];
            let checkbox = item.getElementsByClassName("deckCheck")[0];
            if (!checkbox.checked) {
                allChecked = true;
            }
        }
        if (allChecked) {
            for (let i = 0; i < deckContainer.children.length; i++) {
                let item = deckContainer.children[i];
                let checkbox = item.getElementsByClassName("deckCheck")[0];
                checkbox.checked = true;
            }
            deckSelect.innerHTML = "check_box";
        } else {
            for (let i = 0; i < deckContainer.children.length; i++) {
                let item = deckContainer.children[i];
                let checkbox = item.getElementsByClassName("deckCheck")[0];
                checkbox.checked = false;
            }
            deckSelect.innerHTML = "check_box_outline_blank";
        }
    });
    inertiaButton.addEventListener('mousedown', () => {
        let selectedDecks = [];
        for (let i = 0; i < deckContainer.children.length; i++) {
            let item = deckContainer.children[i];
            let idx = item.dataset.idx;
            let checkbox = item.getElementsByClassName("deckCheck")[0];
            if (checkbox.checked) {
                selectedDecks.push(parseInt(idx));
            }
        }
        if (selectedDecks.length == 0) {
            errmsg.innerHTML = "Please select at least one deck to review.";
            return;
        }
        let shuffle;
        for (let i = 0; i < o_shuffle.length; i++) {
            if (o_shuffle[i].checked == true) {
                shuffle = i + 1;
            }
        }
        window.location.href = '/learn/inertia?ds=' + selectedDecks.join(",") + '&m=' + (o_mode[0].checked ? 1 : 0) + '&s=' + shuffle;
    });
    window.LOADED();
})();
