import { UserGateway } from "../../server/client-gateway/user-gateway.js";
import { DeckGateway } from "../../server/client-gateway/deck-gateway.js";
import { gca, gc, gid, newEl } from "./client-modules/fn.js";
// Other objects
const name = gid('name');
const isPublic = gid('isPublic');
const description = gid('description');
const cardContain = gid('cardcontain');
const addCard = gid('addcard');
const createBtn = gid('create');
const errmsg = gid('edit-err');
const editpic = gid('picAddBtn');
const resetpic = gid('picReset');
const fileselecttrigger = gid('fileselecttrigger');
const picimg = gid('deckpic');
let deckpic = "";
let cards = [];
let dragging;
const dragLine = newEl('div');
dragLine.style = 'display: flex; background-color: rgb(0, 150, 255); width: 100%; height: 5px;';
// Deck
let deck, contnt;

function computeCenter(el) {
    let rect = el.getBoundingClientRect();
    return {
        x: (rect.left + rect.right) / 2 + scrollX,
        y: (rect.top + rect.bottom) / 2 + scrollY
    }
}
function set_selector(newDiv, n) {
    gc(newDiv, 'mcbtn').addEventListener("mousedown", function() {
        if(gca(newDiv, 'card-mc').length > 0) return;
        initMc(newDiv, n, gc(newDiv, 'question').innerHTML);
    });
    gc(newDiv, 'mcbtn').addEventListener("keydown", function(e) {
        if(gca(newDiv, 'card-mc').length > 0) return;
        if(e.key == "Enter" || e.key == " ") initMc(newDiv, n, gc(newDiv, 'question').innerHTML);
    });
    gc(newDiv, 'txtbtn').addEventListener("mousedown", function() {
        if(gca(newDiv, 'txt-answer').length > 0) return;
        initTxt(newDiv, n, gc(newDiv, 'question').innerHTML);
    });
    gc(newDiv, 'txtbtn').addEventListener("keydown", function(e) {
        if(gca(newDiv, 'txt-answer').length > 0) return;
        if(e.key == "Enter" || e.key == " ") initTxt(newDiv, n, gc(newDiv, 'question').innerHTML);
    });
    gc(newDiv, 'rankbtn').addEventListener("mousedown", function() {
        if(gca(newDiv, 'card-rank').length > 0) return;
        initRanking(newDiv, n, gc(newDiv, 'question').innerHTML);
    });
    gc(newDiv, 'rankbtn').addEventListener("keydown", function(e) {
        if(gca(newDiv, 'card-rank').length > 0) return;
        if(e.key == "Enter" || e.key == " ") initRanking(newDiv, n, gc(newDiv, 'question').innerHTML);
    });
    gc(newDiv, 'card-del').addEventListener("mousedown", function() {
        if(cards.length <= 1) return;
        let idx = cards.indexOf(newDiv);
        if(idx > -1) {
            cards.splice(idx, 1);
        }
        newDiv.remove();
    });
}
function typeset(node) {
    MathJax.startup.promise = MathJax.startup.promise.then(() => MathJax.typesetPromise([node])).catch((err) => console.warn('math formatting failed; reason:', err.message));
    return MathJax.startup.promise;
}
function init_div(div) {
    div.setAttribute('data-html', div.innerHTML);
    div.addEventListener('focusout', (e) => {
        div.setAttribute('data-html', div.innerHTML);
        div.innerHTML = div.innerHTML.replaceAll(/\$\$[^$]*\$\$/g, "<b style='color: rgb(255, 100, 100);'>[paragraph equation rendering is disabled]<b>");
        typeset(div);
    });
    div.addEventListener('focus', (e) => {
        div.innerHTML = div.dataset.html;
    });
    div.addEventListener('keydown', (e) => {
        if(e.key == 'Enter') return e.preventDefault();
        div.setAttribute('data-html', div.innerHTML);
    });
    div.addEventListener('paste', (e) => {
        e.preventDefault();
        let data = (e.clipboardData || window.clipboardData).getData('text');
        let sanitized = data.replace(/\s+/g, "");
        let sel = window.getSelection();
        if (sel.rangeCount > 0) {
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
}
function initMc(newDiv, n, q) {
    newDiv.innerHTML = `
        <div class='card-sel'>
            <button class='mcbtn selbtn selbtn-select'>Multiple Choice</button>
            <button class='txtbtn selbtn selbtn-noselect'>Text</button>
            <button class='rankbtn selbtn selbtn-noselect'>Ranking</button>
        </div>
        <div class='card-main'>
            <div class="card-question-container">
                Question: <div contenteditable="true" type='input' class='question' placeholder='The question...'>${q ?? ""}</div>
            </div>
            <div class='card-mc'>
                <div class='mc-option'>
                    <div contenteditable="true" type='input' class='mc-option-input' placeholder='...'></div>
                    <button class='mc-option-del' tabindex="-1"><span class='material-symbols-outlined'>close</span></button>
                    <button class='mc-option-correct mc-option-sel' tabindex="-1"><span class='material-symbols-outlined'>check</span></button>
                </div>
                <div class='mc-option'>
                    <div contenteditable="true" type='input' class='mc-option-input' placeholder='...'></div>
                    <button class='mc-option-del' tabindex="-1"><span class='material-symbols-outlined'>close</span></button>
                    <button class='mc-option-correct mc-option-nosel' tabindex="-1"><span class="material-symbols-outlined">check_indeterminate_small</span></button>
                </div>
                <div class='mc-option'>
                    <div contenteditable="true" type='input' class='mc-option-input' placeholder='...'></div>
                    <button class='mc-option-del' tabindex="-1"><span class='material-symbols-outlined'>close</span></button>
                    <button class='mc-option-correct mc-option-nosel' tabindex="-1"><span class="material-symbols-outlined">check_indeterminate_small</span></button>
                </div>
                <div class='mc-option'>
                    <div contenteditable="true" type='input' class='mc-option-input' placeholder='...'></div>
                    <button class='mc-option-del' tabindex="-1"><span class='material-symbols-outlined'>close</span></button>
                    <button class='mc-option-correct mc-option-nosel' tabindex="-1"><span class="material-symbols-outlined">check_indeterminate_small</span></button>
                </div>
            </div>
            <button class='mc-add' tabindex="-1">+</button>
            <button class='card-del' tabindex="-1">Delete Card</button>
            <div class='deck-divider'></div>
        </div>
    `;
    // Set up selector
    set_selector(newDiv, n);
    let problem = gc(newDiv, 'question');
    init_div(problem); // question
    if(q) {
        problem.setAttribute('data-html', q);
        typeset(problem);
    }
    // Set up multiple choice card functionality
    let cardmc = gc(newDiv, 'card-mc');
    let addBtn = gc(newDiv, 'mc-add');
    addBtn.addEventListener("mousedown", function() {
        let newOp = newEl('div');
        newOp.className = "mc-option";
        newOp.innerHTML = `
            <div contenteditable="true" type='input' class='mc-option-input' placeholder='...'></div>
            <button class='mc-option-del' tabindex='-1'><span class='material-symbols-outlined'>close</span></button>
            <button class='mc-option-correct mc-option-nosel' tabindex='-1'><span class="material-symbols-outlined">check_indeterminate_small</span></button>
        `;
        cardmc.appendChild(newOp);
        let input = gc(newOp, 'mc-option-input');
        let delBtn = gc(newOp, 'mc-option-del');
        let correctBtn = gc(newOp, 'mc-option-correct');
        init_div(input);
        input.addEventListener('keydown', (e) => {
            if(e.key !== "Tab" || e.shiftKey) return;
            if(cards.indexOf(newDiv) < cards.length - 1) return;
            let ans = Array(gca(...cardmc, 'mc-option'));
            let idx = ans.indexOf(newOp);
            if(idx < ans.length - 1) return;
            e.preventDefault();
            newCard();
            gc(cards[cards.length - 1], 'question').focus();
        })
        delBtn.addEventListener("mousedown", function() {
            if(gca(cardmc, 'mc-option').length <= 2) return;
            if(gca(newOp, 'mc-option-sel').length == 1) {
                // get random option to assign to
                let newCorrect = gc(cardmc, 'mc-option-nosel');
                newCorrect.className = "mc-option-correct mc-option-sel";
                newCorrect.innerHTML = "<span class='material-symbols-outlined'>check</span>";
            }
            newOp.remove();
        });
        correctBtn.addEventListener("mousedown", function() {
            if(correctBtn.className.includes('mc-option-sel')) {
                if(gca(cardmc, 'mc-option-sel').length == 1) return;
                correctBtn.className = "mc-option-correct mc-option-nosel";
                correctBtn.innerHTML = `<span class="material-symbols-outlined">check_indeterminate_small</span>`;
            } else {
                correctBtn.className = "mc-option-correct mc-option-sel";
                correctBtn.innerHTML = "<span class='material-symbols-outlined'>check</span>";
            }
        });
    });
    let ops = gca(cardmc, 'mc-option');
    for(let i = 0; i < ops.length; i++) {
        let div = ops[i];
        let input = gc(div, 'mc-option-input');
        let delBtn = gc(div, 'mc-option-del');
        let correctBtn = gc(div, 'mc-option-correct');
        init_div(input);
        input.addEventListener('keydown', (e) => {
            if(e.key !== "Tab" || e.shiftKey) return;
            if(cards.indexOf(newDiv) < cards.length - 1) return;
            let ans = Array(gca(...cardmc, 'mc-option'));
            let idx = ans.indexOf(div);
            if(idx < ans.length - 1) return;
            e.preventDefault();
            newCard();
            gc(cards[cards.length - 1], 'question').focus();
        });
        delBtn.addEventListener("mousedown", function() {
            if(gca(cardmc, 'mc-option').length <= 2) return;
            if(gca(div, 'mc-option-sel').length == 1) {
                // get random option to assign to
                let newCorrect = gc(cardmc, 'mc-option-nosel');
                newCorrect.className = "mc-option-correct mc-option-sel";
                newCorrect.innerHTML = "<span class='material-symbols-outlined'>check</span>";
            }
            div.remove();
        });
        correctBtn.addEventListener("mousedown", function() {
            if(correctBtn.className.includes('mc-option-sel')) {
                if(gca(cardmc, 'mc-option-sel').length == 1) return;
                correctBtn.className = "mc-option-correct mc-option-nosel";
                correctBtn.innerHTML = `<span class="material-symbols-outlined">check_indeterminate_small</span>`;
            } else {
                correctBtn.className = "mc-option-correct mc-option-sel";
                correctBtn.innerHTML = "<span class='material-symbols-outlined'>check</span>";
            }
        });
    }
}
function initTxt(newDiv, n, q) {
    newDiv.innerHTML = `
        <div class='card-sel'>
            <button class='mcbtn selbtn selbtn-noselect'>Multiple Choice</button>
            <button class='txtbtn selbtn selbtn-select'>Text</button>
            <button class='rankbtn selbtn selbtn-noselect'>Ranking</button>
        </div>
        <div class='card-main'>
            <div class="card-question-container">
                Question: <div contenteditable="true" type='input' class='question' placeholder='The question...'>${q ?? ""}</div>
            </div>
            All answers:
            <div class='card-txt'>
                <div class='txt-ans-cont'>
                    <div contenteditable="true" type='input' class='txt-answer' placeholder='...'></div>
                </div>
            </div>
            <button class='txt-add' tabindex='-1'>+</button>
            <button class='card-del' tabindex='-1'>Delete Card</button>
        </div>
        <div class='deck-divider'></div>
    `;
    // Set up selector
    set_selector(newDiv, n);
    let problem = gc(newDiv, 'question');
    init_div(problem); // question
    if(q) {
        problem.setAttribute('data-html', q);
        typeset(problem);
    }
    // Configure text card
    let ansList = gc(newDiv, 'card-txt');
    let addBtn = gc(newDiv, 'txt-add');
    addBtn.addEventListener('mousedown', () => {
        let newAns = newEl('div');
        newAns.className = 'txt-ans-cont';
        newAns.innerHTML = `
            <div contenteditable="true" type='input' class='txt-answer' placeholder='...'></div>
            <button class='txt-op-del' tabindex="-1"><span class='material-symbols-outlined'>close</span></button>
        `;
        ansList.appendChild(newAns);
        let input = gc(newAns, 'txt-answer');
        let delBtn = gc(newAns, 'txt-op-del');
        init_div(input);
        input.addEventListener('keydown', (e) => {
            if(e.key !== "Tab" || e.shiftKey) return;
            if(cards.indexOf(newDiv) < cards.length - 1) return;
            let ans = Array(gca(...ansList, 'txt-ans-cont'));
            let idx = ans.indexOf(newAns);
            if(idx < ans.length - 1) return;
            e.preventDefault();
            newCard();
            gc(cards[cards.length - 1], 'question').focus();
        });
        delBtn.addEventListener('mousedown', () => newAns.remove());
    });
    let currAns = gc(ansList, 'txt-ans-cont');
    let txtAns = gc(currAns, 'txt-answer');
    init_div(txtAns);
    txtAns.addEventListener('keydown', (e) => {
        if(e.key !== "Tab" || e.shiftKey) return;
        if(cards.indexOf(newDiv) < cards.length - 1) return;
        let ans = Array(gca(...ansList, 'txt-ans-cont'));
        let idx = ans.indexOf(currAns);
        if(idx < ans.length - 1) return;
        e.preventDefault();
        newCard();
        gc(cards[cards.length - 1], 'question').focus();
    });
}
function initRanking(newDiv, n, q) {
    newDiv.innerHTML = `
        <div class='card-sel'>
            <button class='mcbtn selbtn selbtn-noselect'>Multiple Choice</button>
            <button class='txtbtn selbtn selbtn-noselect'>Text</button>
            <button class='rankbtn selbtn selbtn-select'>Ranking</button>
        </div>
        <div class='card-main'>
            <div class="card-question-container">
                Question: <div contenteditable="true" type='input' class='question' placeholder='The question...'>${q ?? ""}</div>
            </div>
            <div class='card-rank ranking-list'>
                <div draggable='true' class='ranking-item'>
                    <div contenteditable="true" type='text' class='ranking-item-txt' placeholder='...'></div>
                    <button class='ranking-item-del' tabindex='-1'><span class='material-symbols-outlined'>close</span></button>
                </div>
                <div draggable='true' class='ranking-item'>
                    <div contenteditable="true" type='text' class='ranking-item-txt' placeholder='...'></div>
                    <button class='ranking-item-del' tabindex='-1'><span class='material-symbols-outlined'>close</span></button>
                </div>
            </div>
            <button class='rank-add' tabindex='-1'>+</button>
            <button class='card-del' tabindex='-1'>Delete Card</button>
            <div class='deck-divider'></div>
        </div>
    `;
    // Set up selector
    set_selector(newDiv, n);
    let problem = gc(newDiv, 'question');
    init_div(problem); // question
    if(q) {
        problem.setAttribute('data-html', q);
        typeset(problem);
    }
    // Set up ranking card functionality
    let rankingList = gc(newDiv, 'ranking-list');
    let addBtn = gc(newDiv, 'rank-add');
    addBtn.addEventListener("mousedown", function() {
        let item = newEl('div');
        item.className = 'ranking-item';
        item.setAttribute("draggable", true);
        item.innerHTML = `
            <div contenteditable="true" type='text' class='ranking-item-txt' placeholder='...'></div>
            <button class='ranking-item-del' tabindex='-1'><span class='material-symbols-outlined'>close</span></button>
        `;
        rankingList.appendChild(item);
        item.addEventListener("dragstart", function() {
            dragging = this;
            this.style['background-color'] = "rgb(150, 200, 255)";
            rankingList.prepend(dragLine);
        });
        item.addEventListener("dragend", function(e) {
            if(dragging !== this) {return;}
            this.style['background-color'] = "";
            dragLine.remove();
            let top;
            let bottom;
            let y = e.pageY;
            const objects = gca(rankingList, 'ranking-item');
            for(let i = 0; i < objects.length; i++) {
                let centroid = computeCenter(objects[i]);
                if(centroid.y < y) {
                    continue;
                } else if((i - 1) >= 0) {
                    top = objects[i-1];
                    bottom = objects[i];
                    rankingList.insertBefore(this, bottom);
                    break;
                } else {
                    top = objects[i];
                    this.remove();
                    rankingList.prepend(this);
                    break;
                }
            }
            if(!top) {
                this.remove();
                rankingList.appendChild(this);
            }
            dragging = undefined;
        });
        let input = gc(item, 'ranking-item-txt');
        let del = gc(item, 'ranking-item-del');
        init_div(input);
        input.addEventListener('keydown', (e) => {
            if(e.key !== "Tab" || e.shiftKey) return;
            if(cards.indexOf(newDiv) < cards.length - 1) return;
            let ans = Array(gca(...rankingList, 'ranking-item'));
            let idx = ans.indexOf(item);
            if(idx < ans.length - 1) return;
            e.preventDefault();
            newCard();
            gc(cards[cards.length - 1], 'question').focus();
        });
        del.addEventListener("mousedown", function() {
            if(gca(rankingList, 'ranking-item').length <= 2) {
                return;
            }
            item.remove();
        });
    });
    let currentObjs = gca(rankingList, 'ranking-item');
    for(let i = 0; i < currentObjs.length; i++) {
        let obj = currentObjs[i];
        obj.addEventListener("dragstart", function() {
            dragging = this;
            this.style['background-color'] = "rgb(150, 200, 255)";
            rankingList.prepend(dragLine);
        });
        obj.addEventListener("dragend", function(e) {
            if(dragging !== this) {return;}
            this.style['background-color'] = "";
            dragLine.remove();
            let top;
            let bottom;
            let y = e.pageY;
            const objects = gca(rankingList, 'ranking-item');
            for(let i = 0; i < objects.length; i++) {
                let centroid = computeCenter(objects[i]);
                if(centroid.y < y) {
                    continue;
                } else if((i - 1) >= 0) {
                    top = objects[i-1];
                    bottom = objects[i];
                    rankingList.insertBefore(this, bottom);
                    break;
                } else {
                    top = objects[i];
                    this.remove();
                    rankingList.prepend(this);
                    break;
                }
            }
            if(!top) {
                this.remove();
                rankingList.appendChild(this);
            }
            dragging = undefined;
        });
        let input = gc(obj, 'ranking-item-txt');
        let del = gc(obj, 'ranking-item-del');
        init_div(input);
        input.addEventListener('keydown', (e) => {
            if(e.key !== "Tab" || e.shiftKey) return;
            if(cards.indexOf(newDiv) < cards.length - 1) return;
            let ans = Array(gca(...rankingList, 'ranking-item'));
            let idx = ans.indexOf(obj);
            if(idx < ans.length - 1) return;
            e.preventDefault();
            newCard();
            gc(cards[cards.length - 1], 'question').focus();
        });
        del.addEventListener("mousedown", function() {
            if(gca(rankingList, 'ranking-item').length <= 2) {
                return;
            }
            obj.remove();
        });
    }
}
function newCard() {
    let newDiv = newEl('div');
    let n = cards.length + 1;
    newDiv.id = "c" + n;
    newDiv.className = "card";
    cardContain.appendChild(newDiv);
    cards.push(newDiv);
    initMc(newDiv, n);
}

editpic.addEventListener("mousedown", () => {
    fileselecttrigger.click();
});
resetpic.addEventListener("mousedown", () => {
    deckpic = "";
    picimg.src = "../../img/defaultdeckpic.png";
});
fileselecttrigger.addEventListener('change', () => {
    let files = fileselecttrigger.files;
    if(files && files[0]) {
        let file = files[0];
        if(!file.type.startsWith("image/")) {
            console.log('failed - file type; ' + file.type);
            return;
        }
        let reader = new FileReader();
        reader.onload = async (e) => {
            let content = e.target.result;
            if(content.byteLength > 2 * 1000 * 100) {
                console.log("Failed! Past size limit of 2 MB.");
                return;
            }
            deckpic = content;
            picimg.src = content;
        }
        reader.readAsDataURL(file);
    }
});

createBtn.addEventListener("mousedown", async function() {
    if(name.value == '') {
        errmsg.innerHTML = "Enter in a valid name for the deck";
        return;
    }
    let data = {};
    for(let i = 0; i < cards.length; i++) {
        let card = cards[i];
        let type = gc(card, 'selbtn-select');
        if(!type) {
            errmsg.innerHTML = "The system encountered an error parsing the cards and has associated it with an unexpected change in the HTML.";
            return;
        }
        let classNames = type.className.split(" ");
        if(classNames.includes('mcbtn')) {
            let cardData = {
                type: 'mc',
                op: [],
                ans: []
            };
            let question = gc(card, 'question');
            if(!question) {
                errmsg.innerHTML = "The system encountered an error parsing the cards and has associated it with an unexpected change in the HTML.";
                return;
            }
            // cardData.question = question;
            let answers = gca(card, 'mc-option');
            if(answers.length < 2) {
                errmsg.innerHTML = "The system encountered an error parsing the cards and has associated it with an unexpected change in the HTML.";
                return;
            }
            for(let j = 0; j < answers.length; j++) {
                let answer = gc(answers[j], 'mc-option-input');
                if(!answer) {
                    errmsg.innerHTML = "The system encountered an error parsing the cards and has associated it with an unexpected change in the HTML.";
                    return;
                }
                cardData.op.push(answer.dataset.html);
                let isCorrect = gca(answers[j], 'mc-option-sel');
                if(isCorrect.length > 0) {
                    cardData.ans.push(j);
                }
            }
            data[question.dataset.html] = cardData;
        } else if(classNames.includes('txtbtn')) {
            let cardData = {
                type: 'txt',
                ans: []
            };
            let question = gc(card, 'question');
            let answers = gca(card, 'txt-ans-cont');
            if(answers.length < 1) {
                errmsg.innerHTML = "The system encountered an error parsing the cards and has associated it with an unexpected change in the HTML.";
                return;
            }
            for(let j = 0; j < answers.length; j++) {
                let answer = gc(answers[j], 'txt-answer');
                if(!answer) {
                    errmsg.innerHTML = "The system encountered an error parsing the cards and has associated it with an unexpected change in the HTML.";
                    return;
                }
                cardData.ans.push(answer.dataset.html);
            }
            data[question.dataset.html] = cardData;
        } else if(classNames.includes('rankbtn')) {
            let cardData = {
                type: 'ranking',
                ans: []
            };
            let question = gc(card, 'question');
            if(!question) {
                errmsg.innerHTML = "The system encountered an error parsing the cards and has associated it with an unexpected change in the HTML.";
                return;
            }
            // cardData.question = question;
            let items = gca(card, 'ranking-item');
            for(let j = 0; j < items.length; j++) {
                let item = items[j];
                let txt = gc(item, 'ranking-item-txt');
                if(!txt) {
                    errmsg.innerHTML = "The system encountered an error parsing the cards and has associated it with an unexpected change in the HTML.";
                    return;
                }
                cardData.ans.push(txt.dataset.html);
            }
            data[question.dataset.html] = cardData;
        }
    }
    data = {
        desc: description.value,
        contnt: data
    };
    // console.log(name.value, JSON.stringify(data), isPublic.checked);
    let [s1, res1] = await DeckGateway.modify(deck, "name", name.value);
    let [s2, res2] = await DeckGateway.modify(deck, "deckpic", deckpic);
    let [s3, res3] = await DeckGateway.modify(deck, "public", isPublic.checked ? "1" : "0");
    let [s4, res4] = await DeckGateway.modify(deck, "data", JSON.stringify(data));
    if(!s1) {
        switch(res1) {
            case "no session":
                errmsg.innerHTML = "Looks like you're not logged in! We can't create this deck unless you log in again. (If you'd like, open another tab and login there.)";
            break;
            case "invalid name":
                errmsg.innerHTML = "That name has invalid characters or is empty. (Valid characters include dashes, a-z, A-Z, and 0-9)";
            break;
            case "name taken":
                errmsg.innerHTML = "You've already created another deck with that name";
            break;
            default:
                console.log(res1);
                errmsg.innerHTML = "Looks like there's an issue on our side. Try again later.";
            break;
        }
        return;
    }
    if(!s2) {
        switch(res2) {
            case "size limit":
                errmsg.innerHTML = "Looks like the deck's image exceeds the size limit of 2 MB.";
            break;
            default:
                console.log(res2);
                errmsg.innerHTML = "Looks like there's an issue on our side. Try again later.";
            break;
        }
        return;
    }
    if(!s3) {
        console.log(res3);
        errmsg.innerHTML = "Looks like there's an issue on our side. Try again later.";
        return;
    }
    if(!s4) {
        switch(res4) {
            case "same problem":
                errmsg.innerHTML = "It seems like two or more cards in your deck have the exact same question. (We currently don't support duplicate questions.)";
            break;
            default:        
                console.log(res4);
                errmsg.innerHTML = "Looks like there's an issue on our side. Try again later.";
            break;
        }
        return;
    }
    window.location.href = "/home?l=ed&s=1";
});

addCard.addEventListener("mousedown", newCard);

(async () => {
    let [success, data] = await UserGateway.getuser();
    if(!success) return;
    const paramList = new URLSearchParams(window.location.search);
    if(!paramList.get("d")) {
        errmsg.innerHTML = "Looks like there was an error. Go back to where you came from, and try again. (If you continue to experience errors, please inform us.)";
        name.remove();
        description.remove();
        isPublic.parentNode.remove();
        cardContain.remove();
        addCard.remove();
        createBtn.remove();
        return;
    }
    let dVal = parseInt(paramList.get('d'));
    deck = dVal;
    [success, contnt] = await DeckGateway.get(deck);
    if(!success) window.location.href = "/home";
    if(contnt.owner !== data.username) window.location.href = "/home";
    name.value = contnt.name;
    if(contnt.deckpic && contnt.deckpic.length > 0) {
        picimg.src = contnt.deckpic;
        deckpic = contnt.deckpic;
    }
    isPublic.checked = contnt.public;
    description.value = contnt.data.desc;
    let d_keys = Object.keys(contnt.data.contnt);
    for(let i = 0; i < d_keys.length; i++) {
        let card = contnt.data.contnt[d_keys[i]];
        let q = d_keys[i];
        let newDiv = newEl('div');
        let n = cards.length + 1;
        newDiv.id = "c" + n;
        newDiv.className = "card";
        cardContain.appendChild(newDiv);
        cards.push(newDiv);
        switch(card.type) {
            case "mc":
                initMc(newDiv, n);
                gc(newDiv, 'question').setAttribute('data-html', q);
                gc(newDiv, 'question').innerHTML = q;
                typeset(gc(newDiv, 'question'));
                let cardmc = gc(newDiv, 'card-mc');
                cardmc.innerHTML = "";
                for(let i = 0; i < card.op.length; i++) {
                    let newOp = newEl('div');
                    newOp.className = "mc-option";
                    newOp.innerHTML = `
                        <div contenteditable="true" type='input' class='mc-option-input' placeholder='...'>${card.op[i]}</div>
                        <button class='mc-option-del' tabindex="-1"><span class='material-symbols-outlined'>close</span></button>
                        <button class='mc-option-correct ${card.ans.indexOf(i) > -1 ? 'mc-option-sel' : 'mc-option-nosel'}' tabindex="-1">${card.ans.indexOf(i) > -1 ? '<span class="material-symbols-outlined">check</span>' : '<span class="material-symbols-outlined">check_indeterminate_small</span>'}</button>
                    `;
                    cardmc.appendChild(newOp);
                    let input = gc(newOp, 'mc-option-input');
                    let delBtn = gc(newOp, 'mc-option-del');
                    let correctBtn = gc(newOp, 'mc-option-correct');
                    init_div(input);
                    input.setAttribute('data-html', input.innerHTML);
                    typeset(input);
                    input.addEventListener('keydown', (e) => {
                        if(e.key !== "Tab" || e.shiftKey) return;
                        if(cards.indexOf(newDiv) < cards.length - 1) return;
                        let ans = Array(gca(...cardmc, 'mc-option'));
                        let idx = ans.indexOf(newOp);
                        if(idx < ans.length - 1) return;
                        e.preventDefault();
                        newCard();
                        gc(cards[cards.length - 1], 'question').focus();
                    })
                    delBtn.addEventListener("mousedown", function() {
                        if(gca(cardmc, 'mc-option').length <= 2) return;
                        if(gca(newOp, 'mc-option-sel').length == 1) {
                            // get random option to assign to
                            let newCorrect = gc(cardmc, 'mc-option-nosel');
                            newCorrect.className = "mc-option-correct mc-option-sel";
                            newCorrect.innerHTML = "<span class='material-symbols-outlined'>check</span>";
                        }
                        newOp.remove();
                    });
                    correctBtn.addEventListener("mousedown", function() {
                        if(correctBtn.className.includes('mc-option-sel')) {
                            if(gca(cardmc, 'mc-option-sel').length == 1) return;
                            correctBtn.className = "mc-option-correct mc-option-nosel";
                            correctBtn.innerHTML = `<span class="material-symbols-outlined">check_indeterminate_small</span>`;
                        } else {
                            correctBtn.className = "mc-option-correct mc-option-sel";
                            correctBtn.innerHTML = "<span class='material-symbols-outlined'>check</span>";
                        }
                    });
                }
            break;
            case "txt":
                initTxt(newDiv, n);
                gc(newDiv, 'question').setAttribute('data-html', q);
                gc(newDiv, 'question').innerHTML = q;
                typeset(gc(newDiv, 'question'));
                let ansList = gca(newDiv, 'card-txt');
                if(card.ans.length == 0) continue;
                let firstAns = gc(ansList, 'txt-ans-cont');
                firstAns.innerHTML = card.ans[0];
                typeset(firstAns);
                for(let i = 1; i < card.ans.length; i++) {
                    let newAns = newEl('div');
                    newAns.className = 'txt-ans-cont';
                    newAns.innerHTML = `
                        <div contenteditable="true" type='input' class='txt-answer' placeholder='...'></div>
                        <button class='txt-op-del' tabindex="-1"><span class='material-symbols-outlined'>close</span></button>
                    `;
                    ansList.appendChild(newAns);
                    let input = gc(newAns, 'txt-answer');
                    let delBtn = gc(newAns, 'txt-op-del');
                    init_div(input);
                    input.setAttribute('data-html', card.ans);
                    input.innerHTML = card.ans;
                    typeset(input);
                    input.addEventListener('keydown', (e) => {
                        if(e.key !== "Tab" || e.shiftKey) return;
                        if(cards.indexOf(newDiv) < cards.length - 1) return;
                        let ans = Array(gca(...ansList, 'txt-ans-cont'));
                        let idx = ans.indexOf(newAns);
                        if(idx < ans.length - 1) return;
                        e.preventDefault();
                        newCard();
                        gc(cards[cards.length - 1], 'question').focus();
                    });
                    delBtn.addEventListener('mousedown', () => newAns.remove());
                }
            break;
            case "ranking":
                initRanking(newDiv, n);
                gc(newDiv, 'question').setAttribute('data-html', q);
                gc(newDiv, 'question').innerHTML = q;
                typeset(gc(newDiv, 'question'));
                let rankingList = gc(newDiv, 'ranking-list');
                rankingList.innerHTML = '';
                for(let i = 0; i < card.ans.length; i++) {
                    let item = newEl('div');
                    item.className = 'ranking-item';
                    item.setAttribute("draggable", true);
                    item.innerHTML = `
                        <div contenteditable="true" type='text' class='ranking-item-txt' placeholder='...'>${card.ans[i]}</div>
                        <button class='ranking-item-del' tabindex="-1"><span class='material-symbols-outlined'>close</span></button>
                    `;
                    rankingList.appendChild(item);
                    item.addEventListener("dragstart", function() {
                        dragging = this;
                        this.style['background-color'] = "rgb(150, 200, 255)";
                        rankingList.prepend(dragLine);
                    });
                    item.addEventListener("dragend", function(e) {
                        if(dragging !== this) {return;}
                        this.style['background-color'] = "";
                        dragLine.remove();
                        let top;
                        let bottom;
                        let y = e.pageY;
                        const objects = gca(rankingList, 'ranking-item');
                        for(let i = 0; i < objects.length; i++) {
                            let centroid = computeCenter(objects[i]);
                            if(centroid.y < y) {
                                continue;
                            } else if((i - 1) >= 0) {
                                top = objects[i-1];
                                bottom = objects[i];
                                rankingList.insertBefore(this, bottom);
                                break;
                            } else {
                                top = objects[i];
                                this.remove();
                                rankingList.prepend(this);
                                break;
                            }
                        }
                        if(!top) {
                            this.remove();
                            rankingList.appendChild(this);
                        }
                        dragging = undefined;
                    });
                    let input = gc(item, 'ranking-item-txt');
                    let del = gc(item, 'ranking-item-del');
                    init_div(input);
                    input.setAttribute('data-html', input.innerHTML);
                    typeset(input);
                    input.addEventListener('keydown', (e) => {
                        if(e.key !== "Tab" || e.shiftKey) return;
                        if(cards.indexOf(newDiv) < cards.length - 1) return;
                        let ans = Array(gca(...rankingList, 'ranking-item'));
                        let idx = ans.indexOf(item);
                        if(idx < ans.length - 1) return;
                        e.preventDefault();
                        newCard();
                        gc(cards[cards.length - 1], 'question').focus();
                    });
                    del.addEventListener("mousedown", function() {
                        if(gca(rankingList, 'ranking-item').length <= 2) {
                            return;
                        }
                        item.remove();
                    });
                }
            break;
        }
    }
})();

// Dragging event
window.addEventListener("dragover", function(e) {
    if(!dragging) {return;}
    let list = dragging.parentNode;
    if(dragLine.parentNode !== list) {
        list.prepend(dragLine);
    }
    let top;
    let bottom;
    let y = e.pageY;
    const objects = gca(list, 'ranking-item');
    for(let i = 0; i < objects.length; i++) {
        let centroid = computeCenter(objects[i]);
        if(centroid.y < y) {
            continue;
        } else if((i - 1) >= 0) {
            top = objects[i-1];
            bottom = objects[i];
            list.insertBefore(dragLine, bottom);
            break;
        } else {
            top = objects[i];
            dragLine.remove();
            list.prepend(dragLine);
            break;
        }
    }
    if(!top) {
        dragLine.remove();
        list.appendChild(dragLine);
    }
});
