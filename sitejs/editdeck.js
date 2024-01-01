import { UserGateway } from "../server/client-gateway/user-gateway.js";
import { DeckGateway } from "../server/client-gateway/deck-gateway.js";
// Other objects
const name = document.getElementById("name");
const isPublic = document.getElementById("isPublic");
const description = document.getElementById("description");
const cardContain = document.getElementById("cardcontain");
const addCard = document.getElementById("addcard");
const createBtn = document.getElementById("create");
const errmsg = document.getElementById("edit-err");
const editpic = document.getElementById("picAddBtn");
const resetpic = document.getElementById("picReset");
const fileselecttrigger = document.getElementById("fileselecttrigger");
const picimg = document.getElementById("deckpic");
let deckpic = "";
let cards = [];
let dragging;
const dragLine = document.createElement("div");
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
    newDiv.getElementsByClassName('mcbtn')[0].addEventListener("mousedown", function() {
        if(newDiv.getElementsByClassName('card-mc').length > 0) return;
        initMc(newDiv, n, newDiv.getElementsByClassName("question")[0].innerHTML);
    });
    newDiv.getElementsByClassName('mcbtn')[0].addEventListener("keydown", function(e) {
        if(newDiv.getElementsByClassName('card-mc').length > 0) return;
        if(e.key == "Enter" || e.key == " ") initMc(newDiv, n, newDiv.getElementsByClassName("question")[0].innerHTML);
    });
    newDiv.getElementsByClassName('txtbtn')[0].addEventListener("mousedown", function() {
        if(newDiv.getElementsByClassName('txt-answer').length > 0) return;
        initTxt(newDiv, n, newDiv.getElementsByClassName("question")[0].innerHTML);
    });
    newDiv.getElementsByClassName('txtbtn')[0].addEventListener("keydown", function(e) {
        if(newDiv.getElementsByClassName('txt-answer').length > 0) return;
        if(e.key == "Enter" || e.key == " ") initTxt(newDiv, n, newDiv.getElementsByClassName("question")[0].innerHTML);
    });
    newDiv.getElementsByClassName('rankbtn')[0].addEventListener("mousedown", function() {
        if(newDiv.getElementsByClassName('card-rank').length > 0) return;
        initRanking(newDiv, n, newDiv.getElementsByClassName("question")[0].innerHTML);
    });
    newDiv.getElementsByClassName('rankbtn')[0].addEventListener("keydown", function(e) {
        if(newDiv.getElementsByClassName('card-rank').length > 0) return;
        if(e.key == "Enter" || e.key == " ") initRanking(newDiv, n, newDiv.getElementsByClassName("question")[0].innerHTML);
    });
    newDiv.getElementsByClassName('card-del')[0].addEventListener("mousedown", function() {
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
                Question: <div contenteditable="true" type='input' class='question' placeholder='Question [format math between two $]'>${q ?? ""}</div>
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
    let problem = newDiv.getElementsByClassName('question')[0];
    init_div(problem); // question
    if(q) {
        problem.setAttribute('data-html', q);
        typeset(problem);
    }
    // Set up multiple choice card functionality
    let cardmc = newDiv.getElementsByClassName('card-mc')[0];
    let addBtn = newDiv.getElementsByClassName('mc-add')[0];
    addBtn.addEventListener("mousedown", function() {
        let newOp = document.createElement("div");
        newOp.className = "mc-option";
        newOp.innerHTML = `
            <div contenteditable="true" type='input' class='mc-option-input' placeholder='...'></div>
            <button class='mc-option-del' tabindex='-1'><span class='material-symbols-outlined'>close</span></button>
            <button class='mc-option-correct mc-option-nosel' tabindex='-1'><span class="material-symbols-outlined">check_indeterminate_small</span></button>
        `;
        cardmc.appendChild(newOp);
        let input = newOp.getElementsByClassName('mc-option-input')[0];
        let delBtn = newOp.getElementsByClassName("mc-option-del")[0];
        let correctBtn = newOp.getElementsByClassName("mc-option-correct")[0];
        init_div(input);
        input.addEventListener('keydown', (e) => {
            if(e.key !== "Tab" || e.shiftKey) return;
            if(cards.indexOf(newDiv) < cards.length - 1) return;
            let ans = Array(...cardmc.getElementsByClassName("mc-option"));
            let idx = ans.indexOf(newOp);
            if(idx < ans.length - 1) return;
            e.preventDefault();
            newCard();
            cards[cards.length - 1].getElementsByClassName('question')[0].focus();
        })
        delBtn.addEventListener("mousedown", function() {
            if(cardmc.getElementsByClassName('mc-option').length <= 2) return;
            if(newOp.getElementsByClassName("mc-option-sel").length == 1) {
                // get random option to assign to
                let newCorrect = cardmc.getElementsByClassName("mc-option-nosel")[0];
                newCorrect.className = "mc-option-correct mc-option-sel";
                newCorrect.innerHTML = "<span class='material-symbols-outlined'>check</span>";
            }
            newOp.remove();
        });
        correctBtn.addEventListener("mousedown", function() {
            if(correctBtn.className.includes('mc-option-sel')) {
                if(cardmc.getElementsByClassName('mc-option-sel').length == 1) return;
                correctBtn.className = "mc-option-correct mc-option-nosel";
                correctBtn.innerHTML = `<span class="material-symbols-outlined">check_indeterminate_small</span>`;
            } else {
                correctBtn.className = "mc-option-correct mc-option-sel";
                correctBtn.innerHTML = "<span class='material-symbols-outlined'>check</span>";
            }
        });
    });
    let ops = cardmc.getElementsByClassName("mc-option");
    for(let i = 0; i < ops.length; i++) {
        let div = ops[i];
        let input = div.getElementsByClassName('mc-option-input')[0];
        let delBtn = div.getElementsByClassName("mc-option-del")[0];
        let correctBtn = div.getElementsByClassName("mc-option-correct")[0];
        init_div(input);
        input.addEventListener('keydown', (e) => {
            if(e.key !== "Tab" || e.shiftKey) return;
            if(cards.indexOf(newDiv) < cards.length - 1) return;
            let ans = Array(...cardmc.getElementsByClassName("mc-option"));
            let idx = ans.indexOf(div);
            if(idx < ans.length - 1) return;
            e.preventDefault();
            newCard();
            cards[cards.length - 1].getElementsByClassName('question')[0].focus();
        });
        delBtn.addEventListener("mousedown", function() {
            if(cardmc.getElementsByClassName('mc-option').length <= 2) return;
            if(div.getElementsByClassName("mc-option-sel").length == 1) {
                // get random option to assign to
                let newCorrect = cardmc.getElementsByClassName("mc-option-nosel")[0];
                newCorrect.className = "mc-option-correct mc-option-sel";
                newCorrect.innerHTML = "<span class='material-symbols-outlined'>check</span>";
            }
            div.remove();
        });
        correctBtn.addEventListener("mousedown", function() {
            if(correctBtn.className.includes('mc-option-sel')) {
                if(cardmc.getElementsByClassName('mc-option-sel').length == 1) return;
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
                Question: <div contenteditable="true" type='input' class='question' placeholder='Question [format math between two $]'>${q ?? ""}</div>
            </div>
            <div class='card-txt'>
                <div class='txt-ans-cont'>
                    <div contenteditable="true" type='input' class='txt-answer' placeholder='...'></div>
                </div>
            </div>
            <button class='txt-add' tabindex='-1'>+</button>
            <button class='card-del' tabindex='-1'>Delete Card</button>
            <input type='checkbox' class='show-both-ways' tabindex="-1"><span> | Show both ways</span>
        </div>
        <div class='deck-divider'></div>
    `;
    // Set up selector
    set_selector(newDiv, n);
    let problem = newDiv.getElementsByClassName('question')[0];
    init_div(problem); // question
    if(q) {
        problem.setAttribute('data-html', q);
        typeset(problem);
    }
    // Configure text card
    let ansList = newDiv.getElementsByClassName('card-txt')[0];
    let addBtn = newDiv.getElementsByClassName('txt-add')[0];
    addBtn.addEventListener('mousedown', () => {
        let newAns = document.createElement('div');
        newAns.className = 'txt-ans-cont';
        newAns.innerHTML = `
            <div contenteditable="true" type='input' class='txt-answer' placeholder='...'></div>
            <button class='txt-op-del' tabindex="-1"><span class='material-symbols-outlined'>close</span></button>
        `;
        ansList.appendChild(newAns);
        let input = newAns.getElementsByClassName('txt-answer')[0];
        let delBtn = newAns.getElementsByClassName('txt-op-del')[0];
        init_div(input);
        input.addEventListener('keydown', (e) => {
            if(e.key !== "Tab" || e.shiftKey) return;
            if(cards.indexOf(newDiv) < cards.length - 1) return;
            let ans = Array(...ansList.getElementsByClassName("txt-ans-cont"));
            let idx = ans.indexOf(newAns);
            if(idx < ans.length - 1) return;
            e.preventDefault();
            newCard();
            cards[cards.length - 1].getElementsByClassName('question')[0].focus();
        });
        delBtn.addEventListener('mousedown', () => newAns.remove());
    });
    let currAns = ansList.getElementsByClassName('txt-ans-cont')[0];
    let txtAns = currAns.getElementsByClassName('txt-answer')[0];
    init_div(txtAns);
    txtAns.addEventListener('keydown', (e) => {
        if(e.key !== "Tab" || e.shiftKey) return;
        if(cards.indexOf(newDiv) < cards.length - 1) return;
        let ans = Array(...ansList.getElementsByClassName("txt-ans-cont"));
        let idx = ans.indexOf(currAns);
        if(idx < ans.length - 1) return;
        e.preventDefault();
        newCard();
        cards[cards.length - 1].getElementsByClassName('question')[0].focus();
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
                Question: <div contenteditable="true" type='input' class='question' placeholder='Question [format math between two $]'>${q ?? ""}</div>
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
    let problem = newDiv.getElementsByClassName('question')[0];
    init_div(problem); // question
    if(q) {
        problem.setAttribute('data-html', q);
        typeset(problem);
    }
    // Set up ranking card functionality
    let rankingList = newDiv.getElementsByClassName('ranking-list')[0];
    let addBtn = newDiv.getElementsByClassName('rank-add')[0];
    addBtn.addEventListener("mousedown", function() {
        let item = document.createElement("div");
        item.className = 'ranking-item';
        item.setAttribute("draggable", true);
        item.innerHTML = `
            <div contenteditable="true" type='text' class='ranking-item-txt' placeholder='...'></div>
            <button class='ranking-item-del' tabindex='-1'><span class='material-symbols-outlined'>close</span></button>
        `;
        rankingList.appendChild(item);
        item.addEventListener("dragstart", function() {
            dragging = item;
            item.style['background-color'] = "rgb(150, 200, 255)";
            rankingList.prepend(dragLine);
        });
        item.addEventListener("dragend", function(e) {
            if(dragging !== item) {return;}
            item.style['background-color'] = "";
            dragLine.remove();
            let top;
            let bottom;
            let y = e.pageY;
            const objects = rankingList.getElementsByClassName('ranking-item');
            for(let i = 0; i < objects.length; i++) {
                let centroid = computeCenter(objects[i]);
                if(centroid.y < y) {
                    continue;
                } else if((i - 1) >= 0) {
                    top = objects[i-1];
                    bottom = objects[i];
                    rankingList.insertBefore(item, bottom);
                    break;
                } else {
                    top = objects[i];
                    item.remove();
                    rankingList.prepend(item);
                    break;
                }
            }
            if(!top) {
                item.remove();
                rankingList.appendChild(item);
            }
            dragging = undefined;
        });
        let input = item.getElementsByClassName('ranking-item-txt')[0];
        let del = item.getElementsByClassName('ranking-item-del')[0];
        init_div(input);
        input.addEventListener('keydown', (e) => {
            if(e.key !== "Tab" || e.shiftKey) return;
            if(cards.indexOf(newDiv) < cards.length - 1) return;
            let ans = Array(...rankingList.getElementsByClassName("ranking-item"));
            let idx = ans.indexOf(item);
            if(idx < ans.length - 1) return;
            e.preventDefault();
            newCard();
            cards[cards.length - 1].getElementsByClassName('question')[0].focus();
        });
        del.addEventListener("mousedown", function() {
            if(rankingList.getElementsByClassName('ranking-item').length <= 2) {
                return;
            }
            item.remove();
        });
    });
    let currentObjs = rankingList.getElementsByClassName("ranking-item");
    for(let i = 0; i < currentObjs.length; i++) {
        let obj = currentObjs[i];
        obj.addEventListener("dragstart", function() {
            dragging = obj;
            obj.style['background-color'] = "rgb(150, 200, 255)";
            rankingList.prepend(dragLine);
        });
        obj.addEventListener("dragend", function(e) {
            if(dragging !== obj) {return;}
            obj.style['background-color'] = "";
            dragLine.remove();
            let top;
            let bottom;
            let y = e.pageY;
            const objects = rankingList.getElementsByClassName('ranking-item');
            for(let i = 0; i < objects.length; i++) {
                let centroid = computeCenter(objects[i]);
                if(centroid.y < y) {
                    continue;
                } else if((i - 1) >= 0) {
                    top = objects[i-1];
                    bottom = objects[i];
                    rankingList.insertBefore(obj, bottom);
                    break;
                } else {
                    top = objects[i];
                    obj.remove();
                    rankingList.prepend(obj);
                    break;
                }
            }
            if(!top) {
                obj.remove();
                rankingList.appendChild(obj);
            }
            dragging = undefined;
        });
        let input = obj.getElementsByClassName('ranking-item-txt')[0];
        let del = obj.getElementsByClassName('ranking-item-del')[0];
        init_div(input);
        input.addEventListener('keydown', (e) => {
            if(e.key !== "Tab" || e.shiftKey) return;
            if(cards.indexOf(newDiv) < cards.length - 1) return;
            let ans = Array(...rankingList.getElementsByClassName("ranking-item"));
            let idx = ans.indexOf(obj);
            if(idx < ans.length - 1) return;
            e.preventDefault();
            newCard();
            cards[cards.length - 1].getElementsByClassName('question')[0].focus();
        });
        del.addEventListener("mousedown", function() {
            if(rankingList.getElementsByClassName('ranking-item').length <= 2) {
                return;
            }
            obj.remove();
        });
    }
}
function newCard() {
    let newDiv = document.createElement("div");
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
        let type = card.getElementsByClassName('selbtn-select')[0];
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
            let question = card.getElementsByClassName('question')[0];
            if(!question) {
                errmsg.innerHTML = "The system encountered an error parsing the cards and has associated it with an unexpected change in the HTML.";
                return;
            }
            // cardData.question = question;
            let answers = card.getElementsByClassName('mc-option');
            if(answers.length < 2) {
                errmsg.innerHTML = "The system encountered an error parsing the cards and has associated it with an unexpected change in the HTML.";
                return;
            }
            for(let j = 0; j < answers.length; j++) {
                let answer = answers[j].getElementsByClassName('mc-option-input')[0];
                if(!answer) {
                    errmsg.innerHTML = "The system encountered an error parsing the cards and has associated it with an unexpected change in the HTML.";
                    return;
                }
                cardData.op.push(answer.dataset.html);
                let isCorrect = answers[j].getElementsByClassName('mc-option-sel');
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
            let question = card.getElementsByClassName('question')[0];
            let answers = card.getElementsByClassName('txt-ans-cont');
            let showBothWays = card.getElementsByClassName('show-both-ways')[0];
            if(answers.length < 1) {
                errmsg.innerHTML = "The system encountered an error parsing the cards and has associated it with an unexpected change in the HTML.";
                return;
            }
            for(let j = 0; j < answers.length; j++) {
                let answer = answers[j].getElementsByClassName('txt-answer')[0];
                if(!answer) {
                    errmsg.innerHTML = "The system encountered an error parsing the cards and has associated it with an unexpected change in the HTML.";
                    return;
                }
                cardData.ans.push(answer.dataset.html);
            }
            if(showBothWays.checked) cardData.dual = true;
            data[question.dataset.html] = cardData;
        } else if(classNames.includes('rankbtn')) {
            let cardData = {
                type: 'ranking',
                ans: []
            };
            let question = card.getElementsByClassName('question')[0];
            if(!question) {
                errmsg.innerHTML = "The system encountered an error parsing the cards and has associated it with an unexpected change in the HTML.";
                return;
            }
            // cardData.question = question;
            let items = card.getElementsByClassName('ranking-item');
            for(let j = 0; j < items.length; j++) {
                let item = items[j];
                let txt = item.getElementsByClassName('ranking-item-txt')[0];
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
        let newDiv = document.createElement("div");
        let n = cards.length + 1;
        newDiv.id = "c" + n;
        newDiv.className = "card";
        cardContain.appendChild(newDiv);
        cards.push(newDiv);
        switch(card.type) {
            case "mc":
                initMc(newDiv, n);
                newDiv.getElementsByClassName('question')[0].setAttribute('data-html', q);
                newDiv.getElementsByClassName('question')[0].innerHTML = q;
                typeset(newDiv.getElementsByClassName('question')[0]);
                let cardmc = newDiv.getElementsByClassName('card-mc')[0];
                cardmc.innerHTML = "";
                for(let i = 0; i < card.op.length; i++) {
                    let newOp = document.createElement("div");
                    newOp.className = "mc-option";
                    newOp.innerHTML = `
                        <div contenteditable="true" type='input' class='mc-option-input' placeholder='...'>${card.op[i]}</div>
                        <button class='mc-option-del' tabindex="-1"><span class='material-symbols-outlined'>close</span></button>
                        <button class='mc-option-correct ${card.ans.indexOf(i) > -1 ? 'mc-option-sel' : 'mc-option-nosel'}' tabindex="-1">${card.ans.indexOf(i) > -1 ? '<span class="material-symbols-outlined">check</span>' : '<span class="material-symbols-outlined">check_indeterminate_small</span>'}</button>
                    `;
                    cardmc.appendChild(newOp);
                    let input = newOp.getElementsByClassName('mc-option-input')[0];
                    let delBtn = newOp.getElementsByClassName("mc-option-del")[0];
                    let correctBtn = newOp.getElementsByClassName("mc-option-correct")[0];
                    init_div(input);
                    input.setAttribute('data-html', input.innerHTML);
                    typeset(input);
                    input.addEventListener('keydown', (e) => {
                        if(e.key !== "Tab" || e.shiftKey) return;
                        if(cards.indexOf(newDiv) < cards.length - 1) return;
                        let ans = Array(...cardmc.getElementsByClassName("mc-option"));
                        let idx = ans.indexOf(newOp);
                        if(idx < ans.length - 1) return;
                        e.preventDefault();
                        newCard();
                        cards[cards.length - 1].getElementsByClassName('question')[0].focus();
                    })
                    delBtn.addEventListener("mousedown", function() {
                        if(cardmc.getElementsByClassName('mc-option').length <= 2) return;
                        if(newOp.getElementsByClassName("mc-option-sel").length == 1) {
                            // get random option to assign to
                            let newCorrect = cardmc.getElementsByClassName("mc-option-nosel")[0];
                            newCorrect.className = "mc-option-correct mc-option-sel";
                            newCorrect.innerHTML = "<span class='material-symbols-outlined'>check</span>";
                        }
                        newOp.remove();
                    });
                    correctBtn.addEventListener("mousedown", function() {
                        if(correctBtn.className.includes('mc-option-sel')) {
                            if(cardmc.getElementsByClassName('mc-option-sel').length == 1) return;
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
                newDiv.getElementsByClassName('question')[0].setAttribute('data-html', q);
                newDiv.getElementsByClassName('question')[0].innerHTML = q;
                typeset(newDiv.getElementsByClassName('question')[0]);
                let ansList = newDiv.getElementsByClassName('card-txt');
                if(card.ans.length == 0) continue;
                let firstAns = ansList.getElementsByClassName('txt-ans-cont')[0];
                firstAns.innerHTML = card.ans[0];
                typeset(firstAns);
                for(let i = 1; i < card.ans.length; i++) {
                    let newAns = document.createElement('div');
                    newAns.className = 'txt-ans-cont';
                    newAns.innerHTML = `
                        <div contenteditable="true" type='input' class='txt-answer' placeholder='...'></div>
                        <button class='txt-op-del' tabindex="-1"><span class='material-symbols-outlined'>close</span></button>
                    `;
                    ansList.appendChild(newAns);
                    let input = newAns.getElementsByClassName('txt-answer')[0];
                    let delBtn = newAns.getElementsByClassName('txt-op-del')[0];
                    init_div(input);
                    input.setAttribute('data-html', card.ans);
                    input.innerHTML = card.ans;
                    typeset(input);
                    input.addEventListener('keydown', (e) => {
                        if(e.key !== "Tab" || e.shiftKey) return;
                        if(cards.indexOf(newDiv) < cards.length - 1) return;
                        let ans = Array(...ansList.getElementsByClassName("txt-ans-cont"));
                        let idx = ans.indexOf(newAns);
                        if(idx < ans.length - 1) return;
                        e.preventDefault();
                        newCard();
                        cards[cards.length - 1].getElementsByClassName('question')[0].focus();
                    });
                    delBtn.addEventListener('mousedown', () => newAns.remove());
                }
                let showBothWays = card.getElementsByClassName('show-both-ways')[0];
                if(card.dual) showBothWays.checked = true;
            break;
            case "ranking":
                initRanking(newDiv, n);
                newDiv.getElementsByClassName('question')[0].setAttribute('data-html', q);
                newDiv.getElementsByClassName('question')[0].innerHTML = q;
                typeset(newDiv.getElementsByClassName('question')[0]);
                let rankingList = newDiv.getElementsByClassName("ranking-list")[0];
                rankingList.innerHTML = '';
                for(let i = 0; i < card.ans.length; i++) {
                    let item = document.createElement("div");
                    item.className = 'ranking-item';
                    item.setAttribute("draggable", true);
                    item.innerHTML = `
                        <div contenteditable="true" type='text' class='ranking-item-txt' placeholder='...'>${card.ans[i]}</div>
                        <button class='ranking-item-del' tabindex="-1"><span class='material-symbols-outlined'>close</span></button>
                    `;
                    rankingList.appendChild(item);
                    item.addEventListener("dragstart", function() {
                        dragging = item;
                        item.style['background-color'] = "rgb(150, 200, 255)";
                        rankingList.prepend(dragLine);
                    });
                    item.addEventListener("dragend", function(e) {
                        if(dragging !== item) {return;}
                        item.style['background-color'] = "";
                        dragLine.remove();
                        let top;
                        let bottom;
                        let y = e.pageY;
                        const objects = rankingList.getElementsByClassName('ranking-item');
                        for(let i = 0; i < objects.length; i++) {
                            let centroid = computeCenter(objects[i]);
                            if(centroid.y < y) {
                                continue;
                            } else if((i - 1) >= 0) {
                                top = objects[i-1];
                                bottom = objects[i];
                                rankingList.insertBefore(item, bottom);
                                break;
                            } else {
                                top = objects[i];
                                item.remove();
                                rankingList.prepend(item);
                                break;
                            }
                        }
                        if(!top) {
                            item.remove();
                            rankingList.appendChild(item);
                        }
                        dragging = undefined;
                    });
                    let input = item.getElementsByClassName('ranking-item-txt')[0];
                    let del = item.getElementsByClassName('ranking-item-del')[0];
                    init_div(input);
                    input.setAttribute('data-html', input.innerHTML);
                    typeset(input);
                    input.addEventListener('keydown', (e) => {
                        if(e.key !== "Tab" || e.shiftKey) return;
                        if(cards.indexOf(newDiv) < cards.length - 1) return;
                        let ans = Array(...rankingList.getElementsByClassName("ranking-item"));
                        let idx = ans.indexOf(item);
                        if(idx < ans.length - 1) return;
                        e.preventDefault();
                        newCard();
                        cards[cards.length - 1].getElementsByClassName('question')[0].focus();
                    });
                    del.addEventListener("mousedown", function() {
                        if(rankingList.getElementsByClassName('ranking-item').length <= 2) {
                            return;
                        }
                        item.remove();
                    });
                }
            break;
        }
    }
    window.LOADED();
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
    const objects = list.getElementsByClassName('ranking-item');
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
