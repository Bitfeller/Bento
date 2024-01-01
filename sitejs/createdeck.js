import { UserGateway } from "../server/client-gateway/user-gateway.js";
import { DeckGateway } from "../server/client-gateway/deck-gateway.js";
// User
let user;
// Other objects
const name = document.getElementById("name");
const isPublic = document.getElementById("isPublic");
const description = document.getElementById("description");
const cardContain = document.getElementById("cardcontain");
const addCard = document.getElementById("addcard");
const createBtn = document.getElementById("create");
const errmsg = document.getElementById("create-err");
const editpic = document.getElementById("picAddBtn");
const resetpic = document.getElementById("picReset");
const fileselecttrigger = document.getElementById("fileselecttrigger");
const picimg = document.getElementById("deckpic");
const draftdecks_history = document.getElementById("draftdecks-history");
let deckpic = "";
let cards = [];
let userdata_save;
let dragging;
const dragLine = document.createElement("div");
dragLine.style = 'display: flex; background-color: rgb(0, 150, 255); width: 100%; height: 5px;';

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
                Question: <div contenteditable="true" type='input' class='question' placeholder='The question...'>${q ?? ""}</div>
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
    if(cards.length < 2) {
        initMc(newDiv, n);
        return;
    }
    let type = cards[cards.length - 2].getElementsByClassName('selbtn-select')[0];
    if(!type) {
        initMc(newDiv, n);
        return;
    }
    let classNames = type.className.split(" ");
    if(classNames.includes('mcbtn')) {
        initMc(newDiv, n);
    } else if(classNames.includes('txtbtn')) {
        initTxt(newDiv, n);
    } else if(classNames.includes('rankbtn')) {
        initRanking(newDiv, n);
    } else {
        initMc(newDiv, n);
    }
}

editpic.addEventListener("mousedown", () => {
    fileselecttrigger.click();
})
resetpic.addEventListener("mousedown", () => {
    deckpic = "";
    picimg.src = "../../img/defaultdeckpic.png";
})
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
})

createBtn.addEventListener("mousedown", async function() {
    if(!user) {
        errmsg.innerHTML = "Looks like you're not logged in! We can't create this deck unless you log in again. (If you'd like, open another tab and login there.)";
        return;
    }
    if(name == '') {
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
    let [success, reason] = await DeckGateway.add(name.value, deckpic || "", JSON.stringify(data), isPublic.checked);
    if(!success) {
        switch(reason) {
            case "no session":
                errmsg.innerHTML = "Looks like you're not logged in! We can't create this deck unless you log in again. (If you'd like, open another tab and login there.)";
            break;
            case "invalid name":
                errmsg.innerHTML = "That name has invalid characters or is empty. (Valid characters include dashes, a-z, A-Z, and 0-9)";
            break;
            case "name exists":
                errmsg.innerHTML = "You've already created another deck with that name";
            break;
            case "size limit":
                errmsg.innerHTML = "Looks like the deck's image exceeds the size limit of 2 MB.";
            break;
            case "same problem":
                errmsg.innerHTML = "It seems like two or more cards in your deck have the exact same question. (We currently don't support duplicate questions.)";
            break;
            default:
                console.log(reason);
                errmsg.innerHTML = "Looks like there's an issue on our side. Try again later.";
            break;
        }
    } else {
        window.location.href = "/home?l=cd&s=1";
    }
});

addCard.addEventListener("mousedown", newCard);

(async () => {
    let [success, data] = await UserGateway.getuser();
    if(!success) return;
    user = data;
    newCard();
    userdata_save = user.userdata;
    let keys = Object.keys(user.userdata.draftdecks);
    if(keys.length > 0) draftdecks_history.innerHTML = "";
    for(let i = 0; i < keys.length; i++) {
        let time = parseInt(keys[i]);
        let diff = Date.now() - time;
        let deck = user.userdata.draftdecks[keys[i]];
        let div = document.createElement("div");
        div.className = "draftdeck";
        div.innerHTML = `
            <p>${diff > 2 * 24 * 60 * 60 * 1000 ? "Before Yesterday" : (diff > 24 * 60 * 60 * 1000 ? "Yesterday" : (diff > 12 * 60 * 60 * 1000 ? "Today" : "This Hour"))}</p>
            <div><button class='show'><span class="material-symbols-outlined">resume</span></button>
            <button class='del'><span class="material-symbols-outlined">delete</span></button></div>`;
        draftdecks_history.appendChild(div);
        div.getElementsByClassName("show")[0].addEventListener("mousedown", () => {
            cardContain.innerHTML = "";
            cards = [];
            appendToCards(deck.contnt);
        });
        div.getElementsByClassName("del")[0].addEventListener("mousedown", async () => {
            div.remove();
            delete user.userdata.draftdecks[keys[i]];
            delete userdata_save.draftdecks[keys[i]];
            let copy = JSON.stringify(userdata_save);
            await UserGateway.editUser("userdata", copy);
        });
    }
    window.setInterval(async () => {
        let copy = structuredClone(userdata_save);
        let data = {};
        for(let i = 0; i < cards.length; i++) {
            let card = cards[i];
            let type = card.getElementsByClassName('selbtn-select')[0];
            if(!type) continue;
            let classNames = type.className.split(" ");
            if(classNames.includes('mcbtn')) {
                let cardData = {
                    type: 'mc',
                    op: [],
                    ans: []
                };
                let question = card.getElementsByClassName('question')[0];
                if(!question) continue;
                // cardData.question = question.value;
                let answers = card.getElementsByClassName('mc-option');
                if(answers.length < 2) continue;
                for(let j = 0; j < answers.length; j++) {
                    let answer = answers[j].getElementsByClassName('mc-option-input')[0];
                    if(!answer) continue;
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
                if(answers.length < 1) continue;
                for(let j = 0; j < answers.length; j++) {
                    let answer = answers[j].getElementsByClassName('txt-answer')[0];
                    if(!answer) continue;
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
                if(!question) continue;
                // cardData.question = question.value;
                let items = card.getElementsByClassName('ranking-item');
                for(let j = 0; j < items.length; j++) {
                    let item = items[j];
                    let txt = item.getElementsByClassName('ranking-item-txt')[0];
                    if(!txt) continue;
                    cardData.ans.push(txt.dataset.html);
                }
                data[question.dataset.html] = cardData;
            }
        }
        if(Object.keys(data).length == 0) return;
        data = {
            desc: description.value,
            contnt: data
        };
        copy.draftdecks[String(Date.now())] = data;
        if(Object.keys(copy.draftdecks).length > 5) {
            let keys = Object.keys(copy.draftdecks);
            let newKeys = [];
            keys.forEach((val) => {
                newKeys.push(parseInt(val));
            })
            let min = Math.min(...newKeys);
            delete copy.draftdecks[String(min)];
        }
        copy = JSON.stringify(copy);
        await UserGateway.editUser("userdata", copy);
    }, 15_000);
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

// Importing functionality

function appendToCards(contnt) {
    let d_keys = Object.keys(contnt);
    for(let i = 0; i < d_keys.length; i++) {
        let card = contnt[d_keys[i]];
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
}

const b_modal = document.getElementById("bento-import-modal");
const q_modal = document.getElementById("quizlet-import-modal");
const g_modal = document.getElementById("gimkit-import-modal");

const b_importbtn = document.getElementById("bento-import-btn");
const b_replacename = document.getElementById("BI-replace-name");
const b_replacedesc = document.getElementById("BI-replace-desc");
const b_file = document.getElementById("BI-file");
const b_createbtn = document.getElementById("BI-createBtn");
const b_err = document.getElementById("BI-err");

const q_importbtn = document.getElementById("quizlet-import-btn");
const q_txt = document.getElementById("QI-importText");
const q_createbtn = document.getElementById("QI-createBtn");
const q_reverse = document.getElementById("QI-reverse");
const q_err = document.getElementById("QI-err");

const g_importbtn = document.getElementById("gimkit-import-btn");
const g_txt = document.getElementById("GK-importText");
const g_createbtn = document.getElementById("GK-createBtn");
const g_err = document.getElementById("GK-err");
b_importbtn.addEventListener("mousedown", () => b_modal.style.display = "block");
q_importbtn.addEventListener("mousedown", () => q_modal.style.display = "block");
g_importbtn.addEventListener("mousedown", () => g_modal.style.display = "block");

b_createbtn.addEventListener("mousedown", () => {
    let files = b_file.files;
    if(files && files[0]) {
        let file = files[0];
        if(file.type !== "text/plain") {
            console.log('failed - file type; ' + file.type);
            return;
        }
        let reader = new FileReader();
        reader.onload = (e) => {
            let content = e.target.result;
            try {
                let main = JSON.parse(content);
                if(main.name == undefined || !main.desc == undefined || !main.contnt == undefined) {
                    b_err.innerHTML = "This file seems to be corrupted, formatted incorrectly, or isn't a valid Bento deck.";
                    return;
                }
                let val_name = main.name;
                let val_desc = main.desc;
                let val_contnt = main.contnt;
                if(b_replacename.checked) name.value = val_name;
                if(b_replacedesc.checked) description.value = val_desc;
                try {
                    appendToCards(val_contnt);
                } catch(e) {
                    b_err.innerHTML = "This file seems to be corrupted, formatted incorrectly, or isn't a valid Bento deck.";
                    return;
                }
            } catch(e) {
                console.log("failed; reason:", e);
            }
        }
        reader.readAsText(file);
    }
    b_modal.style.display = "none";
});
q_createbtn.addEventListener("mousedown", () => {
    let importText = q_txt.value;
    let format = importText.split("^");
    let contnt = {};
    if(format.length == 1) {
        q_err.innerHTML = "This export doesn't seem to be formatted properly, or isn't a valid Quizlet export.";
        return;
    }
    format.pop();
    let isValid = true;
    format.forEach(card => {
        if(!isValid) return;
        const [q, ans] = card.split(">");
        if(ans == undefined) {
            q_err.innerHTML = "This export doesn't seem to be formatted properly, or isn't a valid Quizlet export.";
            isValid = false;
            return;
        }
        if(q_reverse.checked) contnt[ans] = {type: "txt", ans: q}; else contnt[q] = {type: "txt", ans};
    });
    if(!isValid) return;
    try {
        appendToCards(contnt);
    } catch(e) {
        q_err.innerHTML = "This export doesn't seem to be formatted properly, or isn't a valid Quizlet export.";
        return;
    }
    q_modal.style.display = "none";
});
g_createbtn.addEventListener("mousedown", () => {
    let importText = g_txt.value;
    let format = importText.split("\n");
    let contnt = {};
    let isValid = true;
    format.forEach(card => {
        if(!isValid) return;
        const [q, ans] = card.split("\t");
        if(ans == undefined) {
            g_err.innerHTML = "This export doesn't seem to be formatted properly, or isn't a valid Gimkit export.";
            isValid = false;
            return;
        }
        contnt[q] = {
            type: "txt",
            ans
        };
    });
    if(!isValid) return;
    try {
        appendToCards(contnt);
    } catch(e) {
        g_err.innerHTML = "This export doesn't seem to be formatted properly, or isn't a valid Gimkit export.";
        return;
    }
    g_modal.style.display = "none";
});

window.addEventListener("mousedown", (e) => {
    if(e.target === b_modal || e.target == q_modal || e.target == g_modal) {
        b_modal.style.display = "none";
        q_modal.style.display = "none";
        g_modal.style.display = "none";
    }
});
window.addEventListener("keydown", (e) => {
    if(e.target === addCard && (e.key === "Enter" || e.key === " ")) {
        newCard();
        document.querySelector(".card:last-child").scrollIntoView({ behavior: 'smooth', block: 'center' });
        const mcbtns = document.querySelectorAll(".mcbtn");
        mcbtns[mcbtns.length - 1].focus();
    }
});
