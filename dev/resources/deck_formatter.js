// RESOURCE: deck_formatter.js
// Takes an old version of a data value and returns a new, optimized value.

// ACCEPTS: SQL:decks.data => 0.2.0
// RETURNS: SQL:decks.data => >0.3.0

// Run via Node.js.

let toFormat = require('./deck_toformat.json');

let newContnt = {};

let keys = Object.keys(toFormat.contnt);
for(let i = 0; i < keys.length; i++) {
    let item = toFormat.contnt[keys[i]];
    let newItem = {};
    switch(item.type) {
        case "mc": newItem.ans = [item.op.indexOf(item.ans)]; break;
        case "txt": newItem.ans = [item.ans]; break;
        default: newItem.ans = item.ans; break;
    }
    newItem.type = item.type;
    if(item.op) newItem.op = item.op;
    newContnt[keys[i]] = newItem;
}

console.log(JSON.stringify({
    desc: toFormat.desc,
    contnt: newContnt
}));