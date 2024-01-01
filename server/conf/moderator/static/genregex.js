// Node.js script to generate regexes for filter words so they don't have to be re-calculated every single time.

const fs = require('fs');

// Read each line from config-filter.list and put it into an array.
const list = fs.readFileSync('../config-filter.list', 'utf8').split('\n');

// Define all characters to replace
const replace = {};
replace['a'] = '[a A @]';
replace['b'] = '[b B I3 l3 i3]';
replace['c'] = '(?:[c C (]|[k K])';
replace['d'] = '[d D]';
replace['e'] = '[e E 3]';
replace['f'] = '(?:[f F]|[ph pH Ph PH])';
replace['g'] = '[g G 6]';
replace['h'] = '[h H]';
replace['i'] = '[i I l ! 1]';
replace['j'] = '[j J]';
replace['k'] = '(?:[c C (]|[k K])';
replace['l'] = '[l L 1 ! i]';
replace['m'] = '[m M]';
replace['n'] = '[n N]';
replace['o'] = '[o O 0]';
replace['p'] = '[p P]';
replace['q'] = '[q Q 9]';
replace['r'] = '[r R]';
replace['s'] = '[s S $ 5]';
replace['t'] = '[t T 7]';
replace['u'] = '[u U v V]';
replace['v'] = '[v V u U]';
replace['w'] = '[w W vv VV]';
replace['x'] = '[x X]';
replace['y'] = '[y Y]';
replace['z'] = '[z Z 2]';


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
fs.writeFileSync('../config-filter-regex.list', newList.join('\n'), 'utf8');