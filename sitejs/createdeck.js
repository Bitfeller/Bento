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
let draftdecks_save;
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
function initMc(newDiv, n) {
    newDiv.innerHTML = `
        <div class='card-sel'>
            <button class='mcbtn selbtn selbtn-select'>Multiple Choice</button>
            <button class='txtbtn selbtn selbtn-noselect'>Text</button>
            <button class='rankbtn selbtn selbtn-noselect'>Ranking</button>
        </div>
        <div class='card-main'>
            Question: <input type='input' class='question' placeholder='The question...'><br>
            <div class='card-mc'>
                <div class='mc-option'>
                    <input type='input' class='mc-option-input' placeholder='...'>
                    <button class='mc-option-del'><span class='material-symbols-outlined'>close</span></button>
                    <button class='mc-option-correct mc-option-sel'><span class='material-symbols-outlined'>check</span></button>
                </div>
                <div class='mc-option'>
                    <input type='input' class='mc-option-input' placeholder='...'>
                    <button class='mc-option-del'><span class='material-symbols-outlined'>close</span></button>
                    <button class='mc-option-correct mc-option-nosel'><span class="material-symbols-outlined">check_indeterminate_small</span></button>
                </div>
                <div class='mc-option'>
                    <input type='input' class='mc-option-input' placeholder='...'>
                    <button class='mc-option-del'><span class='material-symbols-outlined'>close</span></button>
                    <button class='mc-option-correct mc-option-nosel'><span class="material-symbols-outlined">check_indeterminate_small</span></button>
                </div>
                <div class='mc-option'>
                    <input type='input' class='mc-option-input' placeholder='...'>
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
        initTxt(newDiv, n);
    });
    newDiv.getElementsByClassName('rankbtn')[0].addEventListener("mousedown", function() {
        initRanking(newDiv, n);
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
            <input type='input' class='mc-option-input' placeholder='...'>
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
function initTxt(newDiv, n) {
    newDiv.innerHTML = `
        <div class='card-sel'>
            <button class='mcbtn selbtn selbtn-noselect'>Multiple Choice</button>
            <button class='txtbtn selbtn selbtn-select'>Text</button>
            <button class='rankbtn selbtn selbtn-noselect'>Ranking</button>
        </div>
        <div class='card-main'>
            Question: <input type='input' class='question' placeholder='The question...'><br>
            Answer: <input type='input' class='txt-answer' placeholder='...'>
        </div>
        <button class='card-del'>Delete Card</button>
        <div class='deck-divider'></div>
    `;
    // Set up selector
    newDiv.getElementsByClassName('mcbtn')[0].addEventListener("mousedown", function() {
        initMc(newDiv, n);
    });
    newDiv.getElementsByClassName('rankbtn')[0].addEventListener("mousedown", function() {
        initRanking(newDiv, n);
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
function initRanking(newDiv, n) {
    newDiv.innerHTML = `
        <div class='card-sel'>
            <button class='mcbtn selbtn selbtn-noselect'>Multiple Choice</button>
            <button class='txtbtn selbtn selbtn-noselect'>Text</button>
            <button class='rankbtn selbtn selbtn-select'>Ranking</button>
        </div>
        <div class='card-main'>
            Question: <input type='input' class='question' placeholder='The question...'><br>
            <div class='card-rank ranking-list'>
                <div draggable='true' class='ranking-item'>
                    <input type='text' class='ranking-item-txt' placeholder='...'>
                    <button class='ranking-item-del'><span class='material-symbols-outlined'>close</span></button>
                </div>
                <div draggable='true' class='ranking-item'>
                    <input type='text' class='ranking-item-txt' placeholder='...'>
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
        initMc(newDiv, n);
    });
    newDiv.getElementsByClassName('txtbtn')[0].addEventListener("mousedown", function() {
        initTxt(newDiv, n);
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
            <input type='text' class='ranking-item-txt' placeholder='...'>
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
    if(!user) {
        errmsg.innerHTML = "Looks like you're not logged in! We can't create this deck unless you log in again. (If you'd like, open another tab and login there.)";
        return;
    }
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
                cardData.op.push(formatter(answer.value));
                let isCorrect = answers[j].getElementsByClassName('mc-option-sel');
                if(isCorrect.length > 0) {
                    cardData.ans = formatter(answer.value);
                }
            }
            data[formatter(question.value)] = cardData;
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
            cardData.ans = formatter(answer.value);
            data[formatter(question.value)] = cardData;
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
            // cardData.question = question.value;
            let items = card.getElementsByClassName('ranking-item');
            for(let j = 0; j < items.length; j++) {
                let item = items[j];
                let txt = item.getElementsByClassName('ranking-item-txt')[0];
                if(!txt) {
                    errmsg.innerHTML = "The system encountered an error parsing the cards and has associated it with an unexpected change in the HTML.";
                    return;
                }
                cardData.ans.push(formatter(txt.value));
            }
            data[formatter(question.value)] = cardData;
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
                errmsg.innerHTML = "That name has invalid characters. (Valid characters include dashes, a-z, A-Z, and 0-9)";
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
    draftdecks_save = user.draftdecks;
    let keys = Object.keys(user.draftdecks);
    if(keys.length > 0) draftdecks_history.innerHTML = "";
    for(let i = 0; i < keys.length; i++) {
        let time = parseInt(keys[i]);
        let diff = Date.now() - time;
        let deck = user.draftdecks[keys[i]];
        let div = document.createElement("div");
        div.className = "draftdeck";
        div.innerHTML = `
            <p>${diff > 2 * 24 * 60 * 60 * 1000 ? "Older Than Yesterday" : (diff > 24 * 60 * 60 * 1000 ? "Yesterday" : (diff > 12 * 60 * 60 * 1000 ? "Within 24 Hours" : (diff > 60 * 60 * 1000 ? "Within 12 Hours" : "This Hour")))}</p>
            <button class='show'><span class="material-symbols-outlined">save</span></button>
            <button class='del'><span class="material-symbols-outlined">delete</span></button>`;
        draftdecks_history.appendChild(div);
        div.getElementsByClassName("show")[0].addEventListener("mousedown", () => {
            cardContain.innerHTML = "";
            cards = [];
            appendToCards(deck.contnt);
        });
        div.getElementsByClassName("del")[0].addEventListener("mousedown", async () => {
            div.remove();
            delete user.draftdecks[keys[i]];
            delete draftdecks_save[keys[i]];
            let copy = JSON.stringify(draftdecks_save);
            await UserGateway.editUser("draftdecks", copy);
        });
    }
    window.setInterval(async () => {
        let copy = structuredClone(draftdecks_save);
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
                    ans: ''
                };
                let question = card.getElementsByClassName('question')[0];
                if(!question) continue;
                // cardData.question = question.value;
                let answers = card.getElementsByClassName('mc-option');
                if(answers.length < 2) continue;
                for(let j = 0; j < answers.length; j++) {
                    let answer = answers[j].getElementsByClassName('mc-option-input')[0];
                    if(!answer) continue;
                    cardData.op.push(formatter(answer.value));
                    let isCorrect = answers[j].getElementsByClassName('mc-option-sel');
                    if(isCorrect.length > 0) {
                        cardData.ans = formatter(answer.value);
                    }
                }
                data[formatter(question.value)] = cardData;
            } else if(classNames.includes('txtbtn')) {
                let cardData = {
                    type: 'txt',
                    ans: ''
                };
                let question = card.getElementsByClassName('question')[0];
                let answer = card.getElementsByClassName('txt-answer')[0];
                if(!question || !answer) continue;
                cardData.ans = formatter(answer.value);
                data[formatter(question.value)] = cardData;
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
                    cardData.ans.push(formatter(txt.value));
                }
                data[formatter(question.value)] = cardData;
            }
        }
        if(Object.keys(data).length == 0) return;
        data = {
            desc: description.value,
            contnt: data
        };
        copy[String(Date.now())] = data;
        if(Object.keys(copy).length > 5) {
            let keys = Object.keys(copy);
            let newKeys = [];
            keys.forEach((val) => {
                newKeys.push(parseInt(val));
            })
            let min = Math.min(...newKeys);
            delete copy[String(min)];
        }
        copy = JSON.stringify(copy);
        await UserGateway.editUser("draftdecks", copy);
    }, 15_000);
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
                newDiv.getElementsByClassName('question')[0].value = backwards_formatter(q);
                let cardmc = newDiv.getElementsByClassName('card-mc')[0];
                cardmc.innerHTML = "";
                for(let i = 0; i < card.op.length; i++) {
                    let newOp = document.createElement("div");
                    newOp.className = "mc-option";
                    newOp.innerHTML = `
                        <input type='input' class='mc-option-input' placeholder='...' value='${backwards_formatter(card.op[i])}'>
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
                newDiv.getElementsByClassName('question')[0].value = backwards_formatter(q);
                newDiv.getElementsByClassName('txt-answer')[0].value = backwards_formatter(card.ans);
            break;
            case "ranking":
                initRanking(newDiv, n);
                newDiv.getElementsByClassName('question')[0].value = backwards_formatter(q);
                let rankingList = newDiv.getElementsByClassName("ranking-list")[0];
                rankingList.innerHTML = '';
                for(let i = 0; i < card.ans.length; i++) {
                    let item = document.createElement("div");
                    item.className = 'ranking-item';
                    item.setAttribute("draggable", true);
                    item.innerHTML = `
                        <input type='text' class='ranking-item-txt' placeholder='...' value='${backwards_formatter(card.ans[i])}'>
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
}

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

const g_importbtn = document.getElementById("gimkit-import-btn");
const g_txt = document.getElementById("GK-importText");
const g_createbtn = document.getElementById("GK-createBtn");

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
                let val_name = main.name;
                let val_desc = main.desc;
                let val_contnt = main.contnt;
                if(b_replacename.checked) name.value = val_name;
                if(b_replacedesc.checked) description.value = val_desc;
                appendToCards(val_contnt);
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
    format.pop();
    format.forEach(card => {
        const [q, ans] = card.split(">");
        contnt[q] = {
            type: "txt",
            ans
        };
    });
    appendToCards(contnt);
    q_modal.style.display = "none";
});
g_createbtn.addEventListener("mousedown", () => {
    let importText = g_txt.value;
    let format = importText.split("\n");
    let contnt = {};
    format.forEach(card => {
        const [q, ans] = card.split("\t");
        contnt[q] = {
            type: "txt",
            ans
        };
    });
    appendToCards(contnt);
    g_modal.style.display = "none";
});

window.addEventListener("mousedown", (e) => {
    if(e.target === b_modal || e.target == q_modal || e.target == g_modal) {
        b_modal.style.display = "none";
        q_modal.style.display = "none";
        g_modal.style.display = "none";
    }
});