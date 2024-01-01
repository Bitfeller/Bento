
let toFormat = require('./reviews_toformat.json');

let newVal = {};

for(let i = 0; i < toFormat.length; i++) {
    let newList = {};
    for(let j = 0; j < toFormat[i].cards.length; j++) {
        let card = toFormat[i].cards[j];
        newList[card.question] = {
            last: card.lastSeen,
            box: card.box,
            score: card.termScore
        }
    }
    newVal[toFormat[i].deckid] = newList;
}

console.log(JSON.stringify(newVal));