// !! NOTE !!
// This library version should not be utilized for production purposes.

import { UserGateway } from "../../server/client-gateway/user-gateway.js";
import { DeckGateway } from "../../server/client-gateway/deck-gateway.js";

// -------------------------------------------------------- \\

let user;

let decks = [];
let gameData = []; // all questions data + totalWrong count

let deckSize = 5;
let cardRepeat = 2;
let curr = 3, ls = 1, lls = 1;
let currentSet = 0;
let g_norand = true;

let randomSet = [];
let rndSetData = {};
const currWrong = [];
const wasWrong = [];
const lsWrong = [];
const llsWrong = [];
const lsShown = [];
const llsShown = [];
let card = 0;
let active = true;

let seen = 0;
let C_lw = 0;
let C_gw = 0;
let E_s = 0;
let C_pwsets = 0;

const totalWrong = {};
const cardsSeen = {};
let updateFunc;

let lastCorrect = false;

// -------------------------------------------------------- \\

function random(a, b) {
    return Math.floor(Math.random() * (b - a) + a + 0.5);
}

// -------------------------------------------------------- \\

function iterateProblem() {
    // edit cardsSeen
    if(cardsSeen[randomSet[card]]) {
        cardsSeen[randomSet[card]]++;
    } else {
        cardsSeen[randomSet[card]] = 1;
    }
    // next
    card++;
    seen++;
    if(card >= randomSet.length) return newRandomDeck(); // finished set! next set + restart process
    return true;
}
function newRandomDeck() {
    if(gameData.length - currentSet * deckSize <= 0) {
        active = false;
        currentSet--;
        randomSet = [];
        rndSetData = {};
        card = 0;
        E_s = 0;
        C_lw = 0;
        C_pwsets = 0;
        seen--;
        updateFunc();
        return false;
    }
    // calculate remaining cards, including this set
    let len = gameData.length - currentSet * deckSize;
    let s_curr = curr, s_ls = ls, s_lls = lls;
    // if no last set OR last last set
    if(currentSet < 2) {
        s_ls += s_lls;
        s_lls = 0;
    }
    if(currentSet < 1) {
        s_curr += s_ls;
        s_ls = 0;
    }
    // If currentSet = 0 and len < deckSize; less problems than deckSize, so adjust accordingly
    if(currentSet == 0 && len < deckSize) s_curr = len;
    // Get problems
    randomSet = [];
    let problems = [];
    let available = [];
    for(let i = currentSet * deckSize; i < currentSet * deckSize + Math.min(len, deckSize); i++) {
        if(!rndSetData[i]) rndSetData[i] = 0;
        if(rndSetData[i] < cardRepeat) available.push(i);
    }
    if(available.length == 0 && currWrong.length == 0 && lsWrong.length == 0 && llsWrong.length == 0) {
        // finished set - move on to next set
        currentSet++;
        C_gw += C_lw;
        E_s = 0;
        C_lw = 0;
        C_pwsets = 0;
        card = 0;
        return newRandomDeck();
    }
    let k = 0;
    while(k < s_curr) {
        if(currWrong.length > 0) {
            let p = random(0, currWrong.length - 1);
            if(problems.indexOf(currWrong[p]) > -1) continue;
            problems.push(currWrong[p]);
            rndSetData[currWrong[p]]++;
            let idx = available.indexOf(currWrong[p]);
            if(idx > -1) available.splice(idx, 1);
            if(wasWrong.indexOf(currWrong[p]) < 0) wasWrong.push(currWrong[p]);
            currWrong.splice(p, 1);
        } else if(available.length > 0) {
            let p;
            if(g_norand == true) {
                p = 0;
            } else {
                p = random(0, available.length - 1);
                if(problems.indexOf(available[p]) > -1) continue;
            }
            problems.push(available[p]);
            rndSetData[available[p]]++;
            available.splice(p, 1);
        } else {
            break;
        }
        k++;
    }
    if(s_ls > 0) {
        k = 0;
        while(k < s_ls) {
            // Combat repetition of one/some particular terms constantly and distribute percentages of being shown across terms
            if(lsShown.length == 0) {
                for(let i = 0; i < deckSize; i++) {lsShown.push((currentSet - 1) * deckSize + i);}
            }
            let idx = random(0, lsShown.length - 1);
            let p = lsShown[idx];
            if(lsWrong.length > 0) {
                idx = random(0, lsWrong.length - 1);
                p = lsWrong[idx];
            } else if(wasWrong.length > 0) {
                for(let i = 0; i < wasWrong.length; i++) {
                    if(wasWrong[i] < currentSet * deckSize && wasWrong[i] >= (currentSet - 1) * deckSize) {
                        idx = i;
                        p = wasWrong[i];
                        break;
                    }
                }
            }
            if(problems.indexOf(p) > -1) continue;
            if(lsWrong.length > 0) {
                lsWrong.splice(idx, 1);
                if(lsShown.indexOf(p) > -1) lsShown.splice(lsShown.indexOf(p), 1);
                if(wasWrong.indexOf(p) > -1) wasWrong.splice(wasWrong.indexOf(p), 1);
            } else if(wasWrong.length > 0 && idx !== undefined) {
                wasWrong.splice(idx, 1);
                if(lsShown.indexOf(p) > -1) lsShown.splice(lsShown.indexOf(p), 1);
            } else {
                lsShown.splice(idx, 1);
            }
            problems.push(p);
            k++;
        }
    }
    if(s_lls > 0) {
        k = 0;
        while(k < s_lls) {
            // Combat repetition of one/some particular terms constantly and distribute percentages of being shown across terms
            if(llsShown.length == 0) {
                for(let i = 0; i < (currentSet - 1) * deckSize - 1; i++) {llsShown.push(i);}
            }
            let idx = random(0, llsShown.length - 1);
            let p = llsShown[idx];
            if(llsWrong.length > 0) {
                idx = random(0, llsWrong.length - 1);
                p = llsWrong[idx];
            } else if(wasWrong.length > 0) {
                for(let i = 0; i < wasWrong.length; i++) {
                    if(wasWrong[i] < (currentSet - 1) * deckSize) {
                        idx = i;
                        p = wasWrong[i];
                        break;
                    }
                }
            }
            if(problems.indexOf(p) > -1) continue;
            if(llsWrong.length > 0) {
                llsWrong.splice(idx, 1);
                if(llsShown.indexOf(p) > -1) llsShown.splice(llsShown.indexOf(p), 1);
                if(wasWrong.indexOf(p) > -1) wasWrong.splice(wasWrong.indexOf(p), 1);
            } else if(wasWrong.length > 0 && idx !== undefined) {
                wasWrong.splice(0, 1);
                if(llsShown.indexOf(p) > -1) llsShown.splice(llsShown.indexOf(p), 1);
            } else {
                llsShown.splice(idx, 1);
            }
            problems.push(p);
            k++;
        }
    }
    randomSet = problems;
    E_s++;
    card = 0;
    console.log(randomSet);
    return true;
}

// -------------------------------------------------------- \\

async function init(_decks, info) {
    // Get user
    let [success, userData] = await UserGateway.getuser();
    if(!success) {
        console.warn("Encountered while attempting to fetch user data:", userData);
        return false;
    }
    user = userData;
    // Get deck info
    let deckInfo = [];
    let updateReviews = false;
    for(let i = 0; i < _decks.length; i++) {
        let deck = _decks[i];
        // Get deck
        let [success, data] = await DeckGateway.get(deck);
        if(!success) {
            console.error("Encountered while attempting to fetch deck of d_id(" + deck + "):", data);
            return false;
        }
        let userReview = user.reviews[deck];
        // let userReview;
        // let idx;
        // for(let j = 0; j < user.reviews.length; j++) {
        //     if(user.reviews[j].deckid == deck) {
        //         userReview = user.reviews[j];
        //         idx = j;
        //         break;
        //     }
        // }
        if(!userReview) {
            // Doesn't exist in our reviews? interesting... regardless, might as well add it if for some reason specified...?
            userReview = {};
            user.reviews[deck] = userReview;
            let json = JSON.stringify(user.reviews);
            await UserGateway.editUser("reviews", json);
        }
        let updateIdx = false;
        let r_keys = Object.keys(userReview);
        for(let i = 0; i < r_keys.length; i++) {
            let userCard = userReview[r_keys[i]];
            let q = r_keys[i];
            let last = userCard.last;
            let box = userCard.box;
            let deckCard = data.data.contnt[q];
            if(info.NTRonly && deckCard) {
                let ntr = UserGateway.calculateNTR(box, last);
                if(!ntr) delete data.data.contnt[q];
            }
            if(!deckCard) {
                delete userReview[r_keys[i]];
                updateReviews = true;
                updateIdx = true;
            }
        }
        if(updateIdx) user.reviews[deck] = userReview;
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
        await UserGateway.editUser("reviews", json);
    }
    // Add terms to deckInfo
    for(let i = 0; i < deckInfo.length; i++) {
        for(let j = 0; j < deckInfo[i].length; j++) {
            gameData.push(deckInfo[i][j]);
        }
    }
    // Scramble terms if needed
    if(info.randomTerms == true) {
        g_norand = false;
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
    cardRepeat = info.cardRepeat < 1 ? 1 : info.cardRepeat;
    [curr, ls, lls] = info.deckdistr;
    card = 0;
    seen = 1;
    newRandomDeck();
    
    // Cache
    let cache_boxes = {};
    let cache_scores = {};
    // let cache_deckIds = {};

    const update = async () => {
        let csKeys = Object.keys(cardsSeen);
        for(let i = 0; i < csKeys.length; i++) {
            let card = gameData[parseInt(csKeys[i])];
            let holder = card.d_id;
            // Make sure the user has the question right at least once
            if(cardsSeen[csKeys[i]] <= totalWrong[csKeys[i]]) continue;
            // Cache holders for deck
            if(!cache_boxes[holder]) cache_boxes[holder] = {};
            if(!cache_scores[holder]) cache_scores[holder] = {};
            // Update card
            let userCard = user.reviews[holder][card.q];
            if(userCard) {
                if(!cache_boxes[holder][card.q]) cache_boxes[holder][card.q] = user.reviews[holder][card.q].box;
                if(!cache_scores[holder][card.q]) cache_scores[holder][card.q] = user.reviews[holder][card.q].score;
                user.reviews[holder][card.q].last = Date.now();
                let thisScore = cardsSeen[csKeys[i]] - (2 * (totalWrong[csKeys[i]] || 0)); // correct - wrong
                user.reviews[holder][card.q].score = (cache_scores[holder][card.q] * 0.8 + thisScore * 1.1).toFixed(3);
                if(user.reviews[holder][card.q].score < -1.25) {
                    user.reviews[holder][card.q].box = Math.max(cache_boxes[holder][card.q] - 1, 1);
                } else if(user.reviews[holder][card.q].score > 1.25) {
                    user.reviews[holder][card.q].box = Math.min(cache_boxes[holder][card.q] + 1, 6);
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
                user.reviews[holder][card.q] = newcard;
            }
        }
        let json = JSON.stringify(user.reviews);
        await UserGateway.editUser("reviews", json);
    };
    updateFunc = update;
    const updater = window.setInterval(() => {
        if(!active) window.clearInterval(updater);
        update();
    }, 60_000);
    window.addEventListener("beforeunload", update);
    return true;
}
function fetchCurrentDecks() {
    return decks;
}
function fetchProblem() {
    if(!active) return {dead: true};
    return gameData[randomSet[card]];
}
function get_pwsets() {
    // Returns the additional number of sets that will be generated due to incorrect ls & lls problems
    
    // Due to cardRepeat, questions from currWrong may also count as normal questions which will be counted as normally seen; therefore, actual extra questions will differ.
    // We will have to use rndSetData and currWrong to see which ones have been fully marked by rndSetData and aren't eligible to be seen normally, and then mark those as
    // ACTUAL wrong questions.
    let realWrong = currWrong.length;
    if(cardRepeat > 1) {
        realWrong = 0;
        for(let i = 0; i < currWrong.length; i++) {
            let seen = rndSetData[currWrong[i]];
            if(seen >= cardRepeat) realWrong++;
        }
    }

    let len = gameData.length - deckSize;
    let real_deckSize = len < deckSize ? len : deckSize;
    let s_curr = curr;

    if(currentSet < 1) s_curr = real_deckSize;
    let S_ll = Math.ceil((real_deckSize * cardRepeat + realWrong) / s_curr) + C_lw;

    // p functions: p_1 and p_2
    let p_1 = currentSet > 1 ? ls : ls + lls;
    let p_2 = currentSet > 1 ? lls : 0;

    let ls_rfactor = (S_ll - E_s) * p_1; // ls wrong: resolve factor
    let lls_rfactor = (S_ll - E_s) * p_2; // lls wrong: resolve factor

    let ls_left = Math.ceil((lsWrong.length - ls_rfactor) / p_1);
    let lls_left = p_2 > 0 ? Math.ceil((llsWrong.length - lls_rfactor) / p_2) : 0;

    let left = Math.max(ls_left, lls_left);
    
    if(left < 0) left = 0;

    return left;    
}
function getProgress() {
    // Calculate new global/local caches for C_w
    let prev = ls + lls;
    let len = gameData.length - currentSet * deckSize;
    let real_deckSize = len < deckSize ? len : deckSize;
    // Due to cardRepeat, questions from currWrong may also count as normal questions which will be counted as normally seen; therefore, actual extra questions will differ.
    // We will have to use rndSetData and currWrong to see which ones have been fully marked by rndSetData and aren't eligible to be seen normally, and then mark those as
    // ACTUAL wrong questions.
    let realWrong = currWrong.length;
    if(cardRepeat > 1) {
        realWrong = 0;
        for(let i = 0; i < currWrong.length; i++) {
            let seen = rndSetData[currWrong[i]];
            if(seen >= cardRepeat) realWrong++;
        }
    }

    // Update local first
    let s_curr = curr;

    if(currentSet < 1) s_curr = real_deckSize;
    let S_ll = Math.ceil((real_deckSize * cardRepeat + realWrong) / s_curr);
    let S_ll_std = Math.ceil(real_deckSize * cardRepeat / s_curr) + C_lw;
    if(S_ll - S_ll_std > 0) {
        // diff greater than previous C_lw; add
        // S_ll greater than standard, meaning wrong count leads to a new set
        C_lw += S_ll - S_ll_std;
    }

    // Globally
    // 5 / 8?
    let S_l = Math.ceil(real_deckSize / curr) * (gameData.length / curr - 2) + Math.ceil((real_deckSize + realWrong) / curr) + C_gw;
    let S_l_std = Math.ceil(real_deckSize / curr) * (gameData.length / curr - 1) + C_gw + C_lw;
    if(S_l < 0) S_l = 0;
    if(S_l_std < 0) S_l_std = 0;
    if(S_l - S_l_std > 0) {
        // same logic, but globally
        C_gw += S_l - S_l_std;
    }

    let left = get_pwsets();

    console.log(gameData.length * cardRepeat, realWrong, S_l * prev, prev * left);
    console.log(seen);

    let obj = {
        seen,
        total: 
            // Initially based on a 16-card deck w/ deckSize 8:
            gameData.length * cardRepeat            // d_s * r  (all cards)
            + realWrong                             // w        (all wrong cards)
            + S_l * prev                            // S_l(2)   (all previous cards shown)
            + prev * left,                          // 2 * (ls_w - (ceil(8r / 6) + cl_w - e_s)(p(c_d)))  
    };
    obj.remaining = obj.total - obj.seen;
    return obj;
}
function updateLastCorrect(bool) {
    lastCorrect = bool;
    return bool;
}
function isCorrect(answer) {
    if(!active) return {dead: true};
    let problem = gameData[randomSet[card]];
    switch(problem.type) {
        case "mc":
            return problem.op[answer] == problem.ans ? updateLastCorrect(true) : updateLastCorrect(false);
        case "txt":
            return answer.toLowerCase().replaceAll(/\s/g, "") == problem.ans.toLowerCase().replaceAll(/\s/g, "") ? updateLastCorrect(true) : updateLastCorrect(false);
        case "ranking":
            let isCorrect = true;
            for(let i = 0; i < answer.length; i++) {
                if(answer[i] !== problem.ans[i]) isCorrect = false;
            }
            return isCorrect ? updateLastCorrect(true) : updateLastCorrect(false);
        case "matching":
            console.error("matching doesn't exist, idiot!");
    }
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
    let success = iterateProblem();
    if(!success) active = false;
    return true;
}
function incorrect() {
    if(randomSet[card] >= currentSet * deckSize) {
        currWrong.push(randomSet[card]);
        // Usually, we'd deduct one from "seen" so that the progress system resolves in the end.
        // However, with cardRepeat, the card may be shown as both incorrect and normally shown; so, no extra is shown.
        // Therefore, we need to check for this exception.
        seen--; // normally remove
        if(cardRepeat > 1 && rndSetData[randomSet[card]] < cardRepeat) seen++; // remove the reduction to normalize
    } else if(randomSet[card] >= (currentSet - 1) * deckSize) {
        lsWrong.push(randomSet[card]);
        let left = get_pwsets();
        if(left > C_pwsets) {
            C_pwsets = left;
            seen -= (ls + lls) * C_pwsets;
        }
    } else {
        llsWrong.push(randomSet[card]);
        let left = get_pwsets();
        if(left > C_pwsets) {
            C_pwsets = left;
            seen -= (ls + lls) * C_pwsets;
        }
    }
    if(totalWrong[randomSet[card]]) {
        totalWrong[randomSet[card]]++;
    } else {
        totalWrong[randomSet[card]] = 1;
    }
    correct();
    return false;
}

// -------------------------------------------------------- \\

const Game = {
    init,
    fetchCurrentDecks,
    fetchProblem,
    getProgress,
    isCorrect,
    markCorrect,
    continue: _continue,
    isDead
};
export { Game };