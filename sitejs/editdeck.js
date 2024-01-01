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
function initMc(newDiv, n, q) {
    newDiv.innerHTML = `
        <div class='card-sel'>
            <button class='mcbtn selbtn selbtn-select'>Multiple Choice</button>
            <button class='txtbtn selbtn selbtn-noselect'>Text</button>
            <button class='rankbtn selbtn selbtn-noselect'>Ranking</button>
        </div>
        <div class='card-main'>
            Question: <div contenteditable="true" type='input' class='question' placeholder='The question...'>${q ?? ""}</div><br>
            <div class='card-mc'>
                <div class='mc-option'>
                    <div contenteditable="true" type='input' class='mc-option-input' placeholder='...'></div>
                    <button class='mc-option-del'><span class='material-symbols-outlined'>close</span></button>
                    <button class='mc-option-correct mc-option-sel'><span class='material-symbols-outlined'>check</span></button>
                </div>
                <div class='mc-option'>
                    <div contenteditable="true" type='input' class='mc-option-input' placeholder='...'></div>
                    <button class='mc-option-del'><span class='material-symbols-outlined'>close</span></button>
                    <button class='mc-option-correct mc-option-nosel'><span class="material-symbols-outlined">check_indeterminate_small</span></button>
                </div>
                <div class='mc-option'>
                    <div contenteditable="true" type='input' class='mc-option-input' placeholder='...'></div>
                    <button class='mc-option-del'><span class='material-symbols-outlined'>close</span></button>
                    <button class='mc-option-correct mc-option-nosel'><span class="material-symbols-outlined">check_indeterminate_small</span></button>
                </div>
                <div class='mc-option'>
                    <div contenteditable="true" type='input' class='mc-option-input' placeholder='...'></div>
                    <button class='mc-option-del'><span class='material-symbols-outlined'>close</span></button>
                    <button class='mc-option-correct mc-option-nosel'><span class="material-symbols-outlined">check_indeterminate_small</span></button>
                </div>
            </div>
            <button class='mc-add'>+</button>
            <button class='card-del'>Delete Card</button>
            <div class='deck-divider'></div>
        </div>
    `;
    // Set up selector
    newDiv.getElementsByClassName('txtbtn')[0].addEventListener("mousedown", function() {
        initTxt(newDiv, n, newDiv.getElementsByClassName("question")[0].innerHTML);
    });
    newDiv.getElementsByClassName('rankbtn')[0].addEventListener("mousedown", function() {
        initRanking(newDiv, n, newDiv.getElementsByClassName("question")[0].innerHTML);
    });
    newDiv.getElementsByClassName('card-del')[0].addEventListener("mousedown", function() {
        if(cards.length <= 1) return;
        let idx = cards.indexOf(newDiv);
        if(idx > -1) {
            cards.splice(idx, 1);
        }
        newDiv.remove();
    });
    // Set up multiple choice card functionality
    let cardmc = newDiv.getElementsByClassName('card-mc')[0];
    let addBtn = newDiv.getElementsByClassName('mc-add')[0];
    addBtn.addEventListener("mousedown", function() {
        let newOp = document.createElement("div");
        newOp.className = "mc-option";
        newOp.innerHTML = `
            <div contenteditable="true" type='input' class='mc-option-input' placeholder='...'></div>
            <button class='mc-option-del'><span class='material-symbols-outlined'>close</span></button>
            <button class='mc-option-correct mc-option-nosel'><span class="material-symbols-outlined">check_indeterminate_small</span></button>
        `;
        cardmc.appendChild(newOp);
        let delBtn = newOp.getElementsByClassName("mc-option-del")[0];
        let correctBtn = newOp.getElementsByClassName("mc-option-correct")[0];
        delBtn.addEventListener("mousedown", function() {
            if(cardmc.getElementsByClassName('mc-option').length <= 2) {
                return;
            }
            if(newOp.getElementsByClassName("mc-option-sel").length > 0) {
                // get random option to assign to
                let newCorrect = cardmc.getElementsByClassName("mc-option-nosel")[0];
                newCorrect.className = "mc-option-correct mc-option-sel";
            }
            newOp.remove();
        });
        correctBtn.addEventListener("mousedown", function() {
            let current = cardmc.getElementsByClassName("mc-option-sel")[0];
            current.className = "mc-option-correct mc-option-nosel";
            current.innerHTML = `<span class="material-symbols-outlined">check_indeterminate_small</span>`;
            correctBtn.className = "mc-option-correct mc-option-sel";
            correctBtn.innerHTML = "<span class='material-symbols-outlined'>check</span>";
        });
    });
    let ops = cardmc.getElementsByClassName("mc-option");
    for(let i = 0; i < ops.length; i++) {
        let div = ops[i];
        let delBtn = div.getElementsByClassName("mc-option-del")[0];
        let correctBtn = div.getElementsByClassName("mc-option-correct")[0];
        delBtn.addEventListener("mousedown", function() {
            if(cardmc.getElementsByClassName('mc-option').length <= 2) {
                return;
            }
            if(div.getElementsByClassName("mc-option-sel").length > 0) {
                // get random option to assign to
                let newCorrect = cardmc.getElementsByClassName("mc-option-nosel")[0];
                newCorrect.className = "mc-option-correct mc-option-sel";
            }
            div.remove();
        });
        correctBtn.addEventListener("mousedown", function() {
            let current = cardmc.getElementsByClassName("mc-option-sel")[0];
            current.className = "mc-option-correct mc-option-nosel";
            current.innerHTML = `<span class="material-symbols-outlined">check_indeterminate_small</span>`;
            correctBtn.className = "mc-option-correct mc-option-sel";
            correctBtn.innerHTML = "<span class='material-symbols-outlined'>check</span>";
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
            Question: <div contenteditable="true" type='input' class='question' placeholder='The question...'>${q ?? ""}</div><br>
            Answer: <div contenteditable="true" type='input' class='txt-answer' placeholder='...'></div>
        </div>
        <button class='card-del'>Delete Card</button>
        <div class='deck-divider'></div>
    `;
    // Set up selector
    newDiv.getElementsByClassName('mcbtn')[0].addEventListener("mousedown", function() {
        initMc(newDiv, n, newDiv.getElementsByClassName("question")[0].innerHTML);
    });
    newDiv.getElementsByClassName('rankbtn')[0].addEventListener("mousedown", function() {
        initRanking(newDiv, n, newDiv.getElementsByClassName("question")[0].innerHTML);
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
function initRanking(newDiv, n, q) {
    newDiv.innerHTML = `
        <div class='card-sel'>
            <button class='mcbtn selbtn selbtn-noselect'>Multiple Choice</button>
            <button class='txtbtn selbtn selbtn-noselect'>Text</button>
            <button class='rankbtn selbtn selbtn-select'>Ranking</button>
        </div>
        <div class='card-main'>
            Question: <div contenteditable="true" type='input' class='question' placeholder='The question...'>${q ?? ""}</div><br>
            <div class='card-rank ranking-list'>
                <div draggable='true' class='ranking-item'>
                    <div contenteditable="true" type='text' class='ranking-item-txt' placeholder='...'></div>
                    <button class='ranking-item-del'><span class='material-symbols-outlined'>close</span></button>
                </div>
                <div draggable='true' class='ranking-item'>
                    <div contenteditable="true" type='text' class='ranking-item-txt' placeholder='...'></div>
                    <button class='ranking-item-del'><span class='material-symbols-outlined'>close</span></button>
                </div>
            </div>
            <button class='rank-add'>+</button>
            <button class='card-del'>Delete Card</button>
            <div class='deck-divider'></div>
        </div>
    `;
    // Set up selector
    newDiv.getElementsByClassName('mcbtn')[0].addEventListener("mousedown", function() {
        initMc(newDiv, n, newDiv.getElementsByClassName("question")[0].innerHTML);
    });
    newDiv.getElementsByClassName('txtbtn')[0].addEventListener("mousedown", function() {
        initTxt(newDiv, n, newDiv.getElementsByClassName("question")[0].innerHTML);
    });
    newDiv.getElementsByClassName('card-del')[0].addEventListener("mousedown", function() {
        if(cards.length <= 1) return;
        let idx = cards.indexOf(newDiv);
        if(idx > -1) {
            cards.splice(idx, 1);
        }
        newDiv.remove();
    });
    // Set up ranking card functionality
    let rankingList = newDiv.getElementsByClassName('ranking-list')[0];
    let addBtn = newDiv.getElementsByClassName('rank-add')[0];
    addBtn.addEventListener("mousedown", function() {
        let item = document.createElement("div");
        item.className = 'ranking-item';
        item.setAttribute("draggable", true);
        item.innerHTML = `
            <div contenteditable="true" type='text' class='ranking-item-txt' placeholder='...'></div>
            <button class='ranking-item-del'><span class='material-symbols-outlined'>close</span></button>
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
            const objects = rankingList.getElementsByClassName('ranking-item');
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
        let del = item.getElementsByClassName('ranking-item-del')[0];
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
            const objects = rankingList.getElementsByClassName('ranking-item');
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
        let del = obj.getElementsByClassName('ranking-item-del')[0];
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
})

function formatter(str) {
    return str
        .replaceAll("_1", "\u2081")
        .replaceAll("_2", "\u2082")
        .replaceAll("_3", "\u2083")
        .replaceAll("_4", "\u2084")
        .replaceAll("_5", "\u2085")
        .replaceAll("_6", "\u2086")
        .replaceAll("_7", "\u2087")
        .replaceAll("_8", "\u2088")
        .replaceAll("_9", "\u2089")
        .replaceAll("_0", "\u2080")
        .replaceAll("^1", "\u00B9")
        .replaceAll("^2", "\u00B2")
        .replaceAll("^3", "\u00B3")
        .replaceAll("^4", "\u2074")
        .replaceAll("^5", "\u2075")
        .replaceAll("^6", "\u2076")
        .replaceAll("^7", "\u2077")
        .replaceAll("^8", "\u2078")
        .replaceAll("^9", "\u2079")
        .replaceAll("^0", "\u2070")
        .replaceAll("^+", "\u207A")
        .replaceAll("^-", "\u207B");
}
function backwards_formatter(str) {
    return str
        .replaceAll("\u2081", "_1")
        .replaceAll("\u2082", "_2")
        .replaceAll("\u2083", "_3")
        .replaceAll("\u2084", "_4")
        .replaceAll("\u2085", "_5")
        .replaceAll("\u2086", "_6")
        .replaceAll("\u2087", "_7")
        .replaceAll("\u2088", "_8")
        .replaceAll("\u2089", "_9")
        .replaceAll("\u2080", "_0")
        .replaceAll("\u00B9", "^1")
        .replaceAll("\u00B2", "^2")
        .replaceAll("\u00B3", "^3")
        .replaceAll("\u2074", "^4")
        .replaceAll("\u2075", "^5")
        .replaceAll("\u2076", "^6")
        .replaceAll("\u2077", "^7")
        .replaceAll("\u2078", "^8")
        .replaceAll("\u2079", "^9")
        .replaceAll("\u2070", "^0")
        .replaceAll("\u207A", "^+")
        .replaceAll("\u207B", "^-");
}

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
                ans: ''
            };
            let question = card.getElementsByClassName('question')[0];
            if(!question) {
                errmsg.innerHTML = "The system encountered an error parsing the cards and has associated it with an unexpected change in the HTML.";
                return;
            }
            // cardData.question = question.value;
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
                cardData.op.push(formatter(answer.innerHTML));
                let isCorrect = answers[j].getElementsByClassName('mc-option-sel');
                if(isCorrect.length > 0) {
                    cardData.ans = formatter(answer.innerHTML);
                }
            }
            data[formatter(question.innerHTML)] = cardData;
        } else if(classNames.includes('txtbtn')) {
            let cardData = {
                type: 'txt',
                ans: ''
            };
            let question = card.getElementsByClassName('question')[0];
            let answer = card.getElementsByClassName('txt-answer')[0];
            if(!question || !answer) {
                errmsg.innerHTML = "The system encountered an error parsing the cards and has associated it with an unexpected change in the HTML.";
                return;
            }
            cardData.ans = formatter(answer.innerHTML);
            data[formatter(question.innerHTML)] = cardData;
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
            // cardData.question = question.innerHTML;
            let items = card.getElementsByClassName('ranking-item');
            for(let j = 0; j < items.length; j++) {
                let item = items[j];
                let txt = item.getElementsByClassName('ranking-item-txt')[0];
                if(!txt) {
                    errmsg.innerHTML = "The system encountered an error parsing the cards and has associated it with an unexpected change in the HTML.";
                    return;
                }
                cardData.ans.push(formatter(txt.innerHTML));
            }
            data[formatter(question.innerHTML)] = cardData;
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
                newDiv.getElementsByClassName('question')[0].innerHTML = backwards_formatter(q);
                let cardmc = newDiv.getElementsByClassName('card-mc')[0];
                cardmc.innerHTML = "";
                for(let i = 0; i < card.op.length; i++) {
                    let newOp = document.createElement("div");
                    newOp.className = "mc-option";
                    newOp.innerHTML = `
                        <div contenteditable="true" type='input' class='mc-option-input' placeholder='...'>${backwards_formatter(card.op[i])}</div>
                        <button class='mc-option-del'><span class='material-symbols-outlined'>close</span></button>
                        <button class='mc-option-correct ${card.ans == card.op[i] ? 'mc-option-sel' : 'mc-option-nosel'}'>${card.ans == card.op[i] ? '<span class="material-symbols-outlined">check</span>' : '<span class="material-symbols-outlined">check_indeterminate_small</span>'}</button>
                    `;
                    cardmc.appendChild(newOp);
                    let delBtn = newOp.getElementsByClassName("mc-option-del")[0];
                    let correctBtn = newOp.getElementsByClassName("mc-option-correct")[0];
                    delBtn.addEventListener("mousedown", function() {
                        if(cardmc.getElementsByClassName('mc-option').length <= 2) {
                            return;
                        }
                        if(newOp.getElementsByClassName("mc-option-sel").length > 0) {
                            // get random option to assign to
                            let newCorrect = cardmc.getElementsByClassName("mc-option-nosel")[0];
                            newCorrect.className = "mc-option-correct mc-option-sel";
                        }
                        newOp.remove();
                    });
                    correctBtn.addEventListener("mousedown", function() {
                        let current = cardmc.getElementsByClassName("mc-option-sel")[0];
                        current.className = "mc-option-correct mc-option-nosel";
                        correctBtn.className = "mc-option-correct mc-option-sel";
                    });
                }
            break;
            case "txt":
                initTxt(newDiv, n);
                newDiv.getElementsByClassName('question')[0].innerHTML = backwards_formatter(q);
                newDiv.getElementsByClassName('txt-answer')[0].innerHTML = backwards_formatter(card.ans);
            break;
            case "ranking":
                initRanking(newDiv, n);
                newDiv.getElementsByClassName('question')[0].innerHTML = backwards_formatter(q);
                let rankingList = newDiv.getElementsByClassName("ranking-list")[0];
                rankingList.innerHTML = '';
                for(let i = 0; i < card.ans.length; i++) {
                    let item = document.createElement("div");
                    item.className = 'ranking-item';
                    item.setAttribute("draggable", true);
                    item.innerHTML = `
                        <div contenteditable="true" type='text' class='ranking-item-txt' placeholder='...'>${backwards_formatter(card.ans[i])}</div>
                        <button class='ranking-item-del'><span class='material-symbols-outlined'>close</span></button>
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
                        const objects = rankingList.getElementsByClassName('ranking-item');
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
                    let del = item.getElementsByClassName('ranking-item-del')[0];
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
