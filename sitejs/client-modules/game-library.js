import { UserGateway } from "../../server/client-gateway/user-gateway.js";
import { DeckGateway } from "../../server/client-gateway/deck-gateway.js";

let user;

let decks = [];
let gameData = [];

let deckSize = 5;
let curr = 0;
let infinite_mode = false;

let currSet = [], currWrong = [], lastWrong = [];
let card = 0;
let active = false;

let seen = 0, C_w = 0;

const totalWrong = {};
const cardsSeen = {};
const timeSpent = {};
let updateFn;

let lastCorrect = false, reshow_correct;

// -------------------------------------------------------- \\

function random(a, b) {
    return Math.floor(Math.random() * (b - a) + a + 0.5);
}
function avg(arr) {
    if(arr.length == 0) 
        return 0;
    let total = 0;
    for(let num of arr)
        total += num;
    return total / arr.length;
}
function filter_outliers(arr) {
    let v = avg(arr);
    for(let i = 0; i < arr.length; i++) {
        if(Math.abs(arr[i] - v) > v * 2) {
            arr.splice(i, 1);
            i--;
        }
    }
    return arr;
}
function getDist(a, b) {
    const matrix = [];
    for (let i = 0; i <= b.length; i++)
        matrix[i] = [i];
    for (let j = 0; j <= a.length; j++)
        matrix[0][j] = j;
    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            if (b.charAt(i - 1) === a.charAt(j - 1))
                matrix[i][j] = matrix[i - 1][j - 1];
            else
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1,
                    Math.min(matrix[i][j - 1] + 1, matrix[i - 1][j] + 1)
                );
        }
    }
    return matrix[b.length][a.length];
}

// -------------------------------------------------------- \\

function iterateCard() {
    if(cardsSeen[currSet[card]]) 
        cardsSeen[currSet[card]]++; 
    else 
        cardsSeen[currSet[card]] = 1;
    card++;
    seen++;
    if(card >= currSet.length) 
        return newSet();
    return true;
}
function newSet() {
    if(gameData.length - curr <= 0 && currWrong.length == 0 && lastWrong.length == 0) {
        card = 0;
        if(infinite_mode) 
            curr = 0;
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
    for(let i = curr; i < min; i++) 
        currSet.push(i);
    
    curr = min;
    card = 0;

    return true;
}

// -------------------------------------------------------- \\

async function init(_decks, info) {
    // Get user
    let [success, userData] = await UserGateway.getuser(false, true, true, false);
    if(!success) 
        return void console.warn("Encountered while attempting to fetch user data:", userData) ?? false;
    user = userData;

    // Unsanitize
    user.userdata.reviews = window.lib.recur_decode(user.userdata.reviews);

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
            let json = JSON.stringify(user.userdata.reviews);
            await UserGateway.editUser("reviews", json);
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
            if(info.NTRonly && !UserGateway.calculateNTR(box, last)) 
                delete data.data.contnt[q];
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
        let json = JSON.stringify(user.userdata.reviews);
        await UserGateway.editUser("reviews", json);
    }
    // Add terms to deckInfo
    for(let i = 0; i < deckInfo.length; i++)
        for(let j = 0; j < deckInfo[i].length; j++)
            gameData.push(deckInfo[i][j]);
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
    let cache_times = {};

    const update = async () => {
        let csKeys = Object.keys(cardsSeen);
        for(let i = 0; i < csKeys.length; i++) {
            let card = gameData[parseInt(csKeys[i])];
            let holder = card.d_id;
            if(card.fromDual) continue;
            // Make sure the user has the question right at least once
            if(cardsSeen[csKeys[i]] <= totalWrong[csKeys[i]]) continue;
            // Cache holders for deck
            if(!cache_boxes[holder]) 
                cache_boxes[holder] = {};
            if(!cache_scores[holder]) 
                cache_scores[holder] = {};
            if(!cache_times[holder]) 
                cache_times[holder] = {};
            // Update card
            let userCard = user.userdata.reviews[holder][card.q];
            if(userCard) {
                if(!cache_boxes[holder][card.q]) 
                    cache_boxes[holder][card.q] = user.userdata.reviews[holder][card.q].box;
                if(!cache_scores[holder][card.q]) 
                    cache_scores[holder][card.q] = user.userdata.reviews[holder][card.q].score;
                if(!cache_times[holder][card.q]) 
                    cache_times[holder][card.q] = user.userdata.reviews[holder][card.q].time ?? avg(filter_outliers(timeSpent[csKeys[i]]));
                user.userdata.reviews[holder][card.q].last = Date.now();
                let thisScore = cardsSeen[csKeys[i]] - (2 * (totalWrong[csKeys[i]] ?? 0)); // correct - wrong
                user.userdata.reviews[holder][card.q].score = (cache_scores[holder][card.q] * 0.4 + thisScore * 0.6).toFixed(3);
                user.userdata.reviews[holder][card.q].time = (cache_times[holder][card.q] * 0.4 + avg(filter_outliers(timeSpent[csKeys[i]])) * 0.6).toFixed(3);
                if(user.userdata.reviews[holder][card.q].score < -1.25)
                    user.userdata.reviews[holder][card.q].box = Math.max(cache_boxes[holder][card.q] - 1, 1);
                else if(user.userdata.reviews[holder][card.q].score > 1.25)
                    user.userdata.reviews[holder][card.q].box = Math.min(cache_boxes[holder][card.q] + 1, 6);
            } else {
                let newcard = {
                    last: Date.now(),
                    box: 1,
                    time: avg(filter_outliers(timeSpent[csKeys[i]])),
                    score: ((cardsSeen[csKeys[i]] - (2 * (totalWrong[csKeys[i]] ?? 0))) * 1.1).toFixed(3)
                }
                newcard.box = Math.floor((cardsSeen[csKeys[i]] - (totalWrong[csKeys[i]] ?? 0)) / cardsSeen[csKeys[i]] * 5) + 1;
                cache_boxes[holder][card.q] = newcard.box;
                cache_scores[holder][card.q] = newcard.score;
                cache_times[holder][card.q] = newcard.time;
                user.userdata.reviews[holder][card.q] = newcard;
            }
        }
        let json = JSON.stringify(user.userdata.reviews);
        await UserGateway.editUser("reviews", json);
    };
    updateFn = update;
    const updater = window.setInterval(() => 
        active ? update() : window.clearInterval(updater)
    , 60_000);
    window.addEventListener("beforeunload", update);
    return true;
}
function fetchDecks() {
    return decks;
}
function unsafeFetchDecks() {
    return window.lib.recur_decode(decks);
}
function fetchProblem() {
    if(!active) return { dead: true };
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
    if(!active) return { dead: true };
    let problem = gameData[currSet[card]];
    switch(problem.type) {
        case "mc":
            if(problem.req == 1) {
                for(let i = 0; i < problem.ans.length; i++) 
                    if(answer.indexOf(problem.ans[i]) < 0) 
                        return false;
                return true;
            } else return problem.ans.indexOf(answer) > -1;
        case "txt":
            for(let i = 0; i < problem.ans.length; i++)
                if(answer.toLowerCase().replaceAll(/\s/g, "") == window.lib.decode(problem.ans[i]).toLowerCase().replaceAll(/\s/g, "")) 
                    return true;
            return false;
        case "ranking":
            for(let i = 0; i < answer.length; i++)
                if(answer[i] !== window.lib.decode(problem.ans[i])) 
                    return false;
            return true;
        case "mtch":
            // Note that game.js already handles mtch, so we don't need to
            console.error("can't check mtch; use game.js");
    }
}
function lazyCheck(answer) {
    if(!active) return { dead: true };
    let problem = gameData[currSet[card]];
    switch(problem.type) {
        case "txt":
            for(let i = 0; i < problem.ans.length; i++) {
                let realAns = window.lib.decode(problem.ans[i]).toLowerCase().replaceAll(/\s/g, "");
                let userAns = answer.toLowerCase().replaceAll(/\s/g, "");
                if(userAns == realAns || getDist(userAns, realAns) <= 2) 
                    return true;
            }
            return false;
        default:
            return check(answer);
    }
}
function isLazyCorrect(answer) {
    if(!active) return { dead: true };
    return updateLastCorrect(lazyCheck(answer));  
}
function isCorrect(answer) {
    if(!active) return { dead: true };
    return updateLastCorrect(check(answer));
}
function getLastCorrect() {
    return lastCorrect;
}
function markCorrect() {
    lastCorrect = true;
}
function registerTick(len) {
    len /= 1000;
    if(timeSpent[currSet[card]]) 
        timeSpent[currSet[card]].push(len);
    else 
        timeSpent[currSet[card]] = [len];
}
function _continue() {
    return (reshow_correct == null ? lastCorrect : reshow_correct) ? correct() : incorrect();
}
function reshow() {
    if(reshow_correct == null) reshow_correct = lastCorrect;
    if(!lastCorrect && totalWrong[currSet[card]]) 
        totalWrong[currSet[card]]++; 
    else if(!lastCorrect) 
        totalWrong[currSet[card]] = 1;
    lastCorrect = false;
    return true;
}
function isDead() {
    return !active;
}
// -- Local functions
function correct() {
    lastCorrect = false;
    reshow_correct = null;
    let success = iterateCard();
    if(!success) 
        active = false;
    return true;
}
function incorrect() {
    currWrong.push(currSet[card]);
    C_w++;
    seen--;
    if(totalWrong[currSet[card]]) 
        totalWrong[currSet[card]]++;
    else 
        atotalWrong[currSet[card]] = 1;
    return !correct();
}


// -------------------------------------------------------- \\


const Game = {
    init,
    fetchDecks,
    unsafeFetchDecks,
    fetchProblem,
    getProgress,
    isCorrect,
    isLazyCorrect,
    markCorrect,
    registerTick,
    getLastCorrect,
    check,
    continue: _continue,
    reshow,
    isDead,
};
export { Game };