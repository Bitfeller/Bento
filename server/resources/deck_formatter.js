// RESOURCE: deck_formatter.js
// Takes an old version of a data value and returns a new, optimized value.

// ACCEPTS: SQL:decks.data => 0.1.0
// RETURNS: SQL:decks.data => >0.2.0

// Run via Node.js.

let toFormat = require('./deck_toformat.json');

let newContnt = {};

for(let i = 0; i < toFormat.deckData.length; i++) {
    let item = toFormat.deckData[i];
    let newItem = {};
    switch(item.type) {
        case "selection": newItem.type = "mc"; break;
        case "input": newItem.type = "txt"; break;
        default: newItem.type = item.type; break;
    }
    newItem.ans = item.correctAnswer || item.answer;
    if(item.answers) newItem.op = item.answers;
    newContnt[item.question] = newItem;
}

console.log(JSON.stringify({
    desc: toFormat.description,
    contnt: newContnt
}))