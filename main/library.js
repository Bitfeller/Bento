import { UserGateway } from "./user_gateway.js";
import { DeckGateway } from "./deck_gateway.js";

// -------------------------------------------------------- \\

var user;

var decks = [];
var gameData = [
    // all questions data + totalWrong count
];

var deckSize = 5;
var cardRepeat = 2;
var curr_p = 0.5, ls_p = 0.3, lls_p = 0.2;
var currentSet = 0;

var randomSet = [];
var rndSetData = {};
var currWrong = [];
var wasWrong = [];
var lsWrong = [];
var llsWrong = [];
var card = 0;
var active = true;
var seen = 0;

var totalWrong = {};
var cardsSeen = {};
var updateFunc;

// -------------------------------------------------------- \\

function random(a, b) {
    return Math.floor(Math.random() * (b - a) + a + 0.5);
}

// -------------------------------------------------------- \\

function iterateProblem() {
    // edit cardsSeen
    if(cardsSeen[""+randomSet[card]]) {
        cardsSeen[""+randomSet[card]] += 1;
    } else {
        cardsSeen[""+randomSet[card]] = 1;
    }
    // next
    card += 1;
    if(card >= randomSet.length) {
        // finished set! next set + restart process
        let res = newRandomDeck();
        if(randomSet[card] >= currentSet * deckSize) {
            seen += 1;
        }
        return res;
    }
    if(randomSet[card] >= currentSet * deckSize) {
        seen += 1;
    }
    return true;
}
function newRandomDeck() {
    if(gameData.length - currentSet * deckSize <= 0) {
        active = false;
        randomSet = [];
        rndSetData = {};
        card = 0;
        updateFunc();
        return false;
    }
    // percentages
    let curr = curr_p, ls = ls_p, lls = lls_p;
    // calculate remaining cards, including this set
    let len = gameData.length - currentSet * deckSize;
    // if no last set OR last last set
    if(currentSet < 2) {
        ls += lls;
        lls = 0;
    }
    if(currentSet < 1) {
        curr += ls;
        ls = 0;
    }
    // Get number of problems to fetch
    curr = Math.floor(curr * Math.min(len, deckSize) + 0.5);
    ls = Math.floor(ls * deckSize + 0.5);
    lls = Math.floor(lls * deckSize + 0.5);
    // Too many
    if(curr + ls + lls > deckSize) {
        let lsLarger = ls > lls;
        let equal = ls == lls;
        let even = (curr + ls + lls - deckSize) % 2 == 0;
        if(curr > deckSize) {
            // RARE SITUATION; curr_p > 1
            curr -= curr + ls + lls - deckSize;
            if(curr < ls) curr = ls;
        }
        if(lsLarger) {
            ls -= curr + ls + lls - deckSize;
            if(ls < 1) {
                lls -= 1 - ls;
                ls = 1;
                if(lls < 1) lls = 1;
            }
        } else if(!equal) {
            lls -= curr + ls + lls - deckSize;
            if(lls < 1) {
                lls = 1;
                ls -= curr + ls + lls - deckSize;
                if(ls < 1) ls = 1;
            }
        } else {
            if(!even) curr -= 1;
            let amount = (curr + ls + lls - deckSize) / 2;
            ls -= amount;
            lls -= amount;
            if(ls < 1) {
                ls = 1;
                lls = 1;
            }
        }
        if((curr + ls + lls - deckSize) > 0) curr -= (curr + ls + lls - deckSize);
    }
    if(curr + ls + lls < deckSize) {
        let equal = curr == ls;
        let even = (deckSize - curr - ls - lls) % 2 == 0;
        if(equal) {
            if(!even) curr += 1;
            let amount = (deckSize - curr - ls - lls) / 2;
            curr += amount;
            ls += amount;
        } else if(len >= deckSize) {
            curr += (deckSize - curr - ls - lls);
        } else {
            ls += (deckSize - curr - ls - lls);
        }
    }
    // Get problems
    randomSet = [];
    let problems = [];
    let available = [];
    for(let i = currentSet * deckSize; i < currentSet * deckSize + Math.min(len, deckSize); i++) {
        if(rndSetData[""+i] && rndSetData[""+i] < cardRepeat) {
            available.push(i);
        } else if(!rndSetData[""+i]) {
            rndSetData[""+i] = 0;
            available.push(i);
        }
    }
    if(available.length == 0 && currWrong.length == 0 && lsWrong.length == 0 && llsWrong.length == 0) {
        // finished set - move on to next set
        currentSet += 1;
        card = 0;
        return newRandomDeck();
    }
    let k = 0;
    while(k < curr) {
        if(currWrong.length > 0) {
            let p = random(0, currWrong.length - 1);
            if(problems.indexOf(currWrong[p]) > -1) continue;
            problems.push(currWrong[p]);
            rndSetData[""+currWrong[p]] += 1;
            let idx = available.indexOf(currWrong[p]);
            if(idx > -1) available.splice(idx, 1);
            if(wasWrong.indexOf(currWrong[p]) < 0) wasWrong.push(currWrong[p]);
            currWrong.splice(p, 1);
        } else if(available.length > 0) {
            let p = random(0, available.length - 1);
            if(problems.indexOf(available[p]) > -1) continue;
            problems.push(available[p]);
            rndSetData[""+available[p]] += 1;
            available.splice(p, 1);
        } else {
            break;
        }
        k++;
    }
    if(ls > 0) {
        k = 0;
        while(k < ls) {
            let p = random((currentSet - 1) * deckSize, currentSet * deckSize);
            let idx;
            if(lsWrong > 0) {
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
            } else if(wasWrong.length > 0 && idx !== undefined) {
                wasWrong.splice(0, 1);
            }
            problems.push(p);
            k++;
        }
    }
    if(lls > 0) {
        k = 0;
        while(k < lls) {
            let p = random(0, (currentSet - 1) * deckSize - 1);
            let idx;
            if(llsWrong.length > 0) {
                idx = random(0, llsWrong.length - 1);
                p = llsWrong[idx];
            } else if(wasWrong.length > 0) {
                for(let i = 0; i < wasWrong.length; i++) {
                    if(wasWrong[i] < (currentSet - 1) * deckSize) {
                        idx = i;
                        p = wasWrong[i];
                    }
                }
            }
            if(problems.indexOf(p) > -1) continue;
            if(llsWrong.length > 0) {
                llsWrong.splice(idx, 1);
            } else if(wasWrong.length > 0 && idx !== undefined) {
                wasWrong.splice(0, 1);
            }
            problems.push(p);
            k++;
        }
    }
    randomSet = problems;
    console.log(randomSet);
    card = 0;
}

// -------------------------------------------------------- \\

async function init(_decks, info) {
    // Get user
    let [success, userData] = await UserGateway.getuser();
    if(!success) {
        console.warn("Encountered while attempting to fetch user data: " + userData);
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
            console.log("Encountered while attempting to fetch deck of d_id(" + deck + "): " + data);
            return false;
        }
        let userReview;
        let idx;
        for(let j = 0; j < user.reviews.length; j++) {
            if(user.reviews[i].deckid == deck) {
                userReview = user.reviews[i];
                idx = i;
            }
        }
        if(!userReview) {
            userReview = {
                deckid: deck,
                cards: []
            };
            user.reviews.push(userReview);
            idx = user.reviews.length - 1;
            let json = JSON.stringify(user.reviews);
            await UserGateway.editUser("reviews", json);
        }
        let updateIdx = false;
        for(let j = 0; j < userReview.cards.length; j++) {
            let userCard = userReview.cards[j];
            let question = userCard.question;
            let lastSeen = userCard.lastSeen;
            let box = userCard.box;
            // deprecated: let successCount = userCard.successCount;
            let found = false;
            for(let k = 0; k < data.data.deckData.length; k++) {
                if(data.data.deckData[k].question == question) {
                    found = true;
                    // calculate if only need-to-review cards AND whether it's needed for review
                    if(info.NTRonly) {
                        let ntr = UserGateway.calculateNTR(box, lastSeen);
                        if(!ntr) {
                            data.data.deckData.splice(k, 1);
                        }
                    }
                    break;
                }
            }
            if(!found) {
                userReview.cards.splice(j, 1);
                updateReviews = true;
                updateIdx = true;
                j -= 1;
            }
            // ["question", 0, last_time_they_saw_it = -1]
        }
        if(updateIdx) {
            user.reviews[idx] = userReview;
        }
        for(let i = 0; i < data.data.deckData.length; i++) {
            data.data.deckData[i].deckid = deck;
        }
        deckInfo.push(data.data.deckData);
        decks.push(data.name);
    }
    if(updateReviews) {
        let json = JSON.stringify(user.reviews);
        await UserGateway.editUser("reviews", json);
    }
    console.log(deckInfo);
    // Add terms to deckInfo
    for(let i = 0; i < deckInfo.length; i++) {
        for(let j = 0; j < deckInfo[i].length; j++) {
            gameData.push(deckInfo[i][j]);
        }
    }
    // Scramble terms if needed
    if(info.randomTerms) {
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
    curr_p = info.curr_p;
    ls_p = info.ls_p;
    lls_p = info.lls_p;
    card = 0;
    seen = 1;
    newRandomDeck();
    
    // Cache
    let cache_boxes = {};
    let cache_termScores = {};
    let cache_deckIds = {};

    const update = async () => {
        let csKeys = Object.keys(cardsSeen);
        for(let i = 0; i < csKeys.length; i++) {
            let card = gameData[parseInt(csKeys[i])];
            let holder = card.deckid;
            let idx;
            if(cache_deckIds[""+holder]) {
                idx = cache_deckIds[""+holder];
            } else {
                for(let j = 0; j < user.reviews.length; j++) {
                    if(user.reviews[j].deckid == holder) {
                        idx = j;
                        cache_deckIds[""+holder] = idx;
                        break;
                    }
                }
            }
            let cardFound = false;
            for(let j = 0; j < user.reviews[idx].cards.length; j++) {
                if(user.reviews[idx].cards[j].question == card.question) {
                    cardFound = true;
                    if(!cache_boxes[card.question]) cache_boxes[card.question] = user.reviews[idx].cards[j].box;
                    if(!cache_termScores[card.question]) cache_termScores[card.question] = user.reviews[idx].cards[j].termScore;
                    console.log(cache_boxes[card.question]);
                    user.reviews[idx].cards[j].lastSeen = Date.now();
                    let thisScore = cardsSeen[csKeys[i]] - (2 * (totalWrong[csKeys[i]] || 0)); // correct - wrong
                    user.reviews[idx].cards[j].termScore = (cache_termScores[card.question] * 0.8 + thisScore * 1.1).toFixed(3);
                    if(user.reviews[idx].cards[j].termScore < -1.25) {
                        user.reviews[idx].cards[j].box = Math.max(cache_boxes[card.question] - 1, 1);
                    } else if(user.reviews[idx].cards[j].termScore > 1.25) {
                        user.reviews[idx].cards[j].box = Math.min(cache_boxes[card.question] + 1, 6);
                    }
                    break;
                    // DEPRECATED:
                    // let val = (totalWrong[csKeys[i]] / cardsSeen[csKeys[i]]) * 2 - 1;
                    // user.reviews[idx].cards[j].successCount += val;
                }
            }
            if(!cardFound) {
                let newcard = {
                    question: card.question,
                    lastSeen: Date.now(),
                    box: 1,
                    termScore: ((cardsSeen[csKeys[i]] - (2 * (totalWrong[csKeys[i]] || 0))) * 1.1).toFixed(3),
                    // DEPRECATED: successCount: (totalWrong[csKeys[i]] / cardsSeen[csKeys[i]]) * 2 - 1
                };
                newcard.box = newcard.termScore > 1.25 ? 2 : 1;
                cache_boxes[card.question] = newcard.box;
                cache_termScores[card.question] = newcard.termScore;
                user.reviews[idx].cards.push(newcard);
            }
        }
        let json = JSON.stringify(user.reviews);
        await UserGateway.editUser("reviews", json);
    };
    updateFunc = update;
    const updater = window.setInterval(() => {
        if(!active) window.clearInterval(updater);
        update();
    }, 5000);
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
function getProgress() {
    return {
        remaining: gameData.length * cardRepeat - seen
    }
}
function attemptProblem(answer) {
    let problem = gameData[randomSet[card]];
    switch(problem.type) {
        case "selection":
            return problem.answers[answer] == problem.correctAnswer ? correct() : incorrect();
        case "input":
            return answer.toLowerCase() == problem.correctAnswer.toLowerCase() ? correct() : incorrect();
        case "ranking":
            let isCorrect = true;
            for(let i = 0; i < answer.length; i++) {
                if(answer[i] !== problem.answer[i]) isCorrect = false;
            }
            return isCorrect ? correct() : incorrect();
        case "matching":
            return;
    }
}
function isDead() {
    return active == false;
}
// -- Local functions
function correct() {
    let success = iterateProblem();
    if(success == false) active = false;
    return true;
}
function incorrect() {
    if(randomSet[card] >= currentSet * deckSize) {
        currWrong.push(randomSet[card]);
    } else if(randomSet[card] >= (currentSet - 1 ) * deckSize) {
        lsWrong.push(randomSet[card]);
    } else {
        llsWrong.push(randomSet[card]);
    }
    if(totalWrong[""+randomSet[card]]) {
        totalWrong[""+randomSet[card]] += 1;
    } else {
        totalWrong[""+randomSet[card]] = 1;
    }
    correct();
    return false;
}

// -------------------------------------------------------- \\

const Game = {
    init: init,
    fetchCurrentDecks: fetchCurrentDecks,
    fetchProblem: fetchProblem,
    getProgress: getProgress,
    attemptProblem: attemptProblem,
    isDead: isDead
};
export {Game};