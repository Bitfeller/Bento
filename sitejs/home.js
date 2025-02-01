import { UserGateway } from "../server/client-gateway/user-gateway.js";
import { DeckGateway } from "../server/client-gateway/deck-gateway.js";

const deckReminders = document.getElementsByClassName("review-schedule")[0].getElementsByClassName('container')[0];
const searcher = document.getElementById('search-reviews');
const deckViewer = document.getElementById('bento-modal');
deckViewer.style.display = "none";

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

let user;
let decks = [], counts = [];

const INFO_TERM_LIMIT = 10;

function show(deck) {
    deckViewer.style.display = 'block';
    let review = user.userdata.reviews[deck.id];
    let keys = Object.keys(review);
    let name = deck.name;
    let mastered = 0;
    for(let i = 0; i < keys.length; i++) {
        let term = review[keys[i]];
        if(term.box > 3) mastered++;
    }
    let worst = keys.filter(k => review[k].box <= 2).sort((a, b) => review[a].box + review[a].score / 100 - review[b].box - review[b].score / 100).slice(0, INFO_TERM_LIMIT).map(k => `<li>${deck.data.contnt[k] ? k : ""} => ${deck.data.contnt[k].type == 'mc' ? deck.data.contnt[k].ans.map(r => deck.data.contnt[k].op[r]).join(', ') : deck.data.contnt[k].ans} (recall rating: ${review[k].box} (of 6), score: ${review[k].score}, average time spent: ${review[k].time}, next review: ${UserGateway.calculateNTR(review[k].box, review[k].last) ? "now" : "in " + UserGateway.calculateNextReview(review[k].box, review[k].last) + " day(s)"})</li>`).join('');
    let learning = keys.filter(k => review[k].box > 2 && review[k].box < 5).sort((a, b) => review[a].box + review[a].score / 100 - review[b].box - review[b].score / 100).slice(0, INFO_TERM_LIMIT).map(k => `<li>${deck.data.contnt[k] ? k : ""} => ${deck.data.contnt[k].type == 'mc' ? deck.data.contnt[k].ans.map(r => deck.data.contnt[k].op[r]).join(', ') : deck.data.contnt[k.replace('&amp;', '&')].ans} (recall rating: ${review[k].box} (of 6), score: ${review[k].score}, average time spent: ${review[k].time}, next review: ${UserGateway.calculateNTR(review[k].box, review[k].last) ? "now" : "in " + UserGateway.calculateNextReview(review[k].box, review[k].last) + " day(s)"})</li>`).join('');
    let best = keys.filter(k => review[k].box >= 5).sort((a, b) => review[b].box + review[b].score / 100 - review[a].box - review[a].score / 100).slice(0, INFO_TERM_LIMIT).map(k => `<li>${deck.data.contnt[k] ? k : ""} => ${deck.data.contnt[k].type == 'mc' ? deck.data.contnt[k].ans.map(r => deck.data.contnt[k].op[r]).join(', ') : deck.data.contnt[k].ans} (recall rating: ${review[k].box} (of 6), score: ${review[k].score}, average time spent: ${review[k].time}, next review: ${UserGateway.calculateNTR(review[k].box, review[k].last) ? "now" : "in " + UserGateway.calculateNextReview(review[k].box, review[k].last) + " day(s)"})</li>`).join('');
    if(worst.length == 0) worst = `<p class='info-blank'>-- No terms to show${deck.contnt_len - keys.length > 0 ? ". Complete a review and check back again." : ''} --</p>`;
    if(learning.length == 0) learning = `<p class='info-blank'>-- No terms to show${deck.contnt_len - keys.length > 0 ? ". Complete a review and check back again." : ''} --</p>`;
    if(best.length == 0) best = `<p class='info-blank'>-- No terms to show${deck.contnt_len - keys.length > 0 ? ". Complete a review and check back again." : ''} --</p>`;
    deckViewer.innerHTML = `
        <div class='title deck-container-overview' id='deck-container-overview'>
            <h2>${name}</h2>
            <p>By <b>${deck.owner}</b></p>
        <div><br>
        <hr><br>
        <div class='deck-container-main' id='deck-container-main'>
            <div class='deck-container-mastered'>
                <div class='green-box'></div><span class='dc-masterbox'>Mastered ${mastered} terms</span>
                <div class='yellow-box'></div><span class='dc-masterbox'>Learning ${keys.length - mastered} terms</span>
                <div class='red-box'></div><span class='dc-masterbox'>Haven't seen ${deck.contnt_len - keys.length} terms</span>
            </div>
            <div>
                <div class='deck-container-worst-terms'>
                    <h3 style='color: rgb(255, 0, 0)'>Least mastered</h3>
                    <ol class='deck-container-worst-terms-list'>
                        ${worst}
                    </ol>
                </div>
                <div class='deck-container-learning-terms'>
                    <h3 style='color: rgb(0, 0, 255)'>Learning</h3>
                    <ol class='deck-container-learning-terms-list'>
                        ${learning}
                    </ol>
                </div>
                <div class='deck-container-best-terms'>
                    <h3 style='color: rgb(0, 255, 0)'>Most mastered</h3>
                    <ol class='deck-container-best-terms-list'>
                        ${best}
                    </ol>
                </div>
            </div>
        </div>
    `;
}
function hide() {
    deckViewer.style.display = 'none';
}
function update(search) {
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
            div.addEventListener('mouseenter', () => show(decks[i]));
            div.addEventListener('mouseleave', hide);    
        }
    }
    if(coll == 0) deckReminders.innerHTML += `<p class='info-blank'>-- ${searched ? "There aren't any decks that match." : "You don't have any decks in your reviews."} --</p>`;
}
(async () => {
    let [success, _user] = await UserGateway.getuser(false, true, true, false);
    if(!success) return;
    user = _user;
    deckReminders.innerHTML = "<h3>Upcoming Reviews</h3>";
  
    let reviews = user.userdata.reviews;
    let r_keys = Object.keys(reviews);

    for(let i = 0; i < r_keys.length; i++) {
        let [success, deck] = await DeckGateway.get(parseInt(r_keys[i]), true, false, true);
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
  
    update('');
    searcher.addEventListener('input', () => update(searcher.value));

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
    }
});