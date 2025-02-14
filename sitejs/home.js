import { UserGateway } from "../server/client-gateway/user-gateway.js";
import { DeckGateway } from "../server/client-gateway/deck-gateway.js";

const deckReminders = document.getElementsByClassName("review-schedule")[0].getElementsByClassName('container')[0];
const searcher = document.getElementById('search-reviews');
const deckViewer = document.getElementById('bento-modal');
deckViewer.style.display = "none";

const tutorialDialog = document.getElementById("tutorial-background");
const tutorialBoxHolder = document.getElementById("tutorial-box-holder");
const tutorialEl = document.getElementById('tutorial-box-main');
const t_dialogmain = tutorialBoxHolder.getElementsByClassName("tutorial-dialog-main")[0];
const tutorialOverlay = document.getElementById("tutorial-overlay");

const reviewSushi = document.getElementsByClassName('review-sushi')[0];
const kitchenSushi = document.getElementsByClassName('kitchen-sushi')[0];
const createSushi = document.getElementsByClassName('create-sushi')[0];

const version = document.getElementById('header:version');
const version_info = document.getElementById('header:version_info');
const feedback_dialog = document.getElementById("header:feedback_dialog");

let user;
let decks = [], counts = [];

const INFO_TERM_LIMIT = 10;
const TYPEWRITE_SPEED = 1000 / 60; // 1000 / (char per second)
let typewriteInterval, typewriteCurr = 0, twElements = [t_dialogmain], t_newline = false;
let t_btnOverride = false;

const tutorial = [
    {
        main: "<p>You're about to start the tutorial for Bento to guide you through the basics.</p><p>Or, if you're already familiar, you can skip.</p><p>(You can reactivate this tutorial in your settings.)</p>"
    },
    {
        main: `
            <p>Let's define some terms:</p>
            <ul>
                <li><b>Deck</b>: A collection of cards to review.</li>
                <li><b>Card</b>: A question and answer pair to review.</li>
                <li><b>Review</b>: A session where you review terms in a deck.</li>
            </ul>
            <p>A card can include <b>multiple choice</b>, <b>text</b>, <b>ranking</b>, or <b>matching</b> questions.</p>
        `
    },
    {
        main: `
            <p>Bento uses <b>Spaced Repetition</b> to help you remember terms better.</p>
            <p>This means Bento recommends you when to review a term based on how well you know it.</p>
        `
    },
    {
        before: () => {
            
            kitchenSushi.parentNode.setAttribute('class', "lit-up");
        },
        main: `
            <p>On your home screen, you'll see three buttons - one of these leads to the <b>Kitchen</b>, the community space where you can find decks made by others with resourceful content to save you time.</p>
            <p>This is where you'll go to add decks to your reviews.</p>
            <p>You can also see the decks in your reviews, as well as be able to edit/export/delete decks you make.</p>
        `
    },
    {
        before: () => {
            kitchenSushi.parentNode.setAttribute('class', "");
            // Blame Emerson's SVG structure for this
            reviewSushi.parentNode.parentNode.parentNode.parentNode.setAttribute('class', "lit-up");
        },
        main: `
            <p>You'll also see a <b>Review</b> button, where you can review the decks in your reviews. You can also customize your review, like assistive tools and review settings.</p>
        `
    },
    {
        before: () => {
            reviewSushi.parentNode.parentNode.parentNode.parentNode.setAttribute('class', "");
            document.getElementById('deck-reminders').className = "bento-box review-schedule lit-up";
        },
        main: `
            <p>On the right, you can see the decks Bento recommends you review.</p>
            <p>You can also see all of the decks in your reviews, and hover over them for specific/helpful information.</p>
        `
    },
    {
        before: () => {
            document.getElementById('deck-reminders').className = "bento-box review-schedule";
            createSushi.setAttribute('class', "lit-up");
            tutorialEl.style.top = "70%";
            tutorialEl.style.animation = "move-tutorial-box-down 1s ease";
        },
        main: `
            <p>Lastly, you can create your own decks with the <b>Create</b> button.</p>
            <p>Here, you can also import decks, create cards with varying types, and customize the deck how <b>you</b> want it.</p>
        `
    },
    {
        before: () => {
            createSushi.setAttribute('class', "");
            tutorialEl.style.top = "50%";
            tutorialEl.style.animation = "move-tutorial-box-up 1s ease";
            // Header
            document.getElementsByTagName("header")[0].style.zIndex = "initial";
            document.getElementById("header:pfp").className = "pfp right-header-ico lit-up";
            document.getElementById("header:feedback").classNAme = "header-nav material-symbols-outlined right-header-ico lit-up";
            document.getElementById("header:logout").className = "header-nav material-symbols-outlined right-header-ico lit-up";
        },
        main: `
            <p>You can find your profile in the top right corner.</p>
            <p>You can also give us <b>feedback</b>. We're <b><i>always</i></b> looking to improve Bento, and we'll see your feedback within an hour of you sending it.</p>
            <p>You can also, of course, log out.</p>
        `
    },
    {
        before: () => {
            document.getElementById("header:pfp").className = "pfp right-header-ico";
            document.getElementById("header:feedback").classNAme = "header-nav material-symbols-outlined right-header-ico";
            document.getElementById("header:logout").className = "header-nav material-symbols-outlined right-header-ico";
            document.getElementsByTagName("header")[0].style.zIndex = 10;
        },
        main: `
            <p>That's it! Have fun learning.</p>
            <p>You can find this tutorial again in your profile settings.</p>
        `
    }
];

function show(deck) {
    deckViewer.style.display = 'block';
    let review = window.lib.recur_decode(user.userdata.reviews[deck.id]);
    let keys = Object.keys(review);
    let name = deck.name;
    let mastered = 0;
    for(let i = 0; i < keys.length; i++) {
        let term = review[keys[i]];
        if(term.box > 3) mastered++;
    }

    let lister = (select, sorter) =>
        keys.filter(select)
            .filter(k => deck.data.contnt[k] ?? false)
            .sort(sorter)
            .slice(0, INFO_TERM_LIMIT)
            .map(k => `<li>${k} => ${deck.data.contnt[k].type == 'mc' ? deck.data.contnt[k].ans.map(r => deck.data.contnt[k].op[r]).join(', ') : deck.data.contnt[k].ans} (recall rating: ${review[k].box} (of 6), score: ${review[k].score}, average time spent: ${review[k].time ? review[k].time + 's' : '[not tracked yet]'}, next review: ${UserGateway.calculateNTR(review[k].box, review[k].last) ? "now" : "in " + UserGateway.calculateNextReview(review[k].box, review[k].last) + " day(s)"})</li>`).join('');

    let worst = lister(k => review[k].box <= 2, (a, b) => review[a].box + review[a].score / 100 - review[b].box - review[b].score / 100);
    let learning = lister(k => review[k].box > 2 && review[k].box < 5, (a, b) => review[a].box + review[a].score / 100 - review[b].box - review[b].score / 100);
    let best = lister(k => review[k].box >= 5, (a, b) => review[b].box + review[b].score / 100 - review[a].box - review[a].score / 100);

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
                    <h3 style='color: var(--danger-red)'>Least mastered</h3>
                    <ol class='deck-container-worst-terms-list'>
                        ${worst}
                    </ol>
                </div>
                <div class='deck-container-learning-terms'>
                    <h3 style='color: var(--select-blue)'>Learning</h3>
                    <ol class='deck-container-learning-terms-list'>
                        ${learning}
                    </ol>
                </div>
                <div class='deck-container-best-terms'>
                    <h3 style='color: var(--accent-1)'>Most mastered</h3>
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
        if(counts[i] > 0 && window.lib.decode(decks[i].name).toLowerCase().includes(search)) {
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
        if(window.lib.decode(decks[i].name).toLowerCase().includes(search)) {
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
function _finish() {
    clearInterval(typewriteInterval);
    typewriteInterval = undefined;
    t_dialogmain.innerHTML = tutorial[typewriteCurr].main;
    t_dialogmain.innerHTML += `
        <button id='continuebtn'>${typewriteCurr >= tutorial.length - 1 ? "Finish" : "Continue"}</button>
        ${typewriteCurr >= tutorial.length - 1 ? "" : "<button id='skipbtn' style='background-color: rgb(255, 175, 175);'>Skip</button>"}
    `;
    document.getElementById('continuebtn').addEventListener('mousedown', e => {
        t_btnOverride = true;
        typewriteCurr++;
        if(typewriteCurr >= tutorial.length) {
            tutorialDialog.style.display = "none";
            tutorialBoxHolder.style.display = "none";
            tutorialOverlay.style.display = "none";
            return;
        }
        tutorialDialog.style.display = "block";
        tutorialBoxHolder.style.display = "block";
        if(tutorial[typewriteCurr].before) tutorial[typewriteCurr].before();
        set(tutorial[typewriteCurr].main);
    });
    if(document.getElementById('skipbtn'))
        document.getElementById('skipbtn').addEventListener('mousedown', () => {
            tutorialDialog.style.display = "none";
            tutorialBoxHolder.style.display = "none";
            tutorialOverlay.style.display = "none";
        });
}
function _dialog(i, text) {
    if(i >= text.length) return _finish();
    
    if(t_newline && text[i] == ' ')
        return _dialog(i + 1, text);
    else if(t_newline)
        t_newline = false;
    if(text[i] == '\n') {
        t_newline = true;
        return _dialog(i + 1, text);
    }
    if(text[i] == '\t') return _dialog(i + 1, text);
    
    if(text[i] == '<') {
        let j = text.indexOf('>', i);
        if(text[i + 1] == '/')
            twElements.splice(twElements.length - 1, 1);
        else {
            const raw = text.substring(i + 1, j);
            const newEl = document.createElement(raw.substring(0, raw.indexOf(' ') < 0 ? raw.length : raw.indexOf(' ')));
            twElements.push(newEl);
            twElements[twElements.length - 2].appendChild(newEl);
        }
        return _dialog(j + 1, text);
    }
    
    twElements[twElements.length - 1].innerHTML += text[i++];
    if(i >= text.length)
        _finish();
    return i;
}
function write(text) {
    let i = 0;
    typewriteInterval = setInterval(() => i = _dialog(i, text), TYPEWRITE_SPEED);
}
function set(text) {
    t_dialogmain.innerHTML = '';
    twElements = [t_dialogmain];
    write(text);
}
(async () => {
    let [success, _user] = await UserGateway.getuser(false, true, true, false);
    if(!success) return;
    user = _user;
    deckReminders.innerHTML = "<h3>Upcoming Reviews</h3>";
  
    let reviews = user.userdata.reviews;
    let r_keys = Object.keys(reviews);

    let lazyloader = async (r_keys, i) => {
        let [success, deck] = await DeckGateway.get(parseInt(r_keys[i]), true, false, true);
        if(!success) return;
        decks.push(deck);
        let count = 0;
        let c_keys = Object.keys(reviews[r_keys[i]]);
        for(let j = 0; j < c_keys.length; j++) {
            let term = reviews[r_keys[i]][c_keys[j]];
            if(UserGateway.calculateNTR(term.box, term.last)) count++;
        }
        count += deck.contnt_len - c_keys.length;
        counts.push(count);
        update('');
    };
    for(let i = 0; i < r_keys.length; i++)
        lazyloader(r_keys, i);
  
    searcher.addEventListener('input', () => update(searcher.value));

    // Tutorial
    // Get options from browser URL
    const params = new URLSearchParams(window.location.search);
    if(params.get('new')) {
        // replace URL so that user doesn't accidentally re-activate tutorial later
        // history.replaceState(null, "", "home"); // /home?new=1  ==>  /home
        // tutorial feature
        tutorialDialog.style.display = "block";
        tutorialBoxHolder.style.display = "block";
        tutorialOverlay.style.display = "block";

        set(tutorial[typewriteCurr].main);
    }

    window.LOADED();
})();
version.addEventListener('mousedown', () => version_info.showModal());
window.addEventListener('mousedown', e => {
    if(e.target == feedback_dialog || e.target == version_info) {
        feedback_dialog.close();
        version_info.close();
    }
    if(typewriteInterval && !t_btnOverride)
        _finish();
    t_btnOverride = false;
});