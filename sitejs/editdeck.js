import { UserGateway } from "../main/user_gateway.js";
import { DeckGateway } from "../main/deck_gateway.js";
// User
var user;
// Other objects
var mainContainer = document.getElementsByClassName("create-container")[0];
var name = document.getElementById("name");
var isPublic = document.getElementById("isPublic");
var description = document.getElementById("description");
var cardContain = document.getElementById("cardcontain");
var addCard = document.getElementById("addcard");
var createBtn = document.getElementById("create");
var cards = [];
var dragging;
var dragLine = document.createElement("div");
dragLine.style = 'display: flex; background-color: rgb(0, 150, 255); width: 100%; height: 5px;';
// Deck
let deck, deckData;

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
                    <button class='mc-option-del'>X</button>
                    <button class='mc-option-correct mc-option-sel'>C</button>
                </div>
                <div class='mc-option'>
                    <input type='input' class='mc-option-input' placeholder='...'>
                    <button class='mc-option-del'>X</button>
                    <button class='mc-option-correct mc-option-nosel'>C</button>
                </div>
                <div class='mc-option'>
                    <input type='input' class='mc-option-input' placeholder='...'>
                    <button class='mc-option-del'>X</button>
                    <button class='mc-option-correct mc-option-nosel'>C</button>
                </div>
                <div class='mc-option'>
                    <input type='input' class='mc-option-input' placeholder='...'>
                    <button class='mc-option-del'>X</button>
                    <button class='mc-option-correct mc-option-nosel'>C</button>
                </div>
            </div>
            <button class='mc-add'>+</button>
            <button class='card-del'>Delete Card</button>
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
            <button class='mc-option-del'>X</button>
            <button class='mc-option-correct mc-option-nosel'>C</button>
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
            correctBtn.className = "mc-option-correct mc-option-sel";
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
                    <button class='ranking-item-del'>X</button>
                </div>
                <div draggable='true' class='ranking-item'>
                    <input type='text' class='ranking-item-txt' placeholder='...'>
                    <button class='ranking-item-del'>X</button>
                </div>
            </div>
            <button class='rank-add'>+</button>
            <button class='card-del'>Delete Card</button>
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
            <button class='ranking-item-del'>X</button>
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
    if(!user) {
        console.log("i will find you and your family if you ever attempt this again.\n\n(to summarize, you don't seem to be logged in.)");
        return;
    }
    let newDiv = document.createElement("div");
    let n = cards.length + 1;
    newDiv.id = "c" + n;
    newDiv.className = "card";
    cardContain.appendChild(newDiv);
    cards.push(newDiv);
    initMc(newDiv, n);
}

createBtn.addEventListener("mousedown", async function() {
    if(!user) {
        console.log("i will find you and your family if you ever attempt this again.\n\n(to summarize, you don't seem to be logged in.)");
        return;
    }
    if(name.value == '') {
        console.log("i am going to find you and strangle you until you choke and suffer as you die.\n\n(to summarize - please type in a name for this deck)");
        return;
    }
    let data = [];
    for(let i = 0; i < cards.length; i++) {
        let card = cards[i];
        let type = card.getElementsByClassName('selbtn-select')[0];
        if(!type) {
            console.log("how dare you attempt to modify the html. how malevolent of you.\n\n(to summarize - the system encountered an error parsing the cards and has associated it with an unexpected change in the HTML)");
            return;
        }
        let classNames = type.className.split(" ");
        if(classNames.includes('mcbtn')) {
            let cardData = {
                question: '',
                type: 'selection',
                answers: [],
                correctAnswer: ''
            };
            let question = card.getElementsByClassName('question')[0];
            if(!question) {
                console.log("how dare you attempt to modify the html. how malevolent of you.\n\n(to summarize - the system encountered an error parsing the cards and has associated it with an unexpected change in the HTML)");
                return;
            }
            cardData.question = question.value;
            let answers = card.getElementsByClassName('mc-option');
            if(answers.length < 2) {
                console.log("how dare you attempt to modify the html. how malevolent of you.\n\n(to summarize - the system encountered an error parsing the cards and has associated it with an unexpected change in the HTML)");
                return;
            }
            for(let j = 0; j < answers.length; j++) {
                let answer = answers[j].getElementsByClassName('mc-option-input')[0];
                if(!answer) {
                    console.log("how dare you attempt to modify the html. how malevolent of you.\n\n(to summarize - the system encountered an error parsing the cards and has associated it with an unexpected change in the HTML)");
                    return;
                }
                cardData.answers.push(answer.value);
                let isCorrect = answers[j].getElementsByClassName('mc-option-sel');
                if(isCorrect.length > 0) {
                    cardData.correctAnswer = answer.value;
                }
            }
            data.push(cardData);
        } else if(classNames.includes('txtbtn')) {
            let cardData = {
                question: '',
                type: 'input',
                correctAnswer: ''
            };
            let question = card.getElementsByClassName('question')[0];
            let answer = card.getElementsByClassName('txt-answer')[0];
            if(!question || !answer) {
                console.log("how dare you attempt to modify the html. how malevolent of you.\n\n(to summarize - the system encountered an error parsing the cards and has associated it with an unexpected change in the HTML)");
                return;
            }
            cardData.question = question.value;
            cardData.correctAnswer = answer.value;
            data.push(cardData);
        } else if(classNames.includes('rankbtn')) {
            let cardData = {
                question: '',
                type: 'ranking',
                answer: []
            };
            let question = card.getElementsByClassName('question')[0];
            if(!question) {
                console.log("how dare you attempt to modify the html. how malevolent of you.\n\n(to summarize - the system encountered an error parsing the cards and has associated it with an unexpected change in the HTML)");
                return;
            }
            cardData.question = question.value;
            let items = card.getElementsByClassName('ranking-item');
            for(let j = 0; j < items.length; j++) {
                let item = items[j];
                let txt = item.getElementsByClassName('ranking-item-txt')[0];
                if(!txt) {
                    console.log("how dare you attempt to modify the html. how malevolent of you.\n\n(to summarize - the system encountered an error parsing the cards and has associated it with an unexpected change in the HTML)");
                    return;
                }
                cardData.answer.push(txt.value);
            }
            data.push(cardData);
        }
    }
    data = {
        description: description.value,
        deckData: data
    };
    // console.log(name.value, JSON.stringify(data), isPublic.checked);
    let res1 = await DeckGateway.modify(deck, "name", name.value);
    let res2 = await DeckGateway.modify(deck, "public", isPublic.checked ? "1" : "0");
    let res3 = await DeckGateway.modify(deck, "data", JSON.stringify(data));
    if(res1[0] && res2[0] && res3[0]) {
        window.location.href = "/home";
    }
});

addCard.addEventListener("mousedown", newCard);

(async () => {
    let [success, data] = await UserGateway.getuser();
    if(!success && data == 'no session') {
        console.log("You're not logged in.");
        mainContainer.remove();
        return;
    }    
    let a = location.href;
    if(a.indexOf("?") < 0) {
        console.log("Looks like there was an error. Go back to where you came from, and try again. If you continue to experience errors, please contact either Bitfeller or Valley.");
        mainContainer.remove();
        return;
    }
    user = data;
    let paramList = a.substring(a.indexOf("?") + 1).split("&");
    let params = {};
    paramList.forEach((val) => {let _ = val.split("="); params[_[0]] = _[1];});
    if(!params['d']) {
        console.log("Looks like there was an error. Go back to where you came from, and try again. If you continue to experience errors, please contact either Bitfeller or Valley.");
        mainContainer.remove();
        return;
    }
    let dVal = parseInt(params['d']);
    deck = dVal;
    [success, deckData] = await DeckGateway.get(deck);
    if(!success) return;
    name.value = deckData.name;
    isPublic.checked = deckData.public;
    description.value = deckData.data.description;
    for(let i = 0; i < deckData.data.deckData.length; i++) {
        let card = deckData.data.deckData[i];
        let newDiv = document.createElement("div");
        let n = cards.length + 1;
        newDiv.id = "c" + n;
        newDiv.className = "card";
        cardContain.appendChild(newDiv);
        cards.push(newDiv);
        switch(card.type) {
            case "selection":
                initMc(newDiv, n);
                newDiv.getElementsByClassName('question')[0].value = card.question;
                let cardmc = newDiv.getElementsByClassName('card-mc')[0];
                cardmc.innerHTML = "";
                for(let i = 0; i < card.answers.length; i++) {
                    let newOp = document.createElement("div");
                    newOp.className = "mc-option";
                    newOp.innerHTML = `
                        <input type='input' class='mc-option-input' placeholder='...' value='${card.answers[i]}'>
                        <button class='mc-option-del'>X</button>
                        <button class='mc-option-correct ${card.correctAnswer == card.answers[i] ? 'mc-option-sel' : 'mc-option-nosel'}'>C</button>
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
            case "input":
                initTxt(newDiv, n);
                newDiv.getElementsByClassName('question')[0].value = card.question;
                newDiv.getElementsByClassName('txt-answer')[0].value = card.correctAnswer;
            break;
            case "ranking":
                initRanking(newDiv, n);
                newDiv.getElementsByClassName('question')[0].value = card.question;
                let rankingList = newDiv.getElementsByClassName("ranking-list")[0];
                rankingList.innerHTML = '';
                for(let i = 0; i < card.answer.length; i++) {
                    let item = document.createElement("div");
                    item.className = 'ranking-item';
                    item.setAttribute("draggable", true);
                    item.innerHTML = `
                        <input type='text' class='ranking-item-txt' placeholder='...' value='${card.answer[i]}'>
                        <button class='ranking-item-del'>X</button>
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
    newCard();
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