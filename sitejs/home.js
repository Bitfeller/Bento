import { UserGateway } from "../server/client-gateway/user-gateway.js";
import { DeckGateway } from "../server/client-gateway/deck-gateway.js";

const deckReminders = document.getElementsByClassName("review-schedule")[0].getElementsByClassName('container')[0];
const searcher = document.getElementById('search-reviews');
const deckViewer = document.getElementById('bento-modal');
deckViewer.style.display = "none";

const tutorialDialog = document.getElementById("tutorial-background");
const tutorialBoxHolder = document.getElementById("tutorial-box-holder");
const t_dialogmain = tutorialBoxHolder.getElementsByClassName("dialog-main")[0];

const svgHolder = document.getElementsByClassName("bento-svg")[0];
const blankSvg = document.getElementById("blanksvg");
const leftSushi = document.getElementById("Leftest_Sushi");
const bottomSushi = document.getElementById("Bottom_Sushi");
const rightSushi = document.getElementById("Right_Sushi");

const version = document.getElementById('header:version');
const version_info = document.getElementById('header:version_info');
const feedback_dialog = document.getElementById("header:feedback_dialog");

function show(user, deck) {
    deckViewer.style.display = 'block';
    let review = user.userdata.reviews[deck.name];
    let name = deck.name;
    deckViewer.innerHTML = `
        <div class='title deck-container-overview' id='deck-container-overview'>
            <h2>${name}</h2>
            <p>By: ${deck.owner}</p>
        <div><br>
        <hr><br>
        <div class='deck-container-main' id='deck-container-main'>
            <p class='info-blank'>-- A cool new feature coming here soon... --</p>
        </div>
    `;
}
function hide() {
    deckViewer.style.display = 'none';
}
function update(search, decks, counts, data) {
    search = search.toLowerCase();
    let searched = search != '';
    let coll = 0;
    deckReminders.innerHTML = "<h3>Upcoming Reviews</h3>";
    for(let i = 0; i < decks.length; i++) {
        if(counts[i] > 0 && decks[i].name.toLowerCase().includes(search)) {
            coll++;
            deckReminders.innerHTML += `
                <div class="review-container">
                    <span class="review-name">${decks[i].name}</span><span class="review-number">${counts[i]}</span>
                </div>
            `;
        }
    }
    if(coll == 0) deckReminders.innerHTML += `<p class='info-blank'>-- ${searched ? "There aren't any decks for review that match." : "There aren't any decks to review."} --</p>`;
    deckReminders.innerHTML += "<h3>All Decks</h3>";
    for(let i = coll = 0; i < decks.length; i++) {
        if(decks[i].name.toLowerCase().includes(search)) {
            coll++;
            let div = document.createElement('div');
            div.className = 'review-container';
            div.innerHTML = `<span class="review-name"><span class='material-symbols-outlined'>info</span>${decks[i].name}</span>`;
            deckReminders.appendChild(div);
            div.addEventListener('mouseenter', () => show(data, decks[i]));
            div.addEventListener('mouseleave', hide);    
        }
    }
    if(coll == 0) deckReminders.innerHTML += `<p class='info-blank'>-- ${searched ? "There aren't any decks that match." : "You don't have any decks in your reviews."} --</p>`;
}
(async () => {
    let [success, data] = await UserGateway.getuser(false, true, true, false);
    if(!success) return;
    deckReminders.innerHTML = "<h3>Upcoming Reviews</h3>";
    let reviews = data.userdata.reviews;

    let r_keys = Object.keys(reviews);
    let decks = [], counts = [];

    for(let i = 0; i < r_keys.length; i++) {
        let [success, deck] = await DeckGateway.get(parseInt(r_keys[i]), false, false, true);
        if(!success) continue;
        decks.push(deck);
        let count = 0;
        let c_keys = Object.keys(reviews[r_keys[i]]);
        for(let j = 0; j < c_keys.length; j++) {
            let term = reviews[r_keys[i]][c_keys[j]];
            if(UserGateway.calculateNTR(term.box, term.last)) count++;
        }
        count += deck.contnt_len - c_keys.length;
        counts.push(count);
    }
    update('', decks, counts, data);
    searcher.addEventListener('input', () => update(searcher.value, decks, counts, data));

    // Tutorial
    // Get options from browser URL
    const params = new URLSearchParams(window.location.search);
    if(params.get('new')) {
        // init tutorial
        
    }

    window.LOADED();
})();
version.addEventListener('mousedown', () => version_info.showModal());
window.addEventListener('mousedown', e => {
    if(e.target == feedback_dialog || e.target == version_info) {
        feedback_dialog.close();
        version_info.close();
    }});