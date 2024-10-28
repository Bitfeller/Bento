import { UserGateway } from "../../server/client-gateway/user-gateway.js";
import { DeckGateway } from "../../server/client-gateway/deck-gateway.js";

let user;

let decks = [];
let gameData = [];

let deckSize = 5;
let curr = 0;
let infinite_mode = false;

let currSet = [];
let currWrong = [];
let lastWrong = [];
let card = 0;
let active = false;

let seen = 0;
let C_w = 0;

const totalWrong = {};
const cardsSeen = {};
let updateFn;

let lastCorrect = false;

// -------------------------------------------------------- \\

function random(a, b) {
    return Math.floor(Math.random() * (b - a) + a + 0.5);
}
// -------------------------------------------------------- \\

function iterateCard() {
    if(cardsSeen[currSet[card]]) cardsSeen[currSet[card]]++; else cardsSeen[currSet[card]] = 1;
    card++;
    seen++;
    if(card >= currSet.length) return newSet();
    return true;
}
function newSet() {
    if(gameData.length - curr <= 0 && currWrong.length == 0 && lastWrong.length == 0) {
        card = 0;
        if(infinite_mode) curr = 0;
        else {
            seen--;
            active = false;
            currSet = [];
            updateFn();
            return false;
        }
    }
    
    currSet = [...currWrong, ...lastWrong];
    lastWrong = currWrong;
    currWrong = [];

    let min = Math.min(gameData.length, curr + deckSize);
    for(let i = curr; i < min; i++) {
        currSet.push(i);
    }
    curr = min;
    card = 0;

    return true;
}

// -------------------------------------------------------- \\

async function init(_decks, info) {
    // Get user
    let [success, userData] = await UserGateway.getuser();
    if(!success) return void console.warn("Encountered while attempting to fetch user data:", userData) ?? false;
    user = userData;

    let deckInfo = [];
    let updateReviews = false;
    for(let i = 0; i < _decks.length; i++) {
        let deck = _decks[i];
        let [success, data] = await DeckGateway.get(deck, true, false);
        if(!success) {
            window.LOAD_ERROR("Looks like this deck doesn't exist, or there's an issue on our side.");
            console.error("Encountered while attempting to fetch deck of d_id(" + deck + "):", data);
            return false;
        }
        let userReview = user.userdata.reviews[deck];
        if(!userReview) {
            userReview = {};
            user.userdata.reviews[deck] = userReview;
            let json = JSON.stringify(user.reviews);
            await UserGateway.editUser("userdata", json);
        }
        let r_keys = Object.keys(userReview);
        for(let i = 0; i < r_keys.length; i++) {
            let userCard = userReview[r_keys[i]];
            let [q, last, box] = [r_keys[i], userCard.last, userCard.box];
            let deckCard = data.data.contnt[q];
            if(!deckCard) {
                delete userReview[q];
                updateReviews = true;
                continue;
            }
            if(info.NTRonly && !UserGateway.calculateNTR(box, last)) delete data.data.contnt[q];
            if(deckCard.dual) data.data.contnt[deckCard.ans[0]] = {
                ans: q,
                type: 'txt',
                fromDual: true
            }
        }
        user.userdata.reviews[deck] = userReview;
        let d_keys = Object.keys(data.data.contnt);
        let datalist = [];
        for(let i = 0; i < d_keys.length; i++) {
            data.data.contnt[d_keys[i]].q = d_keys[i];
            data.data.contnt[d_keys[i]].d_id = deck;
            datalist.push(data.data.contnt[d_keys[i]]);
        }
        deckInfo.push(datalist);
        decks.push(data.name);
    }
    if(updateReviews) {
        let json = JSON.stringify(user.reviews);
        await UserGateway.editUser("userdata", json);
    }
    // Add terms to deckInfo
    for(let i = 0; i < deckInfo.length; i++) {
        for(let j = 0; j < deckInfo[i].length; j++) {
            gameData.push(deckInfo[i][j]);
        }
    }
    // Scramble terms if needed
    if(info.randomTerms == true) {
        let save = gameData;
        gameData = [];
        while(save.length > 0) {
            let idx = random(0, save.length - 1);
            gameData.push(save[idx]);
            save.splice(idx, 1);
        }
    }
    // Edit settings
    deckSize = info.deckSize < 5 ? 5 : info.deckSize;
    infinite_mode = info.infinite_mode ?? false;
    active = true;
    card = 0;
    curr = 0;
    seen = 1;
    newSet();
    
    // Cache
    let cache_boxes = {};
    let cache_scores = {};

    const update = async () => {
        let csKeys = Object.keys(cardsSeen);
        for(let i = 0; i < csKeys.length; i++) {
            let card = gameData[parseInt(csKeys[i])];
            let holder = card.d_id;
            if(card.fromDual) continue;
            // Make sure the user has the question right at least once
            if(cardsSeen[csKeys[i]] <= totalWrong[csKeys[i]]) continue;
            // Cache holders for deck
            if(!cache_boxes[holder]) cache_boxes[holder] = {};
            if(!cache_scores[holder]) cache_scores[holder] = {};
            // Update card
            let userCard = user.userdata.reviews[holder][card.q];
            if(userCard) {
                if(!cache_boxes[holder][card.q]) cache_boxes[holder][card.q] = user.userdata.reviews[holder][card.q].box;
                if(!cache_scores[holder][card.q]) cache_scores[holder][card.q] = user.userdata.reviews[holder][card.q].score;
                user.userdata.reviews[holder][card.q].last = Date.now();
                let thisScore = cardsSeen[csKeys[i]] - (2 * (totalWrong[csKeys[i]] || 0)); // correct - wrong
                user.userdata.reviews[holder][card.q].score = (cache_scores[holder][card.q] * 0.8 + thisScore * 1.1).toFixed(3);
                if(user.userdata.reviews[holder][card.q].score < -1.25) {
                    user.userdata.reviews[holder][card.q].box = Math.max(cache_boxes[holder][card.q] - 1, 1);
                } else if(user.userdata.reviews[holder][card.q].score > 1.25) {
                    user.userdata.reviews[holder][card.q].box = Math.min(cache_boxes[holder][card.q] + 1, 6);
                }
            } else {
                let newcard = {
                    last: Date.now(),
                    box: 1,
                    score: ((cardsSeen[csKeys[i]] - (2 * (totalWrong[csKeys[i]] || 0))) * 1.1).toFixed(3)
                }
                newcard.box = newcard.score > 1.25 ? 2 : 1;
                cache_boxes[holder][card.q] = newcard.box;
                cache_scores[holder][card.q] = newcard.score;
                user.userdata.reviews[holder][card.q] = newcard;
            }
        }
        let json = JSON.stringify(user.userdata);
        await UserGateway.editUser("userdata", json);
    };
    updateFn = update;
    const updater = window.setInterval(() => {
        if(!active) window.clearInterval(updater); else update();
    }, 60_000);
    window.addEventListener("beforeunload", update);
    return true;
}
function fetchCurrentDecks() {
    return decks;
}
function fetchProblem() {
    if(!active) return {dead: true};
    console.log(currSet);
    return gameData[currSet[card]];
}
function getProgress() {
    return {
        total: gameData.length + C_w,
        seen,
        remaining: gameData.length + C_w - seen
    }
}
function updateLastCorrect(bool) {
    lastCorrect = bool;
    return bool;
}
function check(answer) {
    if(!active) return {dead: true};
    let problem = gameData[currSet[card]];
    switch(problem.type) {
        case "mc":
            if(problem.req == 1) {
                let c = true;
                for(let i = 0; i < problem.ans.length; i++) if(answer.indexOf(problem.ans[i]) < 0) c = false;
                return c;
            } else return problem.ans.indexOf(answer) > -1;
            // return problem.op[answer] == problem.ans ? updateLastCorrect(true) : updateLastCorrect(false);
        case "txt":
            for(let i = 0; i < problem.ans.length; i++) {
                if(problem.ans[i].toLowerCase().replaceAll(/\s/g, "") == answer.toLowerCase().replaceAll(/\s/g, "")) return true;
                //if(answer.toLowerCase().replaceAll(/\s/g, "") == problem.ans[i].toLowerCase().replaceAll(/\s/g, "")) return true;
            }
            return false;
            // return answer.toLowerCase().replaceAll(/\s/g, "") == problem.ans.toLowerCase().replaceAll(/\s/g, "") ? updateLastCorrect(true) : updateLastCorrect(false);
        case "ranking":
            for(let i = 0; i < answer.length; i++) {
                if(answer[i] !== problem.ans[i]) return false;
            }
            return true;
        case "matching":
            console.error("matching doesn't exist, idiot!");
    }
}
function isCorrect(answer) {
    if(!active) return {dead: true};
    let problem = gameData[currSet[card]];
    switch(problem.type) {
        case "mc":
            if(problem.req == 1) {
                let c = true;
                for(let i = 0; i < problem.ans.length; i++) if(answer.indexOf(problem.ans[i]) < 0) c = false;
                return c ? updateLastCorrect(true) : updateLastCorrect(false);
            } else return problem.ans.indexOf(answer) > -1 ? updateLastCorrect(true) : updateLastCorrect(false);
        case "txt":
            for(let i = 0; i < problem.ans.length; i++) {
                if(problem.ans[i].toLowerCase().replaceAll(/\s/g, "") == answer.toLowerCase().replaceAll(/\s/g, "")) return updateLastCorrect(true);
                //if(answer.toLowerCase().replaceAll(/\s/g, "") == problem.ans[i].toLowerCase().replaceAll(/\s/g, "")) return updateLastCorrect(true);
            }
            return updateLastCorrect(false);
            // return answer.toLowerCase().replaceAll(/\s/g, "") == problem.ans.toLowerCase().replaceAll(/\s/g, "") ? updateLastCorrect(true) : updateLastCorrect(false);
        case "ranking":
            for(let i = 0; i < answer.length; i++) {
                if(answer[i] !== problem.ans[i]) return updateLastCorrect(false)
            }
            return updateLastCorrect(true);
        case "matching":
            console.error("matching doesn't exist, idiot!");
    }
}
function getLastCorrect() {
    return lastCorrect;
}
function markCorrect() {
    lastCorrect = true;
}
function _continue() {
    return lastCorrect ? correct() : incorrect();
}
function isDead() {
    return active == false;
}
// -- Local functions
function correct() {
    lastCorrect = false;
    let success = iterateCard();
    if(!success) active = false;
    return true;
}
function incorrect() {
    currWrong.push(currSet[card]);
    C_w++;
    seen--;
    if(totalWrong[currSet[card]]) totalWrong[currSet[card]]++; else totalWrong[currSet[card]] = 1;
    return !correct();
}

// -------------------------------------------------------- \\

const Game = {
    init,
    fetchCurrentDecks,
    fetchProblem,
    getProgress,
    isCorrect,
    markCorrect,
    getLastCorrect,
    check,
    continue: _continue,
    isDead,
};
export { Game };