import { UserGateway } from "../server/client-gateway/user-gateway.js";
import { DeckGateway } from "../server/client-gateway/deck-gateway.js";

const deckReminders = document.getElementsByClassName("review-schedule")[0];
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

(async () => {
    let [success, data] = await UserGateway.getuser();
    if(!success) return;
    deckReminders.innerHTML = "<h3>Upcoming Reviews:</h3>";
    let reviews = data.userdata.reviews;
    let r_keys = Object.keys(reviews);
    for(let i = 0; i < r_keys.length; i++) {
        let [success, deck] = await DeckGateway.get(parseInt(r_keys[i]), false, false, true);
        if(!success) continue;
        let count = 0;
        let c_keys = Object.keys(reviews[r_keys[i]]);
        for(let j = 0; j < c_keys.length; j++) {
            let term = reviews[r_keys[i]][c_keys[j]];
            if(UserGateway.calculateNTR(term.box, term.last)) count++;
        }
        count += deck.contnt_len - c_keys.length;
        if(count > 0) {
            deckReminders.innerHTML += `
                <div class="review-container">
                    <span class="review-name">${deck.name}</span><span class="review-number">${count}</span>
                </div>
            `;
        }
    }
    if(deckReminders.innerHTML == "") deckReminders.innerHTML = "<p class='info-blank'>-- There aren't any decks to review. --</p>";
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