import { Game } from "./client-modules/game-library.js";
import { UserGateway } from "../server/client-gateway/user-gateway.js";
var problem = document.getElementById("problem");
var cont_a = document.getElementById("cont_a");
var answerbtn = document.getElementById("answerbtn");
var left = document.getElementById("left");
var info = document.getElementById("answer_info");
var ans_a = document.getElementById("ans_a");

var objs = [];
var selected;
let toProceed = false;

// Ranking functionality (drag)
var dragElements = [];
var centroids = [];
var dragging;
var dragLine = document.createElement("div");
dragLine.style = "display: flex; background-color: rgb(0, 150, 255); width: 100%; height: 5px;";
function noAnswer() {
    info.style['background-color'] = "rgba(255, 0, 0, 0.4)";
    info.style.display = "block";
    info.innerHTML = "Please specify an answer!";
    window.setTimeout(() => info.style.display = "none", 1000);
}
function contlabel() {
    info.style['background-color'] = "rgba(0, 255, 0, 0.4)";
    info.style.display = "block";
    info.innerHTML = "correct...";
    window.setTimeout(() => info.style.display = "none", 1000);
}
function computeCenter(el) {
    var rect = el.getBoundingClientRect();
    return {
        x: (rect.left + rect.right) / 2 + scrollX,
        y: (rect.top + rect.bottom) / 2 + scrollY
    }
}
function refresh() {
    if(Game.isDead()) {
        problem.innerHTML = "You completed Bento's Learn!";
        answerbtn.innerHTML = "Go back home >>>";
        for(var i = 0; i < objs.length; i++) {
            objs[i].remove();
        }
        selected = undefined;
        return;
    }
    var data = Game.fetchProblem();
    problem.innerHTML = data.question;
    for(var i = 0; i < objs.length; i++) {
        objs[i].remove();
    }
    objs = [];
    selected = undefined;
    dragElements = [];
    centroids = [];
    dragging = undefined;
    switch(data.type) {
        case "selection":
            for(var i = 0; i < data.answers.length; i++) {
                var op_i = document.createElement("button");
                op_i.className = "option";
                op_i.innerHTML = data.answers[i];
                op_i.id = "not-select";
                op_i.setAttribute("i", i);
                op_i.addEventListener("mousedown", function() {
                    if(selected) {
                        selected.id = "not-select";
                    }
                    selected = this;
                    selected.id = "select";
                });
                objs.push(op_i);
                cont_a.appendChild(op_i);
            }
        break;
        case "input":
            var input = document.createElement("input");
            input.type = "text";
            input.className = "op-input";
            input.placeholder = "Enter an answer here...";
            objs.push(input);
            cont_a.appendChild(input);
            input.addEventListener("keydown", (e) => {
                if(e.key == "Enter") answerHandler();
            });
        break;
        case "ranking":
            var list = document.createElement("div");
            list.id = "ranking-list";
            list.className = "ranking-list";
            cont_a.appendChild(list);
            objs.push(list);
            var answerList = data.answer.slice();
            for(var i = 0; i < data.answer.length; i++) {
                var idx = Math.floor(Math.random() * (answerList.length - 1) + 0.5);
                var item = answerList[idx];
                var el = document.createElement("div");
                el.className = "ranking-item";
                el.id = "item"+i;
                el.setAttribute("draggable", "true");
                el.innerHTML = item;
                answerList.splice(idx, 1);
                list.appendChild(el);
                el.addEventListener("dragstart", function(e) {
                    dragging = this;
                    this.style["background-color"] = "rgb(150, 200, 255)";
                    list.prepend(dragLine);
                });
                el.addEventListener("dragend", function(e) {
                    if(dragging !== this) {return;}
                    this.style["background-color"] = "";
                    dragLine.remove();
                    var top;
                    var bottom;
                    var y = e.pageY;
                    for(var i = 0; i < dragElements.length; i++) {
                        if(centroids[i].y < y) {
                            continue;
                        } else if((i - 1) >= 0) {
                            top = dragElements[i-1];
                            bottom = dragElements[i];
                            list.insertBefore(this, bottom);
                            break;
                        } else {
                            top = dragElements[i];
                            this.remove();
                            list.prepend(this);
                            break;
                        }
                    }
                    if(!top) {
                        this.remove();
                        list.appendChild(this);
                    }
                    dragging = undefined;
                    dragElements.sort((a, b) => {
                        var centerA = computeCenter(a);
                        var centerB = computeCenter(b);
                        return centerA.y - centerB.y;
                    })
                    centroids = [];
                    dragElements.forEach(function(val) {
                        centroids.push(computeCenter(val));
                    })
                });
                centroids.push(computeCenter(el));
                dragElements.push(el);
            }
        break;
        case "matching":

        break;
    }
    var progress = Game.getProgress();
    left.innerHTML = "New terms left to review: <b>" + progress.remaining + "</b>";
}
function answerHandler() {
    if(Game.isDead()) window.location.href = "/home";
    if(toProceed) {
        answerbtn.innerHTML = "Answer";
        ans_a.innerHTML = "";
        ans_a.style.display = "none";
        toProceed = false;
        refresh();
        return;
    }
    if(!Game.isDead()) {
        var data = Game.fetchProblem();
        var correct = false;
        switch(data.type) {
            case "selection":
                if(!selected) {
                    noAnswer();
                    return;
                }
                correct = Game.attemptProblem(parseInt(selected.getAttribute("i")));
                if(correct) {
                    contlabel();
                    refresh();
                } else {
                    ans_a.style.display = "flex";
                    ans_a.innerHTML = cont_a.innerHTML;
                    for(let i = 0; i < ans_a.children.length; i++) {
                        ans_a.children[i].disabled = true;
                        ans_a.children[i].id = "not-select";
                        if(data.answers[i] == data.correctAnswer) {
                            ans_a.children[i].id = "select";
                        }
                    }
                    answerbtn.innerHTML = "Continue >>>";
                    toProceed = true;
                }
            break;
            case "input":
                if(objs[0].value === "") {
                    noAnswer();
                    return;
                }
                correct = Game.attemptProblem(objs[0].value.toLowerCase());
                if(correct) {
                    contlabel();
                    refresh();
                } else {
                    ans_a.style.display = "flex";
                    ans_a.innerHTML = cont_a.innerHTML;
                    ans_a.children[0].value = data.correctAnswer;
                    ans_a.children[0].disabled = true;
                    answerbtn.innerHTML = "Continue >>>";
                    toProceed = true;
                }
            break;
            case "ranking":
                var answerList = [];
                for(var i = 0; i < dragElements.length; i++) {
                    answerList.push(dragElements[i].innerHTML);
                }
                correct = Game.attemptProblem(answerList);
                if(correct) {
                    contlabel();
                    refresh();
                } else {
                    ans_a.style.display = "flex";
                    let list = document.createElement("div");
                    list.id = "ans-ranking-list";
                    list.className = "ranking-list";
                    ans_a.appendChild(list);
                    for(let i = 0; i < data.answer.length; i++) {
                        let item = data.answer[i];
                        let el = document.createElement("div");
                        el.className = "ranking-item";
                        el.id = "item"+i;
                        el.innerHTML = item;
                        list.appendChild(el);
                    }
                    answerbtn.innerHTML = "Continue >>>";
                    toProceed = true;
                }
            break;
            case "matching":

            break;
        }
    }
}
answerbtn.addEventListener("mousedown", answerHandler);

// Dragging event
window.addEventListener("dragover", function(e) {
    if(!dragging) {return;}
    var list = document.getElementById("ranking-list");
    if(dragLine.parentNode !== list) {
        list.prepend(dragLine);
    }
    var top;
    var bottom;
    var y = e.pageY;
    for(var i = 0; i < dragElements.length; i++) {
        if(centroids[i].y < y) {
            continue;
        } else if((i - 1) >= 0) {
            top = dragElements[i-1];
            bottom = dragElements[i];
            list.insertBefore(dragLine, bottom);
            break;
        } else {
            top = dragElements[i];
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
// Main
async function main() {
    var [success, data] = await UserGateway.getuser();
    if(!success && data == "no session") {
        problem.innerHTML = "You must be logged in to use Bento Learn!<br>This is a TEST version. To log in, visit this link:<br>localhost/html/test_user.html<br>login problems? contact me (you know who i am)";
        return;
    }
    const paramList = new URLSearchParams(window.location.search);
    if(!paramList.get("ds")) {
        problem.innerHTML = "Looks like there's something wrong. Go back to Learn Picker and go from there.";
        return;
    }
    let dsVal = paramList.get("ds").split(",");
    dsVal.forEach((val, idx) => {dsVal[idx] = parseInt(val);});
    let m = parseFloat(paramList["m"]);
    let s = parseFloat(paramList["s"]);
    let r = parseFloat(paramList["r"]);
    let sh = parseFloat(paramList["sh"]);
    await Game.init(dsVal, {
        NTRonly: m == 1 ? true : false,
        randomTerms: sh == 1 ? true : false,
        deckSize: s == 1 ? 7 : 5,
        cardRepeat: r == 1 ? 2 : 1, // set to 2 in official
        curr_p: s == 1 ? 0.7 : 0.5,
        ls_p: s == 1 ? 0.2 : 0.3,
        lls_p: s == 1 ? 0.1 : 0.2
    });
    refresh();
}
main();
/*btn.addEventListener("mousedown", function() {
    if(Game.isActive() === false) {
        switch(Game.getMode()) {
            case Game.modes.Selection:
                
            break;
            case Game.modes.Input:

            break;
            case Game.modes.Ranking:

            break;
            case Game.modes.Matching:

            break;
        }
    }
    if(Game.isActive() === false) {
        problem.innerHTML = "Finished game!";
    } else {
        Game.answerProblem(0);
        if(Game.isActive() === true) {
            problem.innerHTML = Game.getProblem();
        }
    }
});
getwrong.addEventListener("mousedown", function() {
    if(Game.isActive() === false) {
        problem.innerHTML = "Finished game!";
    } else {
        Game.answerProblem(1);
        if(Game.isActive() === true) {
            problem.innerHTML = Game.getProblem();
        }
    }
})*/