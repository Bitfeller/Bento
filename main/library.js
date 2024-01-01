import {UserGateway} from './user_gateway.js';
import {DeckGateway} from './deck_gateway.js';
var Game = (function() {

    var user;
    
    var deck = "";
    var deckSize = 5;
    var cardRepeat = 1;
    var curr_p = 0.6, ls_p = 0.3, lls_p = 0.1;
    var deckData;
    var currentSet = 0;
    
    var randomSet = [];
    var rndSetData = {};
    var currWrong = [];
    var lsWrong = [];
    var llsWrong = [];
    var wasWrong = [];
    var card = 0;

    var totalWrong = {};

    var active = true;

    function random(a, b) {
        return Math.floor(Math.random() * (b - a) + a + 0.5);
    }
    function limit(val, a, b) {
        return val < a ? a : (val > b ? b : val);
    }

    function iterateProblem() {
        card += 1;
        if(card >= randomSet.length) {
            // finished set! next set and restart process
            return newRandomDeck();
        }
        return true;
    }
    function newRandomDeck() {
        if(deckData.length - currentSet * deckSize <= 0) {
            randomSet = [];
            rndSetData = {};
            card = 0;
            active = false;
            return false;
        }
        // percentages
        var curr = curr_p;
        var ls = ls_p;
        var lls = lls_p;
        // if current set isn't equal to deckSize (make sure there are at least 3 sets; otherwise, don't override)
        var len = deckData.length - currentSet * deckSize;
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
        curr = limit(curr * (deckSize / len), 0, 1);
        curr = Math.floor(curr * Math.min(len, deckSize) + 0.5);
        ls = Math.floor(ls * deckSize + 0.5);
        lls = Math.floor(lls * deckSize + 0.5);
        // Too many
        if(curr + ls + lls > deckSize) {
            lls -= (curr + ls + lls - deckSize);
            if(lls < 0) {
                var val = -lls;
                ls -= val;
            }
        }
        // Not enough
        if(curr + ls + lls < deckSize) {
            if(len >= deckSize) {
                curr += (deckSize - curr - ls - lls);
            } else {
                ls += (deckSize - curr - ls - lls);
            }
        }
        // Get problems
        randomSet = [];
        var problems = [];
        var available = [];
        for(var i = currentSet * deckSize; i < currentSet * deckSize + Math.min(len, deckSize); i++) {
            if(rndSetData[""+i] && rndSetData[""+i] < cardRepeat) {
                available.push(i);
            } else if(!rndSetData[""+i]) {
                rndSetData[""+i] = 0;
                available.push(i);
            }
        }
        if(available.length === 0 && currWrong.length === 0 && lsWrong.length === 0 && llsWrong.length === 0) {
            // finished set - move on to next set
            currentSet += 1;
            card = 0;
            return newRandomDeck();
        }
        var k = 0;
        while(k < curr) {
            if(currWrong.length > 0) {
                var p = random(0, currWrong.length - 1);
                if(problems.indexOf(currWrong[p]) > -1) {
                    continue;
                }
                problems.push(currWrong[p]);
                rndSetData[""+currWrong[p]] += 1;
                var idx = available.indexOf(currWrong[p]);
                if(idx > -1) {
                    available.splice(idx, 1);
                }
                if(wasWrong.indexOf(currWrong[p]) < 0) {
                    wasWrong.push(currWrong[p]);
                }
                currWrong.splice(p, 1);
            } else if(available.length > 0) {
                var p = random(0, available.length - 1);
                if(problems.indexOf(available[p]) > -1) {
                    continue;
                }
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
                var p = random((currentSet - 1) * deckSize, (currentSet - 1) * deckSize + Math.min(len, deckSize));
                var idx;
                if(lsWrong.length > 0) {
                    idx = random(0, lsWrong.length - 1);
                    p = lsWrong[idx];
                } else if(wasWrong.length > 0 && wasWrong[0] < currentSet * deckSize && wasWrong[0] >= (currentSet - 1) * deckSize) {
                    idx = 0;
                    p = wasWrong[0];
                }
                if(problems.indexOf(p) > -1) {
                    continue;
                }
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
                var p = random(0, (currentSet - 2) * deckSize + Math.min(len, deckSize));
                var idx;
                if(llsWrong.length > 0) {
                    idx = random(0, llsWrong.length - 1)
                    p = llsWrong[idx];
                } else if(wasWrong.length > 0 && wasWrong[0] < (currentSet - 1) * deckSize) {
                    idx = 0;
                    p = wasWrong[0];
                }
                if(problems.indexOf(p) > -1) {
                    continue;
                }
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

    async function reload() {
        // If a deck name actually exists
        if(deck && typeof(deck) == "number") {
            // Get user
            var [success, userData] = await UserGateway.getuser();
            if(!success) {
                return false;
            }
            user = userData;
            // Get deck
            var [success, data] = await DeckGateway.get(deck);
            if(!success) {
                return false;
            }
            deckData = data.data.deckData;        
            var userReview;
            for(var i = 0; i < user.reviews.length; i++) {
                if(user.reviews[i].deckid == deck) {
                    userReview = user.reviews[i];
                }
            }
            if(!userReview) {
                userReview = {
                    deckid: deck,
                    currentSet: 0,
                    deckSize: 5,
                    cardRepeat: 2,
                    curr_p: 0.6,
                    ls_p: 0.3,
                    lls_p: 0.1
                };
                user.reviews.push(userReview);
                var json = JSON.stringify(user.reviews);
                await UserGateway.editUser("reviews", json);
            }
            currentSet = userReview.currentSet;
            deckSize = userReview.deckSize;
            cardRepeat = userReview.cardRepeat;
            curr_p = userReview.curr_p;
            ls_p = userReview.ls_p;
            lls_p = userReview.lls_p;
            card = 0;
            newRandomDeck();
            return true;
        } else {
            return false;
        }
    }
    async function setDeck(deckName) {
        deck = deckName;
        return await reload();
    }
    function getDeck() {
        return deck;
    }
    function getProblemData() {
        if(!active) {return {problem: ""};}
        return deckData[randomSet[card]];
    }
    function getProgress() {
        return {
            current: currentSet * deckSize,
            max: deckData.length
        };
    }
    function correct() {
        var success = iterateProblem();
        if(success === false) {active = false;}
        return true;
    }
    function incorrect() {
        if(randomSet[card] >= currentSet * deckSize) {
            currWrong.push(randomSet[card]);
        } else if(randomSet[card] >= (currentSet - 1) * deckSize) {
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
    function answerProblem(answer) {
        var problemData = deckData[randomSet[card]];
        switch(problemData.type) {
            case "selection":
                if(problemData.answers[answer] === problemData.correctAnswer) {
                    return correct();
                } else {
                    return incorrect();
                }
            case "input":
                if(answer.toLowerCase() === problemData.correctAnswer.toLowerCase()) {
                    return correct();
                } else {
                    return incorrect();
                }
            case "ranking":
                var isCorrect = true;
                for(var i = 0; i < answer.length; i++) {
                    if(answer[i] !== problemData.answer[i]) {
                        isCorrect = false;
                        console.log(answer[i], problemData.answer[i]);
                    }
                }
                return isCorrect ? correct() : incorrect();
            case "matching":
                return;
        }
    }
    function isActive() {
        return active;
    }
    return {
        setDeck: setDeck,
        getDeck: getDeck,
        getProgress: getProgress,
        getProblemData: getProblemData,
        answerProblem: answerProblem,
        isActive: isActive
    };
})();

export {Game};