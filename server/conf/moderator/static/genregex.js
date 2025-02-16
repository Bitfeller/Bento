// Node.js script to generate regexes for filter words so they don't have to be re-calculated every single time.

// Gets the absolute pathname of the current script.
const spath = __dirname + '/';

const fs = require('fs');

// Read each line from config-filter.list and put it into an array.
const list = fs.readFileSync(spath + '../config-filter.list', 'utf8').split('\n');

// Define all characters to replace
const replace = {};
replace['a'] = '[aA@]';
replace['b'] = '([bB]|[IilL]3)';
replace['c'] = '(?:[cC(]|[kK])';
replace['d'] = '[dD]';
replace['e'] = '[eE3]';
replace['f'] = '(?:[fF]|[pP][hH])';
replace['g'] = '[gG6]';
replace['h'] = '[hH]';
replace['i'] = '[iIl!1]';
replace['j'] = '[jJ]';
replace['k'] = '(?:[cC(]|[kK])';
replace['l'] = '[lL1!i]';
replace['m'] = '[mM]';
replace['n'] = '[nN]';
replace['o'] = '[oO0]';
replace['p'] = '[pP]';
replace['q'] = '[qQ9]';
replace['r'] = '[rR]';
replace['s'] = '[sS$5]';
replace['t'] = '[tT7]';
replace['u'] = '[uUvV]';
replace['v'] = '[vVuU]';
replace['w'] = '([wW]|vv|VV)';
replace['x'] = '[xX]';
replace['y'] = '[yY]';
replace['z'] = '[zZ2]';


// Regex generator
function regex_gen(str) {
    let orig = str;
    str = '';
    for(let i = 0; i < orig.length; i++) {
        let char = orig[i];
        // Replace with new regex if applicable, otherwise keep as is
        if(replace[char])
            str += replace[char];
        else
            str += char;
    }
    return str;
}

// Iterate through each line and generate a new regex
let newList = [];
for(let line of list) {
    if(line.length == 0) continue;
    let regex = regex_gen(line);
    newList.push(regex);
}

// Write to new file
fs.writeFileSync(spath + '../config-filter-regex.list', newList.join('\n'), 'utf8');