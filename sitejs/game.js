import { Game } from "./client-modules/game-library.js";
import { UserGateway } from "../server/client-gateway/user-gateway.js";
var problem = document.getElementById("problem");
var cont_a = document.getElementById("cont_a");
var answerbtn = document.getElementById("answerbtn");
var progressNumbers = document.getElementById("progressNumbers");
let progressBar = document.getElementById("progressBar");
const answerMarker = document.getElementById("answer_marker");
var info = document.getElementById("answer_info");
var ans_a = document.getElementById("ans_a");

var objs = [];
let selected = true;
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
    info.innerHTML = "Correct.";
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
        progressBar.style.width = `100%`;
        var progress = Game.getProgress();
        progressNumbers.style.marginLeft = "5px";
        progressNumbers.innerHTML = `
        <p>${progress.seen}</p> <span class="material-symbols-outlined">check</span> 
        <p>${progress.remaining}</p> <span class="material-symbols-outlined">box</span> 
        `;
        answerbtn.style.display = "block";
        answerbtn.innerHTML = "Go back home >>>";
        for(var i = 0; i < objs.length; i++) {
            objs[i].remove();
        }
        return;
    }
    let data = Game.fetchProblem();
    problem.innerHTML = data.q;
    for(var i = 0; i < objs.length; i++) {
        objs[i].remove();
    }
    objs = [];
    dragElements = [];
    centroids = [];
    dragging = undefined;
    answerbtn.style.display = "block";
    switch(data.type) {
        case "mc":
            selected = false;
            answerbtn.style.display = "none";
            for(let i = 0; i < data.op.length; i++) {
                let op_i = document.createElement("button");
                op_i.className = "option";
                op_i.innerHTML = `<p class="answer-symbol">&#${9312+i}</p> <p>${data.op[i]}</p>`;
                op_i.id = "not-select";
                op_i.setAttribute("i", i);
                op_i.addEventListener("mousedown", function() {
                    if(selected) return;
                    selected = true;
                    let correct = Game.isCorrect(parseInt(this.getAttribute("i")));
                    if(correct) {
                        this.innerHTML = `<p class="answer-symbol">✅</p> ` + this.innerHTML;
                        window.setTimeout(() => {
                            Game.continue();
                            refresh();
                        }, 1000);
                    } else {
                        for(let j = 0; j < cont_a.children.length; j++) {
                            let item = cont_a.children[j];
                            if(data.op[j] == data.ans) item.innerHTML = `<p class="answer-symbol">✅</p> ` + item.innerHTML;
                        }
                        this.innerHTML = `<p class="answer-symbol">❌</p> ` + this.innerHTML;
                        answerMarker.style.display = "block";
                        answerbtn.style.display = "block";
                        answerbtn.innerHTML = "Continue >>> (Enter)";
                        toProceed = true;
                    }
                });
                objs.push(op_i);
                cont_a.appendChild(op_i);
            }
        break;
        case "txt":
            selected = true
            var input = document.createElement("input");
            input.type = "text";
            input.className = "op-input";
            input.placeholder = "Enter an answer here...";
            input.autofocus = true;
            objs.push(input);
            cont_a.appendChild(input);
            document.getElementsByClassName("op-input")[0].focus();
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
            var answerList = data.ans.slice();
            for(var i = 0; i < data.ans.length; i++) {
                var idx = Math.floor(Math.random() * (answerList.length - 1) + 0.5);
                var item = answerList[idx];
                var el = document.createElement("div");
                el.className = "ranking-item";
                el.id = "item"+i;
                el.setAttribute("draggable", "true");
                el.innerHTML = `<p>${item}</p>`;
                answerList.splice(idx, 1);
                list.appendChild(el);
                el.addEventListener("dragstart", function(e) {
                    dragging = this;
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
    progressNumbers.innerHTML = `
    <p>${progress.seen-1}</p> <span class="material-symbols-outlined">check</span> 
    <p>${progress.remaining+1}</p> <span class="material-symbols-outlined">box</span> 
    `;
    // <p>${progress.total}</p> Total
    progressBar.style.width = `${(progress.seen-1) / (progress.remaining+progress.seen) * 100}%`;
}
function answerHandler() {
    if(Game.isDead()) window.location.href = "/home?l=lm&s=1";
    if(toProceed) {
        Game.continue();
        answerMarker.style.display = "none";
        answerbtn.innerHTML = "Answer";
        ans_a.innerHTML = "";
        ans_a.style.display = "none";
        toProceed = false;
        refresh();
        return;
    }
    if(!Game.isDead()) {
        let data = Game.fetchProblem();
        let correct = false;
        switch(data.type) {
            case "txt":
                selected = false;
                if(objs[0].value === "") {
                    noAnswer();
                    return;
                }
                correct = Game.isCorrect(objs[0].value.toLowerCase());
                if(correct) {
                    contlabel();
                    refresh();
                } else {
                    objs[0].disabled = true;
                    ans_a.style.display = "flex";
                    ans_a.innerHTML = cont_a.innerHTML;
                    cont_a.children[0].style.backgroundColor = `rgba(255, 0, 0, 0.5)`;
                    ans_a.children[0].style.backgroundColor = `rgba(0, 255, 0, 0.5)`;
                    ans_a.children[0].value = data.ans;
                    ans_a.children[0].disabled = true;
                    answerbtn.innerHTML = "Continue >>> (Enter)";
                    answerMarker.style.display = "block";
                    toProceed = true;
                }
            break;
            case "ranking":
                var answerList = [];
                for(var i = 0; i < dragElements.length; i++) {
                    answerList.push(dragElements[i].textContent);
                }
                correct = Game.isCorrect(answerList);
                if(correct) {
                    contlabel();
                    refresh();
                } else {
                    ans_a.style.display = "flex";
                    let list = document.createElement("div");
                    list.id = "ans-ranking-list";
                    list.className = "ranking-list";
                    ans_a.appendChild(list);
                    for(let i = 0; i < data.ans.length; i++) {
                        let item = data.ans[i];
                        let el = document.createElement("div");
                        el.className = "ranking-item";
                        el.id = "item"+i;
                        el.innerHTML = item;
                        list.appendChild(el);
                    }
                    answerbtn.innerHTML = "Continue >>> (Enter)";
                    answerMarker.style.display = "block";
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
(async () => {
    let [success, data] = await UserGateway.getuser();
    if(!success) return;
    const paramList = new URLSearchParams(window.location.search);
    if(!paramList.get("ds")) {
        problem.innerHTML = "Looks like there's something wrong. Go back to Learn Picker and go from there.";
        progressNumbers.remove();
        cont_a.remove();
        ans_a.remove();
        answerbtn.remove();
        info.remove();
        return;
    }
    let dsVal = paramList.get("ds").split(",");
    dsVal.forEach((val, idx) => {dsVal[idx] = parseInt(val);});
    let m = parseFloat(paramList.get("m"));
    let r = parseFloat(paramList.get("r"));
    let sh = parseFloat(paramList.get("sh"));
    console.log(sh);
    await Game.init(dsVal, {
        NTRonly: m == 1 ? true : false,
        randomTerms: sh == 1 ? true : false,
        deckSize: 8,
        cardRepeat: r == 1 ? 2 : 1,
        // curr_p: 0.8,
        // ls_p: 0.1,
        // lls_p: 0.1,
        deckdistr: [6, 1, 1]
    });
    refresh();
})();
answerMarker.addEventListener("mousedown", () => {
    Game.markCorrect();
    Game.continue();
    answerMarker.style.display = "none";
    answerbtn.innerHTML = "Answer";
    ans_a.innerHTML = "";
    ans_a.style.display = "none";
    toProceed = false;
    refresh();
});
let mc_keynum = "";
let prob;
window.addEventListener("keydown", (e) => {
    if(selected) return;
    let data = Game.fetchProblem();
    let nums = "0123456789";
    if(data.type == "mc" && (nums.indexOf(e.key) > -1 || e.key == "Enter")) {
        if(prob && data.q !== prob) mc_keynum = "";
        prob = data.q;
        if(nums.indexOf(e.key) > -1) {
            let len = data.op.length;
            let strlen = String(len);
            mc_keynum += e.key;
            problem.innerHTML = data.q + "<p style='font-size: 10px;'>" + mc_keynum + "</p>";
            if(strlen.length > mc_keynum) return;
        }
        if(mc_keynum.length == 0) {
            problem.innerHTML = data.q;
            return;
        }
        let num = parseInt(mc_keynum);
        if(num > data.op.length) {
            problem.innerHTML = data.q;
            mc_keynum = "";
            return;
        }
        mc_keynum = "";
        prob = undefined;
        let correct = Game.isCorrect(parseInt(num - 1));
        if(correct) {
            cont_a.children[num - 1].innerHTML = `<p class="answer-symbol">✅</p> ` + cont_a.children[num - 1].innerHTML;
            window.setTimeout(() => {
                Game.continue();
                refresh();
            }, 1000);
        } else {
            for(let i = 0; i < cont_a.children.length; i++) {
                let item = cont_a.children[i];
                if(data.op[i] == data.ans) item.innerHTML = `<p class="answer-symbol">✅</p> ` + item.innerHTML;
            }
            cont_a.children[num - 1].innerHTML = `<p class="answer-symbol">❌</p> ` + cont_a.children[num - 1].innerHTML;
            answerMarker.style.display = "block";
            answerbtn.style.display = "block";
            answerbtn.innerHTML = "Continue >>> (Enter)";
            toProceed = true;
        }
    }
    if(e.key == "Enter" && e.target != objs[0]) {
        Game.continue();
        answerMarker.style.display = "none";
        answerbtn.innerHTML = "Answer";
        ans_a.innerHTML = "";
        ans_a.style.display = "none";
        toProceed = false;
        refresh();
    }
    if(e.key == " ") { // Space
        Game.markCorrect();
        Game.continue();
        answerMarker.style.display = "none";
        answerbtn.innerHTML = "Answer";
        ans_a.innerHTML = "";
        ans_a.style.display = "none";
        toProceed = false;
        refresh();
    }
});