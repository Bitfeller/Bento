import { UserGateway } from "../server/client-gateway/user-gateway.js";
import { DeckGateway } from "../server/client-gateway/deck-gateway.js";

const deckReminders = document.getElementsByClassName("review-schedule")[0].getElementsByClassName('container')[0];
const searcher = document.getElementById('search-reviews');
const deckViewer = document.getElementById('viewer');
// Tutorial required elements
// const tutorialDialog = document.getElementById("tutorial-background");
// const tutorialBoxHolder = document.getElementById("tutorial-box-holder");
// const t_dialogmain = tutorialBoxHolder.getElementsByClassName("dialog-main")[0];

// const svgHolder = document.getElementsByClassName("bento-svg")[0];
// const blankSvg = document.getElementById("blanksvg");
// const leftSushi = document.getElementById("Leftest_Sushi");
// const bottomSushi = document.getElementById("Bottom_Sushi");
// const rightSushi = document.getElementById("Right_Sushi");

const version = document.getElementById('header:version');
const version_info = document.getElementById('header:version_info');
const feedback_dialog = document.getElementById("header:feedback_dialog");

function show(user, decks, deck) {
    deckViewer.style.display = 'block';
    let review = user.userdata.reviews[deck];
    let name = deck;
    deck = decks[deck];
    deckViewer.innerHTML = `
        <div class='title'>
            ${name}
        <div>
    `;
}
function hide() {
    deckViewer.style.display = 'none';
}
(async () => {
    let [success, data] = await UserGateway.getuser(false, true, true, false);
    console.log(data.userdata);
    if(!success) return;
    deckReminders.innerHTML = "<h3>Upcoming Reviews</h3>";
    let reviews = data.userdata.reviews;
    
    let r_keys = Object.keys(reviews);
    let decks = [];
    let counts = [];
    let coll = 0;

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
        if(count > 0) {
            coll++;
            deckReminders.innerHTML += `
                <div class="review-container">
                    <span class="review-name">${deck.name}</span><span class="review-number">${count}</span>
                </div>
            `;
        }
    }
    if(coll == 0) deckReminders.innerHTML += "<p class='info-blank'>-- There aren't any decks to review. --</p>";
    deckReminders.innerHTML += "<h3>All Decks</h3>";
    for(let i = 0; i < decks.length; i++) {
        deckReminders.innerHTML += `
            <div class="review-container">
                <span class="review-name"><span class='material-symbols-outlined'>info</span>${decks[i].name}</span>
            </div>
        `;
    }
    searcher.addEventListener('input', () => {
        if(searcher.value == '') {
            let coll = 0;
            deckReminders.innerHTML = "<h3>Upcoming Reviews</h3>";
            for(let i = 0; i < decks.length; i++) {
                if(counts[i] > 0) {
                    coll++;
                    deckReminders.innerHTML += `
                        <div class="review-container">
                            <span class="review-name">${decks[i].name}</span><span class="review-number">${counts[i]}</span>
                        </div>
                    `;
                }
            }
            if(coll == 0) deckReminders.innerHTML += "<p class='info-blank'>-- There aren't any decks to review. --</p>";
            deckReminders.innerHTML += "<h3>All Decks</h3>";
            for(let i = 0; i < decks.length; i++) {
                deckReminders.innerHTML += `
                    <div class="review-container">
                        <span class="review-name"><span class='material-symbols-outlined'>arrow_back_ios</span>${decks[i].name}</span>
                    </div>
                `;
            }
        } else {
            let coll = 0;
            deckReminders.innerHTML = "<h3>Upcoming Reviews</h3>";
            for(let i = 0; i < decks.length; i++) {
                if(counts[i] > 0 && decks[i].name.toLowerCase().includes(searcher.value.toLowerCase())) {
                    coll++;
                    deckReminders.innerHTML += `
                        <div class="review-container">
                            <span class="review-name">${decks[i].name}</span><span class="review-number">${counts[i]}</span>
                        </div>
                    `;
                }
            }
            if(coll == 0) deckReminders.innerHTML += "<p class='info-blank'>-- There are't any decks for review that match. --</p>";
            deckReminders.innerHTML += "<h3>All Decks</h3>";
            coll = 0;
            for(let i = 0; i < decks.length; i++) {
                if(decks[i].name.toLowerCase().includes(searcher.value.toLowerCase())) {
                    coll++;
                    let div = document.createElement('div');
                    div.className = 'review-container';
                    div.innerHTML = `<span class="review-name"><span class='material-symbols-outlined'>info</span>${decks[i].name}</span>`;
                    deckReminders.appendChild(div);
                    div.addEventListener('mouseenter', () => {
                        show(data, decks, decks[i].name);
                    });
                    div.addEventListener('mouseleave', () => {

                    });
                }
            }
            if(coll == 0) deckReminders.innerHTML += "<p class='info-blank'>-- There are't any decks that match. --</p>";
        }
    });
    window.LOADED();
})();
version.addEventListener('mousedown', () => {
    version_info.showModal();
});
window.addEventListener('mousedown', (e) => {
    if(e.target == feedback_dialog || e.target == version_info) {
        feedback_dialog.close();
        version_info.close();
    }
});