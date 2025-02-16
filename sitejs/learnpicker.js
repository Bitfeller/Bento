import { UserGateway } from "../server/client-gateway/user-gateway.js";
import { DeckGateway } from "../server/client-gateway/deck-gateway.js";

const deckContainer = document.getElementsByClassName("deck-container")[0];
const reviewBtn = document.getElementById("reviewBtn");

const o_mode = document.getElementsByClassName("mode");
const o_repeat = document.getElementsByClassName("repeat");
const o_shuffle = document.getElementsByClassName("shuffle");
const o_infinite_mode = document.getElementsByClassName("infinite-mode")[0];
const infinite_mode_text = document.getElementsByClassName("infinite_mode_text")[0];
const o_require_correct = document.getElementsByClassName("require_correct")[0];
const o_lazy_check = document.getElementsByClassName("lazy_check")[0];
const inertiaButton = document.getElementById("inertia-btn");

const deckSelect = document.getElementById("deckSelectAll");
const settingsBoxes = document.getElementsByClassName("setting-box");

function updateDecks(decks, counts) {
    deckContainer.innerHTML = "";
    if (o_mode[1].checked == true) {
        o_infinite_mode.disabled = false;
        o_infinite_mode.checked = o_infinite_mode.getAttribute("data-enabled") == "true";
        infinite_mode_text.innerHTML = "| Infinite Mode";
        for (let i = 0; i < decks.length; i++) {
            if (decks[i] == 0) continue;
            let deck = decks[i];
            deckContainer.innerHTML += `
                <div class='deck-box' data-idx='${deck.id}'>
                    <p>${deck.name}</p>
                    <input type='checkbox' class='deckCheck'>
                </div>
            `;
        }
        if (deckContainer.innerHTML == "") deckContainer.innerHTML = '<p class="info-blank">You don\'t have any decks to review.</p>';
    } else {
        o_infinite_mode.disabled = true;
        o_infinite_mode.setAttribute("data-enabled", String(o_infinite_mode.checked));
        o_infinite_mode.checked = false;
        infinite_mode_text.innerHTML = "You can't use Infinite Mode when learning decks to review.";
        for (let i = 0; i < decks.length; i++) {
            if (decks[i] == 0) continue;
            let deck = decks[i];
            if (counts[i] > 0) 
                deckContainer.innerHTML += `
                    <div class="deck-box" data-idx='${deck.id}'>
                        <p>${decks[i].name}</p>
                        <input type='checkbox' class='deckCheck'>
                    </div>
                `;
        }
        if (deckContainer.innerHTML == "") deckContainer.innerHTML = "<p class='info-blank'>You don't have any decks to review.<br>If you're trying to find all the decks in your reviews, click on \"Review select decks\" above.</p>";
    }
    for(let i = 0; i < deckContainer.children.length; i++) {
        let deckBox = deckContainer.children[i];
        let checkbox = deckBox.getElementsByClassName("deckCheck")[0];
        deckBox.addEventListener("mousedown", (e) => {
            if (e.target != checkbox) checkbox.checked = !checkbox.checked;
            let allSelected = true, isSelected = false;
            for (let j = 0; j < deckContainer.children.length; j++) {
                let otherbox = deckContainer.children[j].getElementsByClassName("deckCheck")[0];
                if (otherbox.checked == false) allSelected = false;
                else isSelected = true;
            }
            if (allSelected) deckSelect.innerHTML = "check_box";
            else if (isSelected) deckSelect.innerHTML = "indeterminate_check_box";
            else deckSelect.innerHTML = "check_box_outline_blank";
        });
    }
}

(async () => {
    let [success, user] = await UserGateway.getuser(false, true, true, false);
    if (!success && data == "no session") return window.LOAD_ERROR("You're not logged in!");

    let reviews = user.userdata.reviews;
    if (reviews.length == 0) return window.location.href = "/learn/kitchen";
    o_mode[0].checked = true; // Explicitly defined to make sure

    let r_keys = Object.keys(reviews);
    let decks = [], counts = [];
    for (let i = 0; i < r_keys.length; i++) {
        let id = parseInt(r_keys[i]);
        let [success, deck] = await DeckGateway.get(id, false, false, true);
        if (!success) {
            decks.push(0);
            counts.push(-1);
            continue;
        }
        decks.push(deck);
        let count = 0;
        let c_keys = Object.keys(reviews[r_keys[i]]);
        for (let j = 0; j < c_keys.length; j++) {
            let term = reviews[r_keys[i]][c_keys[j]];
            if (UserGateway.calculateNTR(term.box, term.last)) count++;
        }
        count += deck.contnt_len - c_keys.length;
        counts.push(count);
    }
    updateDecks(decks, counts);
    // Settings box input box click event
    for(let i = 0; i < settingsBoxes.length; i++) {
        let box = settingsBoxes[i];
        if(box.querySelectorAll('input[type="radio"]')[0]) {
            let radioButton = box.querySelectorAll('input[type="radio"]')[0];
            box.addEventListener("mousedown", () => {
                radioButton.checked = true;
                updateDecks(decks, counts);
            });
        } else if(box.querySelectorAll('input[type="checkbox"]').length > 0) {
            let checkbox = box.querySelectorAll('input[type="checkbox"]')[0];
            box.addEventListener("mousedown", () => {
                if(!checkbox.disabled) checkbox.checked = !checkbox.checked;
            });
        }
    };
    o_mode[1].addEventListener("change", () => updateDecks(decks, counts));
    o_mode[0].addEventListener("change", () => updateDecks(decks, counts));
    reviewBtn.addEventListener("mousedown", () => {
        let selectedDecks = [];
        for (let i = 0; i < deckContainer.children.length; i++) {
            let item = deckContainer.children[i];
            let idx = item.dataset.idx;
            let checkbox = item.getElementsByClassName("deckCheck")[0];
            if (checkbox.checked) selectedDecks.push(parseInt(idx));
        }
        if (selectedDecks.length == 0) return window.SHOW_ERROR("Please select at least one deck to review.");
        // Set options
        let mode = o_mode[0].checked ? 1 : 0,
            repeat,
            shuffle,
            infinite_mode = o_infinite_mode.checked ? 1 : 0,
            require_correct = o_require_correct.checked ? 1 : 0,
            lazy_check = o_lazy_check.checked ? 1 : 0;
        for (let i = 0; i < o_repeat.length; i++)
            if (o_repeat[i].checked == true) repeat = i + 1;
        for (let i = 0; i < o_shuffle.length; i++)
            if (o_shuffle[i].checked == true) shuffle = i + 1;
        window.location.href =
            "/learn/game?ds=" + selectedDecks.join(",") +
            "&m=" + mode +
            "&r=" + repeat +
            "&sh=" + shuffle +
            "&i=" + infinite_mode +
            "&rc=" + require_correct +
            "&lc=" + lazy_check;
    });
    deckSelect.addEventListener("mousedown", () => {
        let allChecked = true;
        for (let i = 0; i < deckContainer.children.length; i++) {
            let item = deckContainer.children[i];
            let checkbox = item.getElementsByClassName("deckCheck")[0];
            if (!checkbox.checked) allChecked = false;
        }
        if(allChecked) {
            for (let item in deckContainer.children)
                item.getElementsByClassName("deckCheck")[0].checked = false;
            deckSelect.innerHTML = "check_box_outline_blank";
        } else {
            for (let item in deckContainer.children)
                item.getElementsByClassName("deckCheck")[0].checked = true;
            deckSelect.innerHTML = "check_box";
        }
    });
    inertiaButton.addEventListener('mousedown', () => {
        let selectedDecks = [], shuffle;
        for (let item in deckContainer.children) {
            let idx = item.dataset.idx;
            let checkbox = item.getElementsByClassName("deckCheck")[0];
            if (checkbox.checked) selectedDecks.push(parseInt(idx));
        }
        if (selectedDecks.length == 0) return window.SHOW_ERROR("Please select at least one deck to review.");
        for (let i = 0; i < o_shuffle.length; i++)
            if (o_shuffle[i].checked == true) shuffle = i + 1;
        window.location.href = '/learn/inertia?ds=' + selectedDecks.join(",") + '&m=' + (o_mode[0].checked ? 1 : 0) + '&s=' + shuffle;
    });
    window.LOADED();
})();