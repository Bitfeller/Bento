import { DeckGateway } from "../main/deck_gateway.js";
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

function computeCenter(el) {
    var rect = el.getBoundingClientRect();
    return {
        x: (rect.left + rect.right) / 2 + scrollX,
        y: (rect.top + rect.bottom) / 2 + scrollY
    }
}
function initMc(newDiv, n) {
    newDiv.innerHTML = `
        <div id='c${n}-s' class='card-sel'>
            <button id='c${n}-s-1' class='mcbtn selbtn selbtn-select'>Multiple Choice</button>
            <button id='c${n}-s-2' class='txtbtn selbtn selbtn-noselect'>Text</button>
            <button id='c${n}-s-3' class='rankbtn selbtn selbtn-noselect'>Ranking</button>
        </div>
        <div id='c${n}-h' class='card-main'>
            Question: <input type='input' id='c${n}-h-p' class='question' placeholder='The question...'><br>
            <div id='c${n}-h-b' class='card-mc'>
                <div id='c${n}-h-b-a' class='mc-option'>
                    <input type='input' id='c${n}-h-b-a-i' class='mc-option-input' placeholder='...'>
                    <button id='c${n}-h-b-a-d' class='mc-option-del'>X</button>
                    <button id='c${n}-h-b-a-c' class='mc-option-correct mc-option-sel'>C</button>
                </div>
                <div id='c${n}-h-b-a' class='mc-option'>
                    <input type='input' id='c${n}-h-b-a-i' class='mc-option-input' placeholder='...'>
                    <button id='c${n}-h-b-a-d' class='mc-option-del'>X</button>
                    <button id='c${n}-h-b-a-c' class='mc-option-correct mc-option-nosel'>C</button>
                </div>
                <div id='c${n}-h-b-a' class='mc-option'>
                    <input type='input' id='c${n}-h-b-a-i' class='mc-option-input' placeholder='...'>
                    <button id='c${n}-h-b-a-d' class='mc-option-del'>X</button>
                    <button id='c${n}-h-b-a-c' class='mc-option-correct mc-option-nosel'>C</button>
                </div>
                <div id='c${n}-h-b-a' class='mc-option'>
                    <input type='input' id='c${n}-h-b-a-i' class='mc-option-input' placeholder='...'>
                    <button id='c${n}-h-b-a-d' class='mc-option-del'>X</button>
                    <button id='c${n}-h-b-a-c' class='mc-option-correct mc-option-nosel'>C</button>
                </div>
            </div>
            <button id='c${n}-h-b-add' class='mc-add'>+</button>
        </div>
        <button id='c${n}-del' class='card-del'>Delete Card</button>
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
        var idx = cards.indexOf(newDiv);
        if(idx > -1) {
            cards.splice(idx, 1);
        }
        newDiv.remove();
    });
    // Set up multiple choice card functionality
    var cardmc = newDiv.getElementsByClassName('card-mc')[0];
    var addBtn = newDiv.getElementsByClassName('mc-add')[0];
    addBtn.addEventListener("mousedown", function() {
        var newOp = document.createElement("div");
        newOp.className = "mc-option";
        newOp.innerHTML = `
            <input type='input' class='mc-option-input' placeholder='...'>
            <button class='mc-option-del'>X</button>
            <button class='mc-option-correct mc-option-nosel'>C</button>
        `;
        cardmc.appendChild(newOp);
        var delBtn = newOp.getElementsByClassName("mc-option-del")[0];
        var correctBtn = newOp.getElementsByClassName("mc-option-correct")[0];
        delBtn.addEventListener("mousedown", function() {
            if(cardmc.getElementsByClassName('mc-option').length <= 2) {
                return;
            }
            if(newOp.getElementsByClassName("mc-option-sel").length > 0) {
                // get random option to assign to
                var newCorrect = cardmc.getElementsByClassName("mc-option-nosel")[0];
                newCorrect.className = "mc-option-correct mc-option-sel";
            }
            newOp.remove();
        });
        correctBtn.addEventListener("mousedown", function() {
            var current = cardmc.getElementsByClassName("mc-option-sel")[0];
            current.className = "mc-option-correct mc-option-nosel";
            correctBtn.className = "mc-option-correct mc-option-sel";
        });
    });
    var ops = cardmc.getElementsByClassName("mc-option");
    for(var i = 0; i < ops.length; i++) {
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
            var current = cardmc.getElementsByClassName("mc-option-sel")[0];
            current.className = "mc-option-correct mc-option-nosel";
            correctBtn.className = "mc-option-correct mc-option-sel";
        });
    }
}
function initTxt(newDiv, n) {
    newDiv.innerHTML = `
        <div id='c${n}-s' class='card-sel'>
            <button id='c${n}-s-1' class='mcbtn selbtn selbtn-noselect'>Multiple Choice</button>
            <button id='c${n}-s-2' class='txtbtn selbtn selbtn-select'>Text</button>
            <button id='c${n}-s-3' class='rankbtn selbtn selbtn-noselect'>Ranking</button>
        </div>
        <div id='c${n}-h' class='card-main'>
            Question: <input type='input' id='c${n}-h-p' class='question' placeholder='The question...'><br>
            Answer: <input type='input' id='c${n}-h-a' class='txt-answer' placeholder='...'>
        </div>
        <button id='c${n}-del' class='card-del'>Delete Card</button>
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
        var idx = cards.indexOf(newDiv);
        if(idx > -1) {
            cards.splice(idx, 1);
        }
        newDiv.remove();
    });
}
function initRanking(newDiv, n) {
    newDiv.innerHTML = `
        <div id='c${n}-s' class='card-sel'>
            <button id='c${n}-s-1' class='mcbtn selbtn selbtn-noselect'>Multiple Choice</button>
            <button id='c${n}-s-2' class='txtbtn selbtn selbtn-noselect'>Text</button>
            <button id='c${n}-s-3' class='rankbtn selbtn selbtn-select'>Ranking</button>
        </div>
        <div id='c${n}-h' class='card-main'>
            Question: <input type='input' id='c${n}-h-p' class='question' placeholder='The question...'><br>
            <div id='c${n}-h-r' class='card-rank ranking-list'>
                <div id='c${n}-h-r-e' draggable='true' class='ranking-item'>
                    <input type='text' id='c${n}-h-r-e-i' class='ranking-item-txt' placeholder='...'>
                    <button id='c${n}-h-r-e-d' class='ranking-item-del'>X</button>
                </div>
                <div id='c${n}-h-r-e' draggable='true' class='ranking-item'>
                    <input type='text' id='c${n}-h-r-e-i' class='ranking-item-txt' placeholder='...'>
                    <button id='c${n}-h-r-e-d' class='ranking-item-del'>X</button>
                </div>
            </div>
            <button id='c${n}-h-add' class='rank-add'>+</button>
        </div>
        <button id='c${n}-del' class='card-del'>Delete Card</button>
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
        var idx = cards.indexOf(newDiv);
        if(idx > -1) {
            cards.splice(idx, 1);
        }
        newDiv.remove();
    });
    // Set up ranking card functionality
    var rankingList = newDiv.getElementsByClassName('ranking-list')[0];
    var addBtn = newDiv.getElementsByClassName('rank-add')[0];
    addBtn.addEventListener("mousedown", function() {
        var item = document.createElement("div");
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
            var top;
            var bottom;
            var y = e.pageY;
            var objects = rankingList.getElementsByClassName('ranking-item');
            for(var i = 0; i < objects.length; i++) {
                var centroid = computeCenter(objects[i]);
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
        var del = item.getElementsByClassName('ranking-item-del')[0];
        del.addEventListener("mousedown", function() {
            if(rankingList.getElementsByClassName('ranking-item').length <= 2) {
                return;
            }
            item.remove();
        });
    });
    var currentObjs = rankingList.getElementsByClassName("ranking-item");
    for(var i = 0; i < currentObjs.length; i++) {
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
            var top;
            var bottom;
            var y = e.pageY;
            var objects = rankingList.getElementsByClassName('ranking-item');
            for(var i = 0; i < objects.length; i++) {
                var centroid = computeCenter(objects[i]);
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
    var newDiv = document.createElement("div");
    var n = cards.length + 1;
    newDiv.id = "c" + n;
    newDiv.className = "card";
    cardContain.appendChild(newDiv);
    cards.push(newDiv);
    initMc(newDiv, n);
}

createBtn.addEventListener("mousedown", async function() {
    if(name.value == '') {
        console.log("i am going to find you and strangle you until you choke and suffer as you die.\n\n(to summarize - please type in a name for this deck)");
        return;
    }
    var data = [];
    for(var i = 0; i < cards.length; i++) {
        var card = cards[i];
        var type = card.getElementsByClassName('selbtn-select')[0];
        if(!type) {
            console.log("how dare you attempt to modify the html. how malevolent of you.\n\n(to summarize - the system encountered an error parsing the cards and has associated it with an unexpected change in the HTML)");
            return;
        }
        var classNames = type.className.split(" ");
        if(classNames.includes('mcbtn')) {
            var cardData = {
                question: '',
                type: 'selection',
                answers: [],
                correctAnswer: ''
            };
            var question = card.getElementsByClassName('question')[0];
            if(!question) {
                console.log("how dare you attempt to modify the html. how malevolent of you.\n\n(to summarize - the system encountered an error parsing the cards and has associated it with an unexpected change in the HTML)");
                return;
            }
            cardData.question = question.value;
            var answers = card.getElementsByClassName('mc-option');
            if(answers.length < 2) {
                console.log("how dare you attempt to modify the html. how malevolent of you.\n\n(to summarize - the system encountered an error parsing the cards and has associated it with an unexpected change in the HTML)");
                return;
            }
            for(var j = 0; j < answers.length; j++) {
                var answer = answers[j].getElementsByClassName('mc-option-input')[0];
                if(!answer) {
                    console.log("how dare you attempt to modify the html. how malevolent of you.\n\n(to summarize - the system encountered an error parsing the cards and has associated it with an unexpected change in the HTML)");
                    return;
                }
                cardData.answers.push(answer.value);
                var isCorrect = answers[j].getElementsByClassName('mc-option-sel');
                if(isCorrect.length > 0) {
                    cardData.correctAnswer = answer.value;
                }
            }
            data.push(cardData);
        } else if(classNames.includes('txtbtn')) {
            var cardData = {
                question: '',
                type: 'input',
                correctAnswer: ''
            };
            var question = card.getElementsByClassName('question')[0];
            var answer = card.getElementsByClassName('txt-answer')[0];
            if(!question || !answer) {
                console.log("how dare you attempt to modify the html. how malevolent of you.\n\n(to summarize - the system encountered an error parsing the cards and has associated it with an unexpected change in the HTML)");
                return;
            }
            cardData.question = question.value;
            cardData.correctAnswer = answer.value;
            data.push(cardData);
        } else if(classNames.includes('rankbtn')) {
            var cardData = {
                question: '',
                type: 'ranking',
                answer: []
            };
            var question = card.getElementsByClassName('question')[0];
            if(!question) {
                console.log("how dare you attempt to modify the html. how malevolent of you.\n\n(to summarize - the system encountered an error parsing the cards and has associated it with an unexpected change in the HTML)");
                return;
            }
            cardData.question = question.value;
            var items = card.getElementsByClassName('ranking-item');
            for(var j = 0; j < items.length; j++) {
                var item = items[j];
                var txt = item.getElementsByClassName('ranking-item-txt')[0];
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
    var res = await DeckGateway.add(name.value, JSON.stringify(data), isPublic.checked);
    console.log(res);
});
addCard.addEventListener("mousedown", newCard);
newCard();

// Dragging event
window.addEventListener("dragover", function(e) {
    if(!dragging) {return;}
    var list = dragging.parentNode;
    if(dragLine.parentNode !== list) {
        list.prepend(dragLine);
    }
    var top;
    var bottom;
    var y = e.pageY;
    var objects = list.getElementsByClassName('ranking-item');
    for(var i = 0; i < objects.length; i++) {
        var centroid = computeCenter(objects[i]);
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