import { UserGateway } from "../../server/client-gateway/user-gateway.js";
import { DeckGateway } from "../../server/client-gateway/deck-gateway.js";

const name = document.getElementById("name");
const isPublic = document.getElementById("isPublic");
const description = document.getElementById("description");
const cardContain = document.getElementById("cardcontain");
const addCard = document.getElementById("addcard");
const resetpic = document.getElementById("picReset");
const fileselecttrigger = document.getElementById("fileselecttrigger");
const picimg = document.getElementById("deckpic");
const tags = document.getElementById("tags");
const tagInput = document.getElementById("tagInput");
const tagSuggestions = document.getElementById('tag-suggestions');
const tagOk = document.getElementById('tag-ok');

let cards = [], deckpic = '';
let drag, dragParent;
let user;
const sizeLimit = 2 * 1000 * 1000; // NOTE: must be same as max_image_size in server/conf/config.json

let allowedTags = [];

const dragline = document.createElement('div');
dragline.style = 'display: flex; background-color: var(--drag-color); width: 100%; height: 5px;';

// Load DOMPurify for imports
const dpscript = document.createElement('script');
dpscript.src = 'https://cdn.jsdelivr.net/npm/dompurify@2.4.0/dist/purify.min.js';
document.head.appendChild(dpscript);


// --------------------------------------------------- \\


// Essential functions to set up div + ranking functionality + tags
function computeCenter(el) {
    let rect = el.getBoundingClientRect();
    return {
        x: (rect.left + rect.right) / 2 + scrollX,
        y: (rect.top + rect.bottom) / 2 + scrollY
    }
}
function init_card(card, n) {
    let on = m => card.getElementsByClassName(m).length > 0;
    let qf = m => card.getElementsByClassName(m)[0]; // quickfetch
    let q = card.getElementsByClassName('q')[0];
    qf('mcbtn').addEventListener("mousedown", () => {
        if(on('card-mc')) return;
        init_mc(card, n, q.innerHTML);
    });
    qf('mcbtn').addEventListener("keydown", e => {
        if(on('card-mc')) return;
        if(e.key == "Enter" || e.key == " ") init_mc(card, n, q.innerHTML);
    });
    qf('txtbtn').addEventListener("mousedown", () => {
        if(on('txt-answer')) return;
        init_txt(card, n, q.innerHTML);
    });
    qf('txtbtn').addEventListener("keydown", e => {
        if(on('txt-answer')) return;
        if(e.key == "Enter" || e.key == " ") init_txt(card, n, q.innerHTML);
    });
    qf('rankbtn').addEventListener("mousedown", () => {
        if(on('card-rank')) return;
        init_ranking(card, n, q.innerHTML);
    });
    qf('rankbtn').addEventListener("keydown", e => {
        if(on('card-rank')) return;
        if(e.key == "Enter" || e.key == " ") init_ranking(card, n, q.innerHTML);
    });
    qf('mtchbtn').addEventListener("mousedown", () => { 
        if(on('card-mtch')) return;
        init_mtch(card, n, q.innerHTML);
    });
    qf('mtchbtn').addEventListener("keydown", e => {
        if(on('card-mtch')) return;
        if(e.key == "Enter" || e.key == " ") init_mtch(card, n, q.innerHTML);
    });
    card.getElementsByClassName('card-del')[0].addEventListener("mousedown", () => {
        if(cards.length <= 1) return;
        let idx = cards.indexOf(card);
        if(idx > -1) cards.splice(idx, 1);
        card.remove();
    });
    let dragHandle = card.getElementsByClassName('card-drag-handle')[0];
    dragHandle.setAttribute('draggable', true);
    dragHandle.addEventListener('dragstart', () => {
        drag = card;
        dragParent = cardContain;
        card.style.backgroundColor = 'var(--drag-color)';
        cardContain.append(dragline);
    });
    dragHandle.addEventListener('dragend', e => endDrag(e, card, cardContain));
}
async function typeset(node) {
    if(Object.keys(MathJax.startup) == 0) 
        await new Promise((res) => {
            MathJax.startup.ready = () => res();
        });
    MathJax.startup.promise = MathJax.startup.promise.then(() => MathJax.typesetPromise([node])).catch((e) => console.warn('math formatting failed; reason:', e.message));
    return MathJax.startup.promise;
}
async function renderable(input) {
    if(Object.keys(MathJax.startup) == 0) 
        await new Promise((res) => {
            MathJax.startup.ready = () => res();
        });
    r_temp.innerHTML = input;
    try {
        MathJax.startup.promise = MathJax.startup.promise.then(() => MathJax.typesetPromise([r_temp])).catch((e) => console.warn('math formatting failed; reason:', e.message));
        await MathJax.startup.promise;
        return r_temp.innerHTML.trim() !== '';
    } catch(_) {
        return false;
    }
}
function tag_exists(tag) {
    return Array(...document.getElementsByClassName('tag-value')).map(x => x.textContent).filter(x => x == tag).length > 0;
}
function init_div(div) {
    div.setAttribute('data-cnt', div.textContent);
    // data-cnt updating
    div.addEventListener('focusout', () => {
        if(div.dataset.focus == '0') return;
        div.setAttribute('data-cnt', div.textContent);
        div.setAttribute('data-focus', '0');
        typeset(div);
    });
    div.addEventListener('focus', () => {
        div.setAttribute('data-focus', '1');
        div.textContent = div.dataset.cnt;
    });
    div.addEventListener('input', () => div.setAttribute('data-cnt', div.textContent));
    // Prevent new lines
    div.addEventListener('keydown', e => {
        if(e.key == "Enter") e.preventDefault();
        if(e.altKey && e.key == "w") {
            if(cards.length <= 1) return;
            let parent = div.closest('.card');
            if(!parent) return;
            let idx = cards.indexOf(parent);
            let next = parent.nextElementSibling || parent.parentNode.children[parent.parentNode.children.length - 2];
            if(idx > -1) cards.splice(idx, 1);
            parent.remove();
            next.getElementsByClassName('q')[0].focus();
        }
    });
    div.addEventListener('paste', e => {
        e.preventDefault();
        let data = e.clipboardData.getData('text/plain');
        let sanitized = data.replace(/\n+/g, '');
        let sel = window.getSelection();
        if(sel.rangeCount > 0) {
            let range = sel.getRangeAt(0);
            let node = document.createTextNode(sanitized);
            range.deleteContents();
            range.insertNode(node);
            range.setStartAfter(node);
            range.collapse(true);
            sel.removeAllRanges();
            sel.addRange(range);
        }
    });
    div.setVal = val => {
        div.innerHTML = val;
        div.setAttribute('data-cnt', div.textContent);
        typeset(div);
    }
}
function dragAppend(e, node, parent) {
    let top, bottom, y = e.pageY;
    const children = parent.children;
    for(let i = 0; i < children.length; i++) {
        let centroid = computeCenter(children[i]);
        if(centroid.y < y) continue;
        else if(i - 1 >= 0) {
            top = children[i - 1];
            bottom = children[i];
            parent.insertBefore(node, bottom);
            break;
        } else {
            top = children[i];
            node.remove();
            parent.prepend(node);
            break;
        }
    }
    if(!top) {
        node.remove();
        parent.appendChild(node);
    }
}
function processDrag(e, parent) {
    if(!drag) return;
    if(dragline.parentNode != parent) parent.prepend(dragline);
    dragAppend(e, dragline, parent);
}
function endDrag(e, node, parent) {
    if(drag != node) return;
    dragline.remove();
    dragAppend(e, node, parent);
    node.style.backgroundColor = '';
    drag = null;
    dragline.remove();
}
function toNew() {
    newCard();
    document.querySelector("#create").scrollIntoView({ behavior: 'smooth', block: 'center' });
    cards[cards.length - 1].getElementsByClassName('q')[0].focus();
}
// Color map
const map = [
    [20, [255, 191, 0]],    // Amber
    [100, [255, 0, 127]],   // Pink
    [60, [0, 127, 255]],    // Azure
    [0, [255, 0, 0]],       // Red
    [70, [0, 0, 255]],      // Blue
    [90, [255, 0, 255]],    // Magenta
    [40, [50, 205, 50]],    // Light Green
    [30, [0, 255, 0]],      // Green
    [10, [255, 127, 0]],    // Orange
    [80, [127, 0, 255]],    // Violet
    [50, [0, 255, 255]]     // Cyan
]
// A pure function that generates a color based on a name
function generateTagColor(n) {
    let bc = map.filter((c) => parseInt(n.charCodeAt(n.length - 1) / 10) % 10 * 10 == c[0])[0][1];
    const fh = map.filter((c) => 
        parseInt((n.substring(1)
            .substring(0, Math.floor(n.substring(1).length / 2))
            .split('')
            .reduce((a, c) => a + c.charCodeAt(0), 0) / n.substring(1)
            .substring(0, Math.floor(n.substring(1).length / 2)).length) / 10)
        % 10 * 10 == c[0])[0][1];
    const sh = map.filter((c) => 
        parseInt((n.substring(1)
            .substring(Math.floor(n.substring(1).length / 2))
            .split('')
            .reduce((a, c) => a + c.charCodeAt(0), 0) / n.substring(1)
            .substring(0, Math.floor(n.substring(1).length / 2)).length) / 10)
        % 10 * 10 == c[0])[0][1];
    return `rgb(${
        bc.map((c, i) => {
            let value = c + parseInt(fh[i] / 25) + parseInt(sh[i] / 25);
            while (value > 255) 
                Math.abs(n - 0) < Math.abs(n - 255) ? 
                    value = 255 : 
                    Math.abs(n - 255) < Math.abs(n - 0) ? value -= 255 : value = 255;
            return parseInt(value * 0.65);
        }).join(', ')
    })`;
}


// --------------------------------------------------- \\
// Builders builds the card structure
// Generators generate answers
// Cloners clone cards
// --------------------------------------------------- \\


// Cloner
function cloner(card, n) {
    let data = toDeck(err => alert(err), true, true, n - 1);
    if(Object.keys(data[2].contnt).length == 0) 
        return;
    let newCard = generateCard(data[2].contnt, Object.keys(data[2].contnt), 0, n + 1, true);
    if(n == cards.length - 1)
        cardContain.insertAdjacentElement('beforeend', newCard);
    else {
        let next = card.nextSibling;
        cardContain.insertBefore(newCard, next);
    }
}
// Generators
function generator_mc(cardmc, card, allcorr, t, txt) {
    let newop = document.createElement('div');
    newop.className = "mcop";
    newop.setAttribute('draggable', true);
    newop.innerHTML = `
        <div class="drag-handle">:</div>
        <div contenteditable="true" type='input' class='mcop-val' placeholder='...'></div>
        <button class='mcop-del' tabindex='-1'><span class='material-symbols-outlined'>close</span></button>
        <button class='mcop-corr mcop-${t ? 'sel' : 'nosel'}' tabindex="-1"><span class="material-symbols-outlined">${t ? 'check' : 'check_indeterminate_small'}</span></button>
    `;
    cardmc.appendChild(newop);
    newop.addEventListener('dragstart', () => {
        drag = newop;
        dragParent = cardmc;
        newop.style.backgroundColor = 'var(--drag-color)';
        cardmc.append(dragline);
    });
    newop.addEventListener('dragend', e => endDrag(e, newop, cardmc));
    let input = newop.getElementsByClassName('mcop-val')[0];
    let delbtn = newop.getElementsByClassName('mcop-del')[0];
    let corrbtn = newop.getElementsByClassName('mcop-corr')[0];
    init_div(input);
    if(txt) input.setVal(txt);
    input.addEventListener('keydown', e => {
        if(e.key != "Tab" || e.shiftKey) return;
        if(cards.indexOf(card) < cards.length - 1) return;
        let ans = [...cardmc.getElementsByClassName('mcop')];
        let idx = ans.indexOf(newop);
        if(idx < ans.length - 1) return;
        e.preventDefault();
        toNew();
    });
    delbtn.addEventListener('mousedown', () => {
        if(cardmc.children.length <= 2) return;
        if(cardmc.getElementsByClassName('mcop-sel').length == 1 && newop.getElementsByClassName('mcop-sel').length == 1) {
            let newcorr = cardmc.getElementsByClassName('mcop-nosel')[0];
            newcorr.className = 'mcop-corr mcop-sel';
            newcorr.innerHTML = "<span class='material-symbols-outlined'>check</span>";
        }
        newop.remove();
    });
    corrbtn.addEventListener('mousedown', () => {
        if(corrbtn.className.includes('mcop-sel')) {
            if(cardmc.getElementsByClassName('mcop-sel').length == 1) return;
            corrbtn.className = 'mcop-corr mcop-nosel';
            corrbtn.innerHTML = "<span class='material-symbols-outlined'>check_indeterminate_small</span>";
        } else {
            corrbtn.className = 'mcop-corr mcop-sel';
            corrbtn.innerHTML = "<span class='material-symbols-outlined'>check</span>";
        }
        if(cardmc.getElementsByClassName('mcop-sel').length == 1) allcorr.style.display = "none";
        else allcorr.style.display = "inline-block";
    });
}
function generator_txt(card, i_anslist, r, p, txt) {
    let newans = document.createElement('div');
    newans.className = "txt-ans-cont" + (p == i_anslist ? "-inv" : "");
    newans.setAttribute('draggable', true);
    newans.innerHTML = `
        <div class="drag-handle">:</div>
        <div contenteditable="true" type='input' class='txtans ansdiv' placeholder='...'></div>
        ${r ? `<button class='txtans-del' tabindex='-1'><span class='material-symbols-outlined'>close</span></button>` : ``}
    `;
    newans.addEventListener('dragstart', () => {
        drag = newans;
        dragParent = p;
        newans.style.backgroundColor = 'var(--drag-color)';
        p.append(dragline);
    });
    newans.addEventListener('dragend', e => endDrag(e, newans, p));
    p.appendChild(newans);
    let input = newans.getElementsByClassName('txtans')[0];
    let delbtn = newans.getElementsByClassName('txtans-del')[0];
    init_div(input);
    if(txt) input.setVal(txt);
    input.addEventListener('keydown', e => {
        if(e.key != "Tab" || e.shiftKey) return;
        if(cards.indexOf(card) < cards.length - 1) return;
        let ans = [...p.getElementsByClassName('txt-ans-cont')];
        let idx = ans.indexOf(newans);
        if(idx < ans.length - 1) return;
        e.preventDefault();
        toNew();
    });
    if(r) delbtn.addEventListener('mousedown', () => newans.remove());
}
function generator_rank(card, ranklist, txt) {
    let item = document.createElement('div');
    item.className = 'ranking-item';
    item.setAttribute('draggable', true);
    item.innerHTML = `
        <div class="drag-handle">:</div>
        <div contenteditable="true" type='input' class='rank-item-txt ansdiv' placeholder='...'></div>
        <button class='rank-del' tabindex='-1'><span class='material-symbols-outlined'>close</span></button>
    `;
    ranklist.appendChild(item);
    item.addEventListener('dragstart', () => {
        drag = item;
        dragParent = ranklist;
        item.style.backgroundColor = 'var(--drag-color)';
        ranklist.append(dragline);
    });
    item.addEventListener('dragend', e => endDrag(e, item, ranklist));
    let input = item.getElementsByClassName('rank-item-txt')[0];
    let delbtn = item.getElementsByClassName('rank-del')[0];
    init_div(input);
    if(txt) input.setVal(txt);
    input.addEventListener('keydown', e => {
        if(e.key != "Tab" || e.shiftKey) return;
        if(cards.indexOf(card) < cards.length - 1) return;
        let ans = [...ranklist.getElementsByClassName('ranking-item')];
        let idx = ans.indexOf(item);
        if(idx < ans.length - 1) return;
        e.preventDefault();
        toNew();
    });
    delbtn.addEventListener('mousedown', () => {
        if(ranklist.children.length > 2) item.remove();
    });
}
function generator_mtch(card, mtchlist, r, txt) {
    let pair = document.createElement('div');
    pair.className = 'mtch-pair';
    pair.innerHTML = `
        <div contenteditable="true" type='input' class='mtchpair-term ansdiv' placeholder='Term'></div>
        ${r ? "<button class='mtchpair-del' tabindex='-1'><span class='material-symbols-outlined'>close</span></button>" : ""}
        <div contenteditable="true" type='input' class='mtchpair-def ansdiv' placeholder='Definition'></div>
        
    `;
    mtchlist.appendChild(pair);
    let term = pair.getElementsByClassName('mtchpair-term')[0];
    let def = pair.getElementsByClassName('mtchpair-def')[0];
    let delbtn = pair.getElementsByClassName('mtchpair-del')[0];
    init_div(term);
    init_div(def);
    if(txt) {
        term.setVal(txt[0]);
        def.setVal(txt[1]);
    }
    def.addEventListener('keydown', e => {
        if(e.key != "Tab" || e.shiftKey) return;
        if(cards.indexOf(card) < cards.length - 1) return;
        let ans = [...mtchlist.getElementsByClassName('mtch-pair')];
        let idx = ans.indexOf(pair);
        if(idx < ans.length - 1) return;
        e.preventDefault();
        toNew();
    });
    if(r) delbtn.addEventListener('mousedown', () => pair.remove());
}
// Card Builders
function init_mc(card, n, q) {
    card.innerHTML = `
        <div class='cardsel'>
            <button class='mcbtn selbtn selbtn-sel'>Multiple Choice</button>
            <button class='txtbtn selbtn selbtn-nosel'>Text</button>
            <button class='rankbtn selbtn selbtn-nosel'>Ranking</button>
            <button class='mtchbtn selbtn selbtn-nosel'>Matching</button>
            <button class='card-drag-handle' tabindex="-1"><span class='material-symbols-outlined'>drag_handle</span></button>
        </div>
        <div class='cardmain'>
            <div class='card-q-cont'>
                Question: <div contenteditable="true" type='input' class='q' placeholder='Question'>${q ?? ""}</div>
            </div>
            <div class='card-vals-cont card-mc'></div>
        </div>
        <button class='mc-add' tabindex="-1"><span class='material-symbols-outlined small-ico'>add</span> Add option</button>
        <button class='card-del' tabindex="-1"><span class='material-symbols-outlined small-ico'>close</span> Delete Card</button>
        <button class='mc-allcorr inactive' tabindex="-1"><span class='material-symbols-outlined small-ico'>close</span> Require all correct answers</button>
        <button class='mc-clone' tabindex="-1"><span class='material-symbols-outlined small-ico'>file_copy</span> Clone Card</button>
        <div class='deck-divider'></div>
    `;
    init_card(card, n);
    let problem = card.getElementsByClassName('q')[0];
    init_div(problem);
    if(q) problem.setVal(q);
    // Set up multiple choice card functionality
    let cardmc = card.getElementsByClassName('card-mc')[0];
    let addbtn = card.getElementsByClassName('mc-add')[0];
    let allcorr = card.getElementsByClassName('mc-allcorr')[0];
    allcorr.style.display = "none";
    // Cloner
    card.getElementsByClassName('mc-clone')[0].addEventListener('mousedown', () => cloner(card, cards.indexOf(card) + 1));
    // Local generator
    let generator = t => generator_mc(cardmc, card, allcorr, t);
    addbtn.addEventListener('mousedown', () => generator(false));
    allcorr.addEventListener('mousedown', () => {
        if(allcorr.className.indexOf('inactive') > -1) {
            allcorr.className = "mc-allcorr active";
            allcorr.innerHTML = "<span class='material-symbols-outlined small-ico'>check</span> Require all correct answers";
        } else {
            allcorr.className = "mc-allcorr inactive";
            allcorr.innerHTML = "<span class='material-symbols-outlined small-ico'>close</span> Require all correct answers";
        }
    });
    for(let i = 0; i < 4; i++) generator(i == 0);
}
function init_txt(card, n, q) {
    card.innerHTML = `
        <div class='cardsel'>
            <button class='mcbtn selbtn selbtn-nosel'>Multiple Choice</button>
            <button class='txtbtn selbtn selbtn-sel'>Text</button>
            <button class='rankbtn selbtn selbtn-nosel'>Ranking</button>
            <button class='mtchbtn selbtn selbtn-nosel'>Matching</button>
            <button class='card-drag-handle' tabindex="-1"><span class='material-symbols-outlined'>drag_handle</span></button>
        </div>
        <div class='cardmain'>
            <div class='card-q-cont'>
                Question: <div contenteditable="true" type='input' class='q' placeholder='Question'>${q ?? ""}</div>
            </div>
            <div class='card-vals-cont card-txt'></div>
            <button class='txt-add' tabindex="-1"><span class='material-symbols-outlined small-ico'>add</span> Add alt answer</button>
            <button class='card-del' tabindex="-1"><span class='material-symbols-outlined small-ico'>close</span> Delete Card</button>
            <button class='txt-clone' tabindex="-1"><span class='material-symbols-outlined small-ico'>file_copy</span> Clone Card</button>
            <button class='txt-rinver inactive' tabindex="-1"><span class='material-symbols-outlined small-ico'>close</span> Remove inverse</button>
            <button class='txt-inver quick-action' tabindex="-1">Build inverse <span class='material-symbols-outlined small-ico'>arrow_forward_ios</span></button>
        </div>
        <div class='inverse'>
            >> Inverse <<
            <div class='cardmain'>
                Question: <div contenteditable="true" type='input' class='q' placeholder='Question'></div>
                <div class='card-vals-cont card-txt'></div>
                <button class='txt-i-add txt-add' tabindex="-1"><span class='material-symbols-outlined small-ico'>add</span> Add alt answer</button>
                <button class='txt-i-back quick-action' tabindex="-1">Exit inverse mode <span class='material-symbols-outlined small-ico'>arrow_forward_ios</span></button>
            </div>
        </div>
        <div class='deck-divider'></div>
    `;
    init_card(card, n);
    let problem = card.getElementsByClassName('q')[0];
    init_div(problem);
    if(q) problem.setVal(q);
    // Set up text card functionality
    const anslist = card.getElementsByClassName('card-txt')[0];
    const addbtn = card.getElementsByClassName('txt-add')[0];
    const confinver = card.getElementsByClassName('txt-inver')[0];
    const r_inver = card.getElementsByClassName('txt-rinver')[0];
    const i_addbtn = card.getElementsByClassName('txt-i-add')[0];
    const i_back = card.getElementsByClassName('txt-i-back')[0];
    r_inver.style.display = "none";

    const cardsel = card.getElementsByClassName('cardsel')[0];
    const cardmain = card.getElementsByClassName('cardmain')[0];
    const inverse = card.getElementsByClassName('inverse')[0];
    const i_anslist = inverse.getElementsByClassName('card-txt')[0];
    inverse.style.display = "none";

    init_div(inverse.getElementsByClassName('q')[0]);

    // Local Cloner
    card.getElementsByClassName('txt-clone')[0].addEventListener('mousedown', () => cloner(card, cards.indexOf(card) + 1));
    
    // Local Generator
    let generator = (r, p, t) => generator_txt(card, i_anslist, r, p, t);
    let inverse_ch = t => {
        cardsel.style.display = cardmain.style.display = t ? "none" : "block";
        inverse.style.display = t ? "block" : "none";
    };
    addbtn.addEventListener('mousedown', () => generator(true, anslist));
    confinver.addEventListener('mousedown', () => {
        if(r_inver.style.display == "none") {
            confinver.innerHTML = "Configure inverse <span class='material-symbols-outlined small-ico'>arrow_forward_ios</span>";
            r_inver.style.display = "inline-block";
            generator(false, i_anslist, problem.textContent);
            let i_q = inverse.getElementsByClassName('q')[0];
            i_q.setVal(anslist.getElementsByClassName('txt-ans-cont')[0].getElementsByClassName('txtans')[0].textContent);
            i_q.focus();
        }
        inverse_ch(true);
    });
    i_addbtn.addEventListener('mousedown', () => generator(true, i_anslist));
    i_back.addEventListener('mousedown', () => inverse_ch(false));
    r_inver.addEventListener('mousedown', () => {
        if(r_inver.style.display == "none") return;
        confinver.innerHTML = "Build inverse <span class='material-symbols-outlined small-ico'>arrow_forward_ios</span>";
        r_inver.style.display = "none";
        i_anslist.innerHTML = "";
    });
    generator(false, anslist);
}
function init_ranking(card, n, q) {
    card.innerHTML = `
        <div class='cardsel'>
            <button class='mcbtn selbtn selbtn-nosel'>Multiple Choice</button>
            <button class='txtbtn selbtn selbtn-nosel'>Text</button>
            <button class='rankbtn selbtn selbtn-sel'>Ranking</button>
            <button class='mtchbtn selbtn selbtn-nosel'>Matching</button>
            <button class='card-drag-handle' tabindex="-1"><span class='material-symbols-outlined'>drag_handle</span></button>
        </div>
        <div class='cardmain'>
            <div class='card-q-cont'>
                Question: <div contenteditable="true" type='input' class='q' placeholder='Question'>${q ?? ""}</div>
            </div>
            <div class='card-vals-cont card-rank ranking-list'></div>
            <button class='rank-add' tabindex="-1"><span class='material-symbols-outlined small-ico'>add</span> Add item</button>
            <button class='card-del' tabindex="-1"><span class='material-symbols-outlined small-ico'>close</span> Delete Card</button>
            <button class='rank-clone' tabindex="-1"><span class='material-symbols-outlined small-ico'>file_copy</span> Clone Card</button>
            <div class='deck-divider'></div>
        </div>
    `;
    init_card(card, n);
    let problem = card.getElementsByClassName('q')[0];
    init_div(problem);
    if(q) problem.setVal(q);
    // Set up ranking card functionality
    let ranklist = card.getElementsByClassName('ranking-list')[0];
    let addbtn = card.getElementsByClassName('rank-add')[0];
    // Cloner
    card.getElementsByClassName('rank-clone')[0].addEventListener('mousedown', () => cloner(card, cards.indexOf(card) + 1));
    // Local generator
    let generator = () => generator_rank(card, ranklist);
    addbtn.addEventListener('mousedown', generator);
    for(let i = 0; i < 2; i++) generator();
}
function init_mtch(card, n, q) {
    card.innerHTML = `
        <div class='cardsel'>
            <button class='mcbtn selbtn selbtn-nosel'>Multiple Choice</button>
            <button class='txtbtn selbtn selbtn-nosel'>Text</button>
            <button class='rankbtn selbtn selbtn-nosel'>Ranking</button>
            <button class='mtchbtn selbtn selbtn-sel'>Matching</button>
            <button class='card-drag-handle' tabindex="-1"><span class='material-symbols-outlined'>drag_handle</span></button>
        </div>
        <div class='cardmain'>
            <div class='card-q-cont'>
                Question: <div contenteditable="true" type='input' class='q' placeholder='Question'>${q ?? ""}</div>
            </div>
            <div class='card-vals-cont card-mtch'></div>
            <button class='mtch-add' tabindex='-1'><span class='material-symbols-outlined small-ico'>add</span> Add pair</button>
            <button class='card-del' tabindex='-1'><span class='material-symbols-outlined small-ico'>close</span> Delete Card</button>
            <button class='mtch-clone' tabindex='-1'><span class='material-symbols-outlined small-ico'>file_copy</span> Clone Card</button>
            <div class='deck-divider'></div>
        </div>
    `;
    init_card(card, n);
    let problem = card.getElementsByClassName('q')[0];
    init_div(problem);
    if(q) problem.setVal(q);
    // Set up match functionality
    let pairlist = card.getElementsByClassName('card-mtch')[0];
    let addbtn = card.getElementsByClassName('mtch-add')[0];
    // Cloner
    card.getElementsByClassName('mtch-clone')[0].addEventListener('mousedown', () => cloner(card, cards.indexOf(card) + 1));
    // Local generator
    let generator = (r) => generator_mtch(card, pairlist, r);
    addbtn.addEventListener('mousedown', () => generator(true));
    for(let i = 0; i < 2; i++) generator(i != 0);
}
function newCard() {
    let card = document.createElement('div');
    let n = cards.length + 1;
    card.id = "c" + n;
    card.className = "card";
    cardContain.appendChild(card);
    cards.push(card);
    if(cards.length < 2) return init_mc(card, n);
    let type = cards[cards.length - 2].getElementsByClassName('selbtn-sel')[0];
    if(!type) return init_mc(card, n);
    let cn = type.className.split(" ");
    if(cn.includes('txtbtn')) init_txt(card, n);
        else if(cn.includes('rankbtn')) init_ranking(card, n);
        else if(cn.includes('mtchbtn')) init_mtch(card, n);
        else init_mc(card, n); // mcbtn + etc.
}


// --------------------------------------------------- \\


fileselecttrigger.addEventListener('change', () => {
    let files = fileselecttrigger.files;
    if(files && files[0]) {
        let file = files[0];
        if(!file.type.startsWith('image/')) return console.warn('failed - file type; ' + file.type);
        let reader = new FileReader();
        reader.onload = e => {
            let content = e.target.result;
            if(content.byteLength > sizeLimit) return console.warn(`failed! Past size limit of ${sizeLimit / (1 * 1000 * 1000)} MB.`);
            deckpic = content;
            picimg.src = content;
        };
        reader.readAsDataURL(file);
    }
});
resetpic.addEventListener('mousedown', () => {
    deckpic = '';
    picimg.src = '../../img/defaultdeckpic.png';
});
tagInput.addEventListener('keydown', e => {
    let value = tagInput.value.trim();
    if(e.key == 'Enter' && value != '' && allowedTags.indexOf(value) > -1) {
        e.preventDefault();
        if(tag_exists(value)) return;
        tags.innerHTML += `
            <div class='tag remove-tag' onclick='this.remove()' style='background-color: ${generateTagColor(value)}'>
                <div class='material-symbols-outlined'>remove</div>
                <p class='tag-value'>${value}</p>
            </div>
        `;
        tagInput.value = '';
        tagInput.focus();
        tagOk.style.display = 'none';
    }
});
tagInput.addEventListener('input', () => {
    let value = tagInput.value.trim();
    if(value != '') {
        if(tag_exists(value)) {
            tagOk.style.display = 'block';
            tagOk.innerHTML = 'Already added';
            tagOk.style.color = 'var(--danger-red)';
        } else if(allowedTags.indexOf(value) > -1) {
            tagOk.style.display = 'block';
            tagOk.innerHTML = 'Valid';
            tagOk.style.color = 'var(--select-blue)';
        } else {
            tagOk.style.display = 'block';
            tagOk.innerHTML = 'Invalid';
            tagOk.style.color = 'var(--danger-red)';
        }
    }
    else tagOk.style.display = 'none';
});


// --------------------------------------------------- \\


function isEmpty(contnt) {
    // Checks if there is only card and checks to see if both the question and the options/answers are empty.
    if(Object.keys(contnt).length > 1) return false;
    let keys = Object.keys(contnt);
    let card = contnt[keys[0]];
    if(card.type == 'mc') {
        if(keys[0].trim() == '' && card.op.filter(op => op.trim() != '').length == 0)
            return true;
    } else if(card.type == 'txt') {
        if(keys[0].trim() == '' && card.ans.filter(ans => ans.trim() != '').length == 0)
            return true;
    } else if(card.type == 'ranking') {
        if(keys[0].trim() == '' && card.ans.filter(ans => ans.trim() != '').length == 0)
            return true;
    } else if(card.type == 'matching') {
        if(keys[0].trim() == '' && card.ans.filter(op => op.filter(x => x.trim() != '').length != 0).length == 0)
            return true;
    }
    return false;
}
function toDeck(err_assigner, is_temp = false, bypass = false, setCard) {
    if(!user) return void err_assigner("Looks like you're not logged in! We can't create this deck unless you log in again. (If you'd like, open another tab and login there.)");
    if(name.value == '' && !is_temp) return void err_assigner("You haven't named your deck yet.");
    let data = {};
    for(let i = setCard ?? 0; i < cards.length && (setCard == undefined ? true : i == setCard); i++) {
        let card = cards[i];
        let type = card.getElementsByClassName('selbtn-sel')[0];
        if(!type) return void err_assigner("The system encountered an error parsing the cards and has associated it with an unexpected change in the HTML.");
        let cn = type.className.split(" ");
        if(cn.includes('mcbtn')) {
            let cdata = {
                type: 'mc',
                op: [],
                ans: [],
                req: 0
            };
            let q = card.getElementsByClassName('q')[0];
            if(!q) return void err_assigner("The system encountered an error parsing the cards and has associated it with an unexpected change in the HTML.");
            let answers = card.getElementsByClassName('mcop');
            if(answers.length < 2) return void err_assigner("The system encountered an error parsing the cards and has associated it with an unexpected change in the HTML.");
            for(let j = 0; j < answers.length; j++) {
                let ans = answers[j].getElementsByClassName('mcop-val')[0];
                if(!ans) return void err_assigner("The system encountered an error parsing the cards and has associated it with an unexpected change in the HTML.");
                if(ans.dataset.cnt.length > 0 || is_temp) cdata.op.push(ans.dataset.cnt);
                    else continue;
                if(answers[j].getElementsByClassName('mcop-sel').length > 0) cdata.ans.push(j);
            }
            if(q.dataset.cnt.length == 0 && cdata.op.length == 0) continue;
            if(card.getElementsByClassName('active').length > 0 && cdata.ans.length > 1) cdata.req = 1;
            if(data[q.dataset.cnt] && !is_temp) return void err_assigner("We currently don't support two cards with the exact same question. (This includes inverse cards.)");
            if(cdata.op.length < 2 && !bypass) return void err_assigner("Looks like a multiple choice card has less than 2 options. (Press again to bypass and skip configuring that card).");
                else if(cdata.op.length < 2) continue;
            data[q.dataset.cnt] = cdata;
        } else if(cn.includes('txtbtn')) {
            let cdata = {
                type: 'txt',
                ans: []
            };
            let q = card.getElementsByClassName('q')[0];
            let answers = card.getElementsByClassName('txt-ans-cont');
            if(answers.length < 1 || !q) return void err_assigner("The system encountered an error parsing the cards and has associated it with an unexpected change in the HTML.");
            for(let j = 0; j < answers.length; j++) {
                let ans = answers[j].getElementsByClassName('txtans')[0];
                if(!ans) return void err_assigner("The system encountered an error parsing the cards and has associated it with an unexpected change in the HTML.");
                if(ans.dataset.cnt.length > 0 || is_temp) cdata.ans.push(ans.dataset.cnt);
            }
            if(q.dataset.cnt.length == 0 && cdata.ans.length == 0) continue;
            let i_cdata = {
                type: 'txt',
                ans: [],
                invfrom: q.dataset.cnt
            }
            let inv = card.getElementsByClassName('inverse')[0];
            let ans = inv.getElementsByClassName('txt-ans-cont-inv')
            if(inv.style.display == "block" && (!bypass || is_temp)) return void err_assigner("Looks like there's a text card still in inverse mode; we can't configure it yet. (Or, press again to bypass this warning and force-build the card.)");
            if(ans.length > 0) {
                i_cdata.ans = [];
                for(let j = 0; j < ans.length; j++) {
                    let a = ans[j].getElementsByClassName('txtans')[0];
                    if(!a) return void err_assigner("The system encountered an error parsing the cards and has associated it with an unexpected change in the HTML.");
                    if(a.dataset.cnt.length > 0 || is_temp) i_cdata.ans.push(a.dataset.cnt);
                }
                if(data[inv.getElementsByClassName('q')[0].dataset.cnt] && !is_temp) return void err_assigner("We currently don't support two cards with the exact same question. (This includes inverse cards.)");
                if(i_cdata.ans.length < 1 && !bypass) return void err_assigner("Looks like a configured inverse card has no answers. (Press again to bypass and skip configuring the inverse card).");
                else if(i_cdata.ans.length > 0) data[inv.getElementsByClassName('q')[0].dataset.cnt] = i_cdata;
            }
            if(data[q.dataset.cnt] && !is_temp) return void err_assigner("We currently don't support two cards with the exact same question. (This includes inverse cards.)");
            if(cdata.ans.length < 1 && !bypass) return void err_assigner("Looks like a text card has no answers. (Press again to bypass and skip configuring that card).");
                else if(cdata.ans.length < 1) continue;
            data[q.dataset.cnt] = cdata;
        } else if(cn.includes('rankbtn')) {
            let cdata = {
                type: 'ranking',
                ans: []
            };
            let q = card.getElementsByClassName('q')[0];
            if(!q) return void err_assigner("The system encountered an error parsing the cards and has associated it with an unexpected change in the HTML.");
            let items = card.getElementsByClassName('ranking-item');
            for(let j = 0; j < items.length; j++) {
                let txt = items[j].getElementsByClassName('rank-item-txt')[0];
                if(!txt) return void err_assigner("The system encountered an error parsing the cards and has associated it with an unexpected change in the HTML.");
                if(txt.dataset.cnt.length > 0 || is_temp) cdata.ans.push(txt.dataset.cnt);
            }
            if(q.dataset.cnt.length == 0 && cdata.ans.length == 0) continue;
            if(data[q.dataset.cnt] && !is_temp) return void err_assigner("We currently don't support two cards with the exact same question. (This includes inverse cards.)");
            if(cdata.ans.length < 2 && !bypass) return void err_assigner("Looks like a ranking card has less than 2 items. (Press again to bypass and skip configuring that card).");
                else if(cdata.ans.length < 2) continue;
            data[q.dataset.cnt] = cdata;
        } else if(cn.includes('mtchbtn')) {
            let cdata = {
                type: 'mtch',
                ans: []
            };
            let q = card.getElementsByClassName('q')[0];
            if(!q) return void err_assigner("The system encountered an error parsing the cards and has associated it with an unexpected change in the HTML.");
            let pairs = card.getElementsByClassName('mtch-pair');
            for(let j = 0; j < pairs.length; j++) {
                let term = pairs[j].getElementsByClassName('mtchpair-term')[0];
                let def = pairs[j].getElementsByClassName('mtchpair-def')[0];
                if(!term || !def) return void err_assigner("The system encountered an error parsing the cards and has associated it with an unexpected change in the HTML.");
                if(term.dataset.cnt.length > 0 && def.dataset.cnt.length > 0 || is_temp) cdata.ans.push([term.dataset.cnt, def.dataset.cnt]);
            }
            if(q.dataset.cnt.length == 0 && cdata.ans.length == 0) continue;
            if(data[q.dataset.cnt] && !is_temp) return void err_assigner("We currently don't support two cards with the exact same question. (This includes inverse cards.)");
            if(cdata.ans.length < 1 && !bypass) return void err_assigner("Looks like a matching card has 0 pairs (empty). (Press again to bypass and skip configuring that card).");
                else if(cdata.ans.length < 2) continue;
            data[q.dataset.cnt] = cdata;
        }
    }
    data = {
        desc: description.value,
        contnt: data,
        tags: Array(...document.getElementsByClassName('tag-value')).map(x => x.textContent),
    };
    if(isEmpty(data.contnt)) data.contnt = {};
    return [name.value, deckpic, data, isPublic.checked];
}
function generateCard(contnt, d_keys, i, n) {
    let card = contnt[d_keys[i]];
    let q = d_keys[i];
    let carddiv = document.createElement("div");
    carddiv.id = "c" + n;
    carddiv.className = "card";
    cards.push(carddiv);
    switch(card.type) {
        case "mc":
            init_mc(carddiv, n);
            carddiv.getElementsByClassName('q')[0].setVal(q);
            let cardmc = carddiv.getElementsByClassName('card-mc')[0];
            let allcorr = carddiv.getElementsByClassName('mc-allcorr')[0];
            cardmc.innerHTML = "";
            for(let i = 0; i < Math.max(card.op.length, 2); i++) generator_mc(cardmc, carddiv, allcorr, card.ans.indexOf(i) > -1, card.op[i] ?? "");
            if(card.ans.length > 1) {
                allcorr.style.display = "inline-block";
                if(card.req == 0) {
                    allcorr.className = "mc-allcorr inactive";
                    allcorr.innerHTML = "<span class='material-symbols-outlined small-ico'>close</span> Require all correct answers";
                } else {
                    allcorr.className = "mc-allcorr active";
                    allcorr.innerHTML = "<span class='material-symbols-outlined small-ico'>check</span> Require all correct answers";
                }
            }
        break;
        case "txt":
            init_txt(carddiv, n);
            carddiv.getElementsByClassName('q')[0].setVal(q);
            let anslist = carddiv.getElementsByClassName('card-txt')[0];
            let inv = carddiv.getElementsByClassName('inverse')[0];
            let i_anslist = inv.getElementsByClassName('card-txt-i')[0];
            if(card.ans.length == 0) return;
            anslist.getElementsByClassName('txt-ans-cont')[0].children[1].setVal(card.ans[0]);
            for(let i = 1; i < card.ans.length; i++) generator_txt(carddiv, i_anslist, true, anslist, card.ans[i]);
            if(card.inv) {
                let confinver = carddiv.getElementsByClassName('txt-inver')[0];
                let r_inver = carddiv.getElementsByClassName('txt-rinver')[0];
                let inv = carddiv.getElementsByClassName('inverse')[0];
                let i_anslist = inv.getElementsByClassName('card-txt')[0];
                confinver.innerHTML = "Configure inverse <span class='material-symbols-outlined small-ico'>arrow_forward_ios</span>";
                r_inver.style.display = "inline-block";
                let generator = (r, p, a) => generator_txt(carddiv, i_anslist, r, p, a);
                generator(false, i_anslist, card.inv.ans[0]);
                for(let i = 1; i < Math.max(card.inv.ans.length, 2); i++) generator(true, i_anslist, card.inv.ans[i] ?? "");
                inv.getElementsByClassName('q')[0].setVal(card.inv.q);
            }
        break;
        case "ranking":
            init_ranking(carddiv, n);
            carddiv.getElementsByClassName('q')[0].setVal(q);
            let rankinglist = carddiv.getElementsByClassName("ranking-list")[0];
            rankinglist.innerHTML = '';
            for(let i = 0; i < Math.max(card.ans.length, 2); i++) generator_rank(carddiv, rankinglist, card.ans[i] ?? "");
        break;
        case "mtch":
            init_mtch(carddiv, n);
            carddiv.getElementsByClassName('q')[0].setVal(q);
            let mtchlist = carddiv.getElementsByClassName("card-mtch")[0];
            mtchlist.innerHTML = '';
            for(let i = 0; i < Math.max(card.ans.length, 1); i++) generator_mtch(carddiv, mtchlist, i != 0, card.ans[i] ?? ["", ""]);
        break;
    }
    return carddiv;
}
function appendToCards(contnt) {
    // Check if we only have one card first, and remove if so (cause it's annoying)
    if(cards.length == 1 && Object.keys(toDeck(() => {}, true, true)[2].contnt).length == 0) cards.splice(0, 1)[0].remove();
    let d_keys = Object.keys(contnt);
    for(let i = 0; i < d_keys.length; i++)
        if(contnt[d_keys[i]].invfrom) {
            contnt[contnt[d_keys[i]].invfrom].inv = contnt[d_keys[i]];
            contnt[contnt[d_keys[i]].invfrom].inv.q = d_keys[i];
            delete contnt[d_keys[i]];
            d_keys.splice(i, 1);
        }
    for(let i = 0; i < d_keys.length; i++) {
        let carddiv = generateCard(contnt, d_keys, i, cards.length + 1);
        cardContain.appendChild(carddiv);
    }
}
function appendTags(tagsToAppend = []) {
    tagsToAppend.map(tag => {
        tags.innerHTML += `
            <div class='tag remove-tag' onclick='this.remove()' style='background-color: ${generateTagColor(tag)}'>
                <div class='material-symbols-outlined'>remove</div>
                <p class='tag-value'>${tag}</p>
            </div>
        `;
    });
}


// --------------------------------------------------- \\


const b_modal = document.getElementById("bento-import-modal");
const q_modal = document.getElementById("quizlet-import-modal");
const g_modal = document.getElementById("gimkit-import-modal");

const b_importbtn = document.getElementById("bento-import-btn");
const b_replacename = document.getElementById("BI-replace-name");
const b_replacedesc = document.getElementById("BI-replace-desc");
const b_file = document.getElementById("BI-file");
const b_createbtn = document.getElementById("BI-createBtn");

const q_importbtn = document.getElementById("quizlet-import-btn");
const q_txt = document.getElementById("QI-importText");
const q_createbtn = document.getElementById("QI-createBtn");
const q_reverse = document.getElementById("QI-reverse");

const g_importbtn = document.getElementById("gimkit-import-btn");
const g_txt = document.getElementById("GK-importText");
const g_createbtn = document.getElementById("GK-createBtn");

const import_modal = document.getElementById('importing-modal');
const i_import = document.getElementById('i-import');
const i_cancel = document.getElementById('i-cancel');
const import_q = document.getElementById('importing-questions');
const qSelectAll = document.getElementById('qSelectAll');

let temp_name, temp_desc, temp_tags, temp_contnt;

b_importbtn.addEventListener("mousedown", () => b_modal.style.display = "block");
q_importbtn.addEventListener("mousedown", () => q_modal.style.display = "block");
g_importbtn.addEventListener("mousedown", () => g_modal.style.display = "block");

function open_import_modal(contnt) {
    import_modal.style.display = "block";
    i_import.disabled = false;
    i_cancel.disabled = false;
    import_q.innerHTML = "";
    let c_keys = Object.keys(contnt);
    // Local function iterator:
    function checked() {
        let allChecked = true;
        let oneChecked = false;
        let boxes = import_q.getElementsByClassName('import-question-checkbox');
        for(let i = 0; i < boxes.length; i++) {
            if(boxes[i].checked) oneChecked = true;
            if(!boxes[i].checked) allChecked = false;
        }
        return [allChecked, oneChecked];
    }
    function updateQSelectAll() {
        let state = checked();
        if(state[0]) qSelectAll.innerHTML = "check_box";
        else if(state[1]) qSelectAll.innerHTML = "indeterminate_check_box";
        else qSelectAll.innerHTML = "check_box_outline_blank";
    }
    try {
        for(let i = 0; i < c_keys.length; i++) {
            let q = c_keys[i];
            let card = contnt[q];
            let carddiv = document.createElement("div");
            carddiv.className = "import-card";
            carddiv.innerHTML = `
                <div class="question-box">
                    <input type="checkbox" class="import-question-checkbox" checked>
                    <p><b class="mathJax">Q | ${q}</b></p>
                        ${
                            card.type === "mc"
                                ? `<p>O | ${card.op
                                    .map(x => `<span class="mathJax">${x}</span>`).join(", ")}</p>`
                                : ""
                        }
                    <p class="mathJax">A | 
                        ${(
                            card.type === "mc"
                                ? card.ans.map(x => card.op[x])
                                : card.ans
                        ).join(", ")}
                    </p>
                </div>
            `;
            let checkbox = carddiv.getElementsByClassName("import-question-checkbox")[0];
            checkbox.dataset.q = q;
            carddiv.addEventListener("mousedown", e => {
                if (e.target != checkbox) checkbox.checked = !checkbox.checked;
                updateQSelectAll();
            });
            checkbox.addEventListener('change', updateQSelectAll);
            Array(carddiv.getElementsByClassName("mathJax")).map(typeset);
            import_q.appendChild(carddiv);
        }
        // Configure qSelectAll
        qSelectAll.innerHTML = "check_box";
        qSelectAll.addEventListener('mousedown', () => {
            let state = checked();
            let boxes = import_q.getElementsByClassName('import-question-checkbox');
            for(let i = 0; i < boxes.length; i++)
                if(state[0]) boxes[i].checked = false;
                else boxes[i].checked = true;
            updateQSelectAll();
        });
        temp_contnt = contnt;
    } catch(_) {
        import_q.innerHTML = "We couldn't parse this import.";
    }
}
function continue_import_modal() {
    let boxes = document.getElementsByClassName('import-question-checkbox');
    if(boxes.length == 0) return close_import_modal();
    let data = {};
    for(let i = 0; i < boxes.length; i++)
        if(boxes[i].checked) data[boxes[i].dataset.q] = temp_contnt[boxes[i].dataset.q];
    if(temp_name) name.value = temp_name;
    if(temp_desc) description.value = temp_desc;
    if(temp_tags) appendTags(temp_tags);
    try {
        appendToCards(data);
    } catch(e) {
        console.log("failed; reason:", e);
        import_q.innerHTML = "Something happened while trying to parse this deck.";
    }
    safety_check();
    close_import_modal();
}
function close_import_modal() {
    import_modal.style.display = "none";
    i_import.disabled = true;
    i_cancel.disabled = true;
    import_q.innerHTML = "";
    temp_name = undefined, temp_desc = undefined, temp_tags = undefined, temp_contnt = undefined;
}
i_import.addEventListener("mousedown", () => continue_import_modal(temp_contnt));
i_cancel.addEventListener("mousedown", close_import_modal);

function safety_check() {
    if(cards.length == 0) {
        newCard();
        cards[cards.length - 1].getElementsByClassName('q')[0].focus();
    }
}
b_file.addEventListener('change', () => {
    if(b_file.files.length > 0)
        b_createbtn.disabled = false;
    else
        b_createbtn.disabled = true;
})
b_createbtn.addEventListener("mousedown", () => {
    if(!DOMPurify) return window.SHOW_ERROR("The system is loading a module. Please try again later. (code: fetching_dompurify?)");
    let dp = DOMPurify;
    let files = b_file.files;
    if(files && files[0]) {
        let file = files[0];
        if(file.type !== "application/json") {
            console.log('failed - file type; ' + file.type);
            return window.SHOW_ERROR("Bento expects a JSON file - the file type we export and support.");
        }
        let reader = new FileReader();
        reader.onload = e => {
            let content = e.target.result;
            try {
                let main = JSON.parse(content);
                if(main.name == undefined || main.desc == undefined || main.contnt == undefined) return window.SHOW_ERROR("This file seems to be corrupted, formatted incorrectly, or isn't a valid Bento deck.");
                let val_name = window.lib.dpwrapper(dp, main.name);
                let val_desc = window.lib.dpwrapper(dp, main.desc);
                let val_contnt = window.lib.dpwrapper(dp, main.contnt);
                temp_tags = window.lib.dpwrapper(dp, main.tags);
                if(b_replacename.checked) temp_name = val_name;
                if(b_replacedesc.checked) temp_desc = val_desc;
                open_import_modal(val_contnt);
                b_modal.style.display = "none";
            } catch(e) {
                safety_check();
                console.log("failed; reason:", e);
                return window.SHOW_ERROR("This file seems to be corrupted, formatted incorrectly, or isn't a valid Bento deck.");
            }
            safety_check();
        }
        reader.readAsText(file);
    }
});
q_createbtn.addEventListener("mousedown", () => {
    if(!DOMPurify) return window.SHOW_ERROR("The system is loading a module. Please try again later. (code: fetching_dompurify?)");
    let dp = DOMPurify;
    let importText = q_txt.value;
    let format = importText.split("^");
    let contnt = {};
    if(format.length == 1) return window.SHOW_ERROR("This export doesn't seem to be formatted properly, or isn't a valid Quizlet export.");
    format.pop();
    let isValid = true;
    format.forEach(card => {
        if(!isValid) return;
        const [q, ans] = card.split(">");
        if(ans == undefined) {
            window.SHOW_ERROR("This export doesn't seem to be formatted properly, or isn't a valid Quizlet export.");
            isValid = false;
            return;
        }
        if(q_reverse.checked) contnt[window.lib.dpwrapper(dp, ans)] = {type: "txt", ans: [window.lib.dpwrapper(dp, q)]};
            else contnt[window.lib.dpwrapper(dp, q)] = {type: "txt", ans: [window.lib.dpwrapper(dp, ans)]};
    });
    if(!isValid) return;
    try {
        open_import_modal(contnt);
    } catch(_) {
        safety_check();
        return window.SHOW_ERROR("This export doesn't seem to be formatted properly, or isn't a valid Quizlet export.");
    }
    safety_check();
    q_modal.style.display = "none";
});
g_createbtn.addEventListener("mousedown", () => {
    if(!DOMPurify) return window.SHOW_ERROR("The system is loading a module. Please try again later. (code: fetching_dompurify?)");
    let dp = DOMPurify;
    let importText = g_txt.value;
    let format = importText.split("\n");
    let contnt = {};
    let isValid = true;
    format.forEach(card => {
        if(!isValid) return;
        const [q, ans] = card.split("\t");
        if(ans == undefined) {
            window.SHOW_ERROR("This export doesn't seem to be formatted properly, or isn't a valid Gimkit export.");
            isValid = false;
            return;
        }
        contnt[window.lib.dpwrapper(dp, q)] = {
            type: "txt",
            ans: [window.lib.dpwrapper(dp, ans)]
        };
    });
    if(!isValid) return;
    try {
        open_import_modal(contnt);
    } catch(_) {
        safety_check();
        return window.SHOW_ERROR("This export doesn't seem to be formatted properly, or isn't a valid Gimkit export.");
    }
    safety_check();
    g_modal.style.display = "none";
});


// --------------------------------------------------- \\


window.addEventListener('dragover', e => processDrag(e, dragParent));
window.addEventListener("keydown", e => {
    if(e.target === addCard && (e.key === "Enter" || e.key === " ")) {
        newCard();
        document.querySelector("#create").scrollIntoView({ behavior: 'smooth', block: 'center' });
        const mcbtns = document.querySelectorAll(".mcbtn");
        mcbtns[mcbtns.length - 1].focus();
    }
});
window.addEventListener("mousedown", e => {
    if(e.target == b_modal || e.target == q_modal || e.target == g_modal) {
        b_modal.style.display = "none";
        q_modal.style.display = "none";
        g_modal.style.display = "none";
    }
});


// --------------------------------------------------- \\


async function init() {
    let [success, data] = await UserGateway.getuser(false, true, false, true);
    if(!success) return;
    user = data;
    allowedTags = await DeckGateway.getAllowedTags();
    allowedTags.map(x => tagSuggestions.innerHTML += `<option value='${x}'>`);
    newCard();
    cards[0].getElementsByClassName('q')[0].focus();
    addCard.addEventListener('mousedown', newCard);
}
function active() {
    return user != null;
}

const DeckBind = {
    init,
    active,
    user: () => user,
    cards: () => cards,
    deckpic: () => deckpic,
    allowedTags: () => allowedTags,
    computeCenter,
    init_card,
    typeset,
    renderable,
    init_div,
    toNew,
    init_mc,
    init_txt,
    init_ranking,
    newCard,
    toDeck,
    appendToCards,
    appendTags
};

export { DeckBind };