import { Game } from "./client-modules/game-library.js";
import { UserGateway } from "../server/client-gateway/user-gateway.js";
const problem = document.getElementById("problem");
const cont_a = document.getElementById("cont_a");
const answerbtn = document.getElementById("answerbtn");
const progressNumbers = document.getElementById("progressNumbers");
const progressBar = document.getElementById("progressBar");
const answerMarker = document.getElementById("answer_marker");
const reshowMarker = document.getElementById("reshow_marker");
const info = document.getElementById("answer_info");
const ans_a = document.getElementById("ans_a");

let objs = [];
let mc_sel = [];
let selected = true;
let toProceed = false;
let requireCorrect = false;

// Ranking functionality (drag)
let dragElements = [];
let centroids = [];
let dragging;
let termSelect, defSelect;
let incorrectMatch = 0;
let dragLine = document.createElement("div");
// Rendering testing
let r_temp = document.createElement('div');
r_temp.style.visibility = 'hidden';
document.body.appendChild(r_temp);

dragLine.style = "display: flex; background-color: rgb(0, 150, 255); width: 100%; height: 5px;";
function noAnswer() {
    info.style["background-color"] = "rgba(255, 0, 0, 0.4)";
    info.innerHTML = "Please specify an answer!";
    window.setTimeout(() => {
        info.innerHTML = "";
        info.style["background-color"] = "rgba(0, 255, 0, 0)";
    }, 1000);
}
function showDisplay(val) {
    info.style["background-color"] = "rgba(255, 255, 0, 0.4)";
    info.innerHTML = "Preview: ";
    let node = document.createElement('span');
    info.appendChild(node);
    node.innerHTML = val;
    typeset(node);
}
function hideDisplay() {
    if(info.style["background-color"] == "rgba(255, 255, 0, 0.4)") {
        info.style["background-color"] = "rgb(0, 255, 0, 0)";
        info.innerHTML = "";
    }
}
function contlabel() {
    info.style["background-color"] = "rgba(0, 255, 0, 0.4)";
    info.innerHTML = "Correct.";
    window.setTimeout(() => {
        info.innerHTML = "";
        info.style["background-color"] = "rgba(0, 255, 0, 0)";
    }, 1000);
}
function computeCenter(el) {
    let rect = el.getBoundingClientRect();
    return {
        x: (rect.left + rect.right) / 2 + scrollX,
        y: (rect.top + rect.bottom) / 2 + scrollY,
    };
}
async function typeset(node) {
    if(Object.keys(MathJax.startup) == 0) 
        await new Promise((res) => {
            MathJax.startup.ready = () => res();
        });
    MathJax.startup.promise = MathJax.startup.promise.then(() => MathJax.typesetPromise([node])).catch(e => console.warn('math formatting failed; reason:', e.message));
    return MathJax.startup.promise;
}
async function renderable(input) {
    if(Object.keys(MathJax.startup) == 0) 
        await new Promise((res) => {
            MathJax.startup.ready = () => res();
        });
    r_temp.innerHTML = input;
    try {
        MathJax.startup.promise = MathJax.startup.promise.then(() => MathJax.typesetPromise([r_temp])).catch(e => console.warn('math formatting failed; reason:', e.message));
        await MathJax.startup.promise;
        return r_temp.innerHTML.trim() !== '';
    } catch(e) {
        return false;
    }
}
function refresh() {
    hideDisplay();
    if(Game.isDead()) {
        problem.innerHTML = "You completed Learn! Now go touch some <span>grass!</span>";
        progressBar.style.width = `100%`;
        let progress = Game.getProgress();
        progressNumbers.style.marginLeft = "5px";
        progressNumbers.innerHTML = `
            <p>${progress.seen}</p> <span class="material-symbols-outlined">check</span>
            <p>${progress.remaining}</p> <span class="material-symbols-outlined">box</span>
        `;
        answerbtn.style.display = "block";
        answerbtn.innerHTML = "Go back home >>>";
        for(let i = 0; i < objs.length; i++) objs[i].remove();
        setTimeout(() =>
            window.addEventListener("keydown", e => e.key == "Enter" ? answerHandler() : null),
        500);
        return;
    }

    let data = Game.fetchProblem();
    problem.innerHTML = data.q;
    if(data.type == 'mc' && data.req == 1) problem.innerHTML += "<p style='font-size: 15px;'>Select all correct answers.</p>";
    typeset(problem);
    
    for(let i = 0; i < objs.length; i++) objs[i].remove();
    [objs, dragElements, centroids] = [[], [], []];
    dragging = undefined;
    answerbtn.style.display = "block";
    
    switch (data.type) {
        case "mc":
            selected = false;
            answerbtn.style.display = "none";
            for (let i = 0; i < data.op.length; i++) {
                let op_i = document.createElement("button");
                op_i.className = "option";
                op_i.innerHTML = `<p class="answer-symbol">&#${9312 + i}</p> <p>${data.op[i]}</p>`;
                typeset(op_i);
                op_i.id = "not-select";
                op_i.setAttribute("i", i);
                op_i.setAttribute("orig", op_i.innerHTML);
                op_i.addEventListener("mousedown", () => {
                    if (selected && data.req == 0) return;
                    selected = true;
                    if(data.req == 1 && mc_sel.indexOf(i) < 0) {
                        op_i.innerHTML = `<p class="answer-symbol">X</p> ` + op_i.innerHTML;
                        mc_sel.push(i);
                        answerbtn.style.display = "block";
                        answerbtn.innerHTML = "Continue >>> (Enter)";
                        return;
                    } else if(data.req == 1) {
                        op_i.innerHTML = op_i.getAttribute('orig');
                        mc_sel.splice(mc_sel.indexOf(i), 1);
                        if(mc_sel.length == 0) answerbtn.style.display = "none";
                        return;
                    }
                    let correct = Game.isCorrect( parseInt(op_i.getAttribute("i")) );
                    if (correct) {
                        op_i.innerHTML = `<p class="answer-symbol">✅</p> ` + op_i.innerHTML;
                        window.setTimeout(() => {
                            Game.continue();
                            refresh();
                        }, 1000);
                    } else {
                        for (let j = 0; j < cont_a.children.length; j++) {
                            let item = cont_a.children[j];
                            if(data.ans.indexOf(j) > -1) item.innerHTML = `<p class="answer-symbol">✅</p> ` + item.innerHTML;
                        }
                        op_i.innerHTML = `<p class="answer-symbol">❌</p> ` + op_i.innerHTML;
                        answerMarker.style.display = "block";
                        reshowMarker.style.display = "block";
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
            let input = document.createElement("div");
            input.contentEditable = true;
            input.type = "text";
            input.className = "op-input";
            input.setAttribute("placeholder", "Enter an answer here... [math formatting happens between two $]");
            input.autofocus = true;
            objs.push(input);
            cont_a.appendChild(input);
            document.getElementsByClassName("op-input")[0].focus();
            input.addEventListener("keydown", e => {
                if(e.key == "Enter") e.preventDefault();
                if(e.key == "Enter" && !toProceed) answerHandler();
            });
            input.addEventListener('keyup', async () => {
                if(await renderable(input.innerHTML) && input.innerHTML.match(/\$[^$]*\$/g)) showDisplay(input.innerHTML); 
                    else hideDisplay();
            });
            input.addEventListener('paste', e => {
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
        break;
        case "ranking":
            let list = document.createElement("div");
            list.id = "ranking-list";
            list.className = "ranking-list";
            cont_a.appendChild(list);
            objs.push(list);
            let answerList = data.ans.slice();
            for (let i = 0; i < data.ans.length; i++) {
                let idx = Math.floor(
                    Math.random() * (answerList.length - 1) + 0.5,
                );
                let item = answerList[idx];
                let el = document.createElement("div");
                el.className = "ranking-item";
                el.id = "item" + i;
                el.setAttribute("draggable", "true");
                el.innerHTML = `<p>${item}</p>`;
                typeset(el);
                answerList.splice(idx, 1);
                list.appendChild(el);
                el.addEventListener("dragstart", () => {
                    dragging = el;
                    list.prepend(dragLine);
                });
                el.addEventListener("dragend", e => {
                    if (dragging !== el) return;
                    el.style["background-color"] = "";
                    dragLine.remove();
                    let top;
                    let bottom;
                    let y = e.pageY;
                    for (let i = 0; i < dragElements.length; i++) {
                        if (centroids[i].y < y) continue;
                        else if (i - 1 >= 0) {
                            top = dragElements[i - 1];
                            bottom = dragElements[i];
                            list.insertBefore(el, bottom);
                            break;
                        } else {
                            top = dragElements[i];
                            el.remove();
                            list.prepend(el);
                            break;
                        }
                    }
                    if (!top) {
                        el.remove();
                        list.appendChild(el);
                    }
                    dragging = undefined;
                    dragElements.sort((a, b) => {
                        let centerA = computeCenter(a);
                        let centerB = computeCenter(b);
                        return centerA.y - centerB.y;
                    });
                    centroids = [];
                    dragElements.forEach(val => centroids.push(computeCenter(val)));
                });
                centroids.push(computeCenter(el));
                dragElements.push(el);
            }
        break;
        case "mtch":
            selected = false;
            incorrectMatch = 0;
            let terms = document.createElement("div");
            terms.className = "matching-terms";
            terms.id = "matching-terms";
            cont_a.appendChild(terms);
            let defs = document.createElement("div");
            defs.className = "matching-defs";
            defs.id = "matching-defs";
            cont_a.appendChild(defs);
            objs.push(terms);
            objs.push(defs);
            let termList = data.ans.slice();
            let defsList = data.ans.slice();
            // if you found this, go touch some grass.
            for(let i = 0; i < data.ans.length; i++) {
                let t_idx = Math.floor(
                    Math.random() * (termList.length - 1) + 0.5,
                );
                let d_idx = Math.floor(
                    Math.random() * (defsList.length - 1) + 0.5,
                );
                let t_item = termList[t_idx][0];
                let d_item = defsList[d_idx][1];
                let t_el = document.createElement("div");
                t_el.className = "matching-item";
                t_el.id = "item-" + data.ans.indexOf(termList[t_idx]);
                t_el.innerHTML = `<p>${t_item}</p>`;
                typeset(t_el);
                termList.splice(t_idx, 1);
                terms.appendChild(t_el);
                let d_el = document.createElement("div");
                d_el.className = "matching-item";
                d_el.id = "item-" + data.ans.indexOf(defsList[d_idx]);
                d_el.innerHTML = `<p>${d_item}</p>`;
                typeset(d_el);
                defsList.splice(d_idx, 1);
                defs.appendChild(d_el);
                t_el.addEventListener("mousedown", () => {
                    if(termSelect) return;
                    termSelect = t_el;
                    termSelect.style["background-color"] = "rgba(0, 255, 0, 0.5)";
                    if(defSelect) {
                        if(termSelect.id == defSelect.id) {
                            termSelect.remove();
                            defSelect.remove();
                        } else incorrectMatch++;
                        let [lt, ld] = [termSelect, defSelect];
                        termSelect.style["background-color"] = "rgba(255, 0, 0, 0.5)";
                        defSelect.style["background-color"] = "rgba(255, 0, 0, 0.5)";
                        window.setTimeout(() => {
                            lt.style["background-color"] = "rgba(0, 0, 0, 0)";
                            ld.style["background-color"] = "rgba(0, 0, 0, 0)";
                        }, 500);
                        termSelect = undefined;
                        defSelect = undefined;
                        if(terms.children.length == 0) answerHandler();
                    }
                });
                d_el.addEventListener("mousedown", () => {
                    if(defSelect) return;
                    defSelect = d_el;
                    defSelect.style["background-color"] = "rgba(0, 255, 0, 0.5)";
                    if(termSelect) {
                        if(termSelect.id == defSelect.id) {
                            termSelect.remove();
                            defSelect.remove();
                        } else incorrectMatch++;
                        let [lt, ld] = [termSelect, defSelect];
                        termSelect.style["background-color"] = "rgba(255, 0, 0, 0.5)";
                        defSelect.style["background-color"] = "rgba(255, 0, 0, 0.5)";
                        window.setTimeout(() => {
                            lt.style["background-color"] = "rgba(0, 0, 0, 0)";
                            ld.style["background-color"] = "rgba(0, 0, 0, 0)";
                        }, 500);
                        termSelect = undefined;
                        defSelect = undefined;
                        if(defs.children.length == 0) answerHandler();
                    }
                });
            }
            answerbtn.innerHTML = "Skip >>> (Backspace)";
            answerbtn.style.display = "block";
        break;
    }
    let progress = Game.getProgress();
    progressNumbers.innerHTML = `
        <p>${progress.seen - 1}</p> <span class="material-symbols-outlined">check</span>
        <p>${progress.remaining + 1}</p> <span class="material-symbols-outlined">box</span>
    `;
    progressBar.style.width = `${((progress.seen - 1) / (progress.remaining + progress.seen)) * 100}%`;
}
function answerHandler() {
    hideDisplay();
    if (Game.isDead()) window.location.href = "/home?l=lm&s=1";
    if (toProceed) {
        if (Game.fetchProblem().type == "txt" && requireCorrect && !Game.getLastCorrect()) return;
        Game.continue();
        answerMarker.style.display = "none";
        reshowMarker.style.display = "none";
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
            case "mc":
                if(data.req == 1) {
                    selected = false;
                    if(mc_sel.length == 0) return noAnswer();
                    correct = Game.isCorrect(mc_sel);
                    if (correct) {
                        for(let i = 0; i < objs.length; i++)
                            if(data.ans.indexOf(parseInt(objs[i].getAttribute('i'))) > -1) objs[i].innerHTML = `<p class="answer-symbol">✅</p> ` + objs[i].getAttribute('orig');
                        window.setTimeout(() => {
                            Game.continue();
                            refresh();
                        }, 1000);
                    } else {
                        for(let i = 0; i < mc_sel.length; i++)
                            objs[mc_sel[i]].innerHTML = `<p class="answer-symbol">${data.ans.indexOf(mc_sel[i]) > -1 ? '☑️' : '❌'}</p> ` + objs[mc_sel[i]].getAttribute('orig');
                        for (let j = 0; j < cont_a.children.length; j++) {
                            let item = cont_a.children[j];
                            if(data.ans.indexOf(j) > -1 && mc_sel.indexOf(j) < 0) item.innerHTML = `<p class="answer-symbol">✅</p> ` + item.innerHTML;
                        }
                        answerMarker.style.display = "block";
                        reshowMarker.style.display = "block";
                        answerbtn.style.display = "block";
                        answerbtn.innerHTML = "Continue >>> (Enter)";
                        toProceed = true;
                    }
                }
            break;
            case "txt":
                selected = false;
                if(objs[0].textContent === "") return noAnswer();
                correct = Game.isCorrect(objs[0].textContent.toLowerCase());
                if(correct) {
                    Game.continue();
                    contlabel();
                    refresh();
                } else {
                    if (!requireCorrect) objs[0].contentEditable = false;
                    ans_a.style.display = "flex";
                    ans_a.innerHTML = cont_a.innerHTML;
                    cont_a.children[0].style.backgroundColor = `rgba(255, 0, 0, 0.5)`;
                    ans_a.children[0].style.backgroundColor = `rgba(0, 255, 0, 0.5)`;
                    ans_a.children[0].innerHTML = data.ans.join(" • ");
                    ans_a.children[0].disabled = true;
                    answerbtn.innerHTML = "Continue >>> (Enter)";
                    if (requireCorrect) {
                        answerbtn.innerHTML = "Enter the correct answer before advancing.";
                        answerbtn.disabled = true;
                        objs[0].textContent = "";
                    }
                    answerMarker.style.display = "block";
                    reshowMarker.style.display = "block";
                    toProceed = true;
                }
            break;
            case "ranking":
                let answerList = [];
                for(let i = 0; i < dragElements.length; i++) answerList.push(dragElements[i].textContent);
                correct = Game.isCorrect(answerList);
                if(correct) {
                    Game.continue();
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
                        el.id = "item" + i;
                        el.innerHTML = item;
                        list.appendChild(el);
                    }
                    answerbtn.innerHTML = "Continue >>> (Enter)";
                    answerbtn.focus();
                    answerMarker.style.display = "block";
                    reshowMarker.style.display = "block";
                    toProceed = true;
                }
            break;
            case "mtch":
                selected = false;
                if(objs[0].children.length > 0 || incorrectMatch >= data.ans.length / 3) {
                    // skipped or too many wrong
                    ans_a.style.display = "block";
                    let termList = document.createElement("div");
                    termList.className = "matching-terms";
                    termList.id = "ans-matching-terms";
                    ans_a.appendChild(termList);
                    let defsList = document.createElement("div");
                    defsList.className = "matching-defs";
                    defsList.id = "ans-matching-defs";
                    ans_a.appendChild(defsList);
                    for(let i = 0; i < data.ans.length; i++) {
                        let item = data.ans[i];
                        let t_el = document.createElement("div");
                        t_el.className = "matching-item";
                        t_el.id = "item-" + i;
                        t_el.style["background-color"] = `var(--matching-${i % 3 + 1})`;
                        t_el.innerHTML = `<p>${item[0]}</p>`;
                        typeset(t_el);
                        termList.appendChild(t_el);
                        let d_el = document.createElement("div");
                        d_el.className = "matching-item";
                        d_el.id = "item-" + i;
                        d_el.style["background-color"] = `var(--matching-${i % 3 + 1})`;
                        d_el.innerHTML = `<p>${item[1]}</p>`;
                        typeset(d_el);
                        defsList.appendChild(d_el);
                    }
                    answerMarker.style.display = "block";
                    reshowMarker.style.display = "block";
                    answerbtn.style.display = "block";
                    answerbtn.innerHTML = "Continue >>> (Enter)";
                    toProceed = true;
                } else {
                    Game.markCorrect(); // Mark as correct since we already checked
                    Game.continue();
                    contlabel();
                    refresh();
                }
            break;
        }
    }
}
answerbtn.addEventListener("mousedown", answerHandler);

// Dragging event
window.addEventListener("dragover", e => {
    if(!dragging) return;
    let list = document.getElementById("ranking-list");
    if(dragLine.parentNode !== list) list.prepend(dragLine);
    let top, bottom, y = e.pageY;
    for(let i = 0; i < dragElements.length; i++) {
        if(centroids[i].y < y) continue;
        else if((i - 1) >= 0) {
            top = dragElements[i - 1];
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
    let [success, _] = await UserGateway.getuser(false, false, false, false);
    if (!success) return;
    const paramList = new URLSearchParams(window.location.search);
    if (!paramList.get("ds")) {
        problem.innerHTML = "Looks like there's something wrong. Go back to Learn Picker and go from there.";
        progressNumbers.remove();
        cont_a.remove();
        ans_a.remove();
        answerbtn.remove();
        info.remove();
        return;
    }
    let dsVal = paramList.get("ds").split(",");
    dsVal.forEach((val, idx) => dsVal[idx] = parseInt(val));
    let m = parseFloat(paramList.get("m"));
    let r = parseFloat(paramList.get("r"));
    let sh = parseFloat(paramList.get("sh"));
    let i = parseFloat(paramList.get("i"));
    let rc = parseFloat(paramList.get("rc"));
    await Game.init(dsVal, {
        NTRonly: m == 1 ? true : false,
        randomTerms: sh == 1 ? true : false,
        deckSize: 8,
        cardRepeat: r == 1 ? 2 : 1,
        infinite_mode: i == 1 ? true : false,
        deckdistr: [6, 1, 1]
    });
    if (rc == 1) requireCorrect = true;
    refresh();
    window.LOADED();
})();
answerMarker.addEventListener("mousedown", () => {
    Game.markCorrect();
    Game.continue();
    answerMarker.style.display = "none";
    reshowMarker.style.display = "none";
    answerbtn.innerHTML = "Answer";
    ans_a.innerHTML = "";
    ans_a.style.display = "none";
    toProceed = false;
    refresh();
});
reshowMarker.addEventListener("mousedown", () => {
    Game.reshow();
    answerMarker.style.display = "none";
    reshowMarker.style.display = "none";
    answerbtn.innerHTML = "Answer";
    ans_a.innerHTML = "";
    ans_a.style.display = "none";
    toProceed = false;
    refresh();
})
let mc_keynum = "", prob;
window.addEventListener("keydown", e => {
    let data = Game.fetchProblem();
    let nums = "0123456789";
    if(data.type == "mc" && (nums.indexOf(e.key) > -1 || e.key == "Enter") && !toProceed && !selected) {
        if (prob && data.q != prob) {
            mc_keynum = "";
            mc_sel = [];
        }
        prob = data.q;
        if (nums.indexOf(e.key) > -1) {
            let len = data.op.length;
            let strlen = String(len);
            mc_keynum += e.key;
            problem.innerHTML = data.q + (data.req == 1 ? "<p style='font-size: 15px;'>Select all correct answers.</p>" : '') + "<p style='font-size: 10px;'>" + mc_sel.join(",") + (mc_sel.length > 0 ? "," : "") + mc_keynum + "</p>";
            if (strlen.length > mc_keynum) return;
        }
        if (mc_keynum.length == 0) return void (problem.innerHTML = data.q + (data.req == 1 ? "<p style='font-size: 15px;'>Select all correct answers.</p>" : ''));
        let num = parseInt(mc_keynum);
        if (num > data.op.length) {
            problem.innerHTML = data.q + (data.req == 1 ? "<p style='font-size: 15px;'>Select all correct answers.</p>" : '');
            mc_keynum = "";
            return;
        }
        mc_keynum = "";
        prob = undefined;
        mc_sel.push(num);
        if(data.req == 1 && mc_sel.length < data.ans.length) return;
        let correct = Game.isCorrect(data.req == 1 ? mc_sel.map((v) => v - 1) : num - 1);
        if (correct) {
            for(let i = 0; i < mc_sel.length; i++)
                cont_a.children[mc_sel[i] - 1].innerHTML = `<p class="answer-symbol">✅</p> ` + cont_a.children[mc_sel[i] - 1].innerHTML;
            selected = true;
            window.setTimeout(() => {
                Game.continue();
                refresh();
            }, 1000);
        } else {
            selected = true;
            for (let i = 0; i < cont_a.children.length; i++) {
                let item = cont_a.children[i];
                if(data.ans.indexOf(i) > -1) item.innerHTML = `<p class="answer-symbol">✅</p> ` + item.innerHTML;
            }
            for(let i = 0; i < mc_sel.length; i++)
                cont_a.children[mc_sel[i] - 1].innerHTML = `<p class="answer-symbol">❌</p> ` + cont_a.children[mc_sel[i] - 1].innerHTML;
            answerMarker.style.display = "block";
            reshowMarker.style.display = "block";
            answerbtn.style.display = "block";
            answerbtn.innerHTML = "Continue >>> (Enter)";
            toProceed = true;
        }
        mc_sel = [];
    }
    if(data.type == "mtch" && e.key == "Backspace") answerHandler();
    if(!toProceed) return;
    if(e.key == "Enter") e.preventDefault();
    if(e.key == "Enter" && (requireCorrect ? answerbtn.disabled == false : e.target != objs[0])) {
        Game.continue();
        answerMarker.style.display = "none";
        reshowMarker.style.display = "none";
        answerbtn.innerHTML = "Answer";
        ans_a.innerHTML = "";
        ans_a.style.display = "none";
        toProceed = false;
        refresh();
    }
    if (e.key == " " && e.target != objs[0]) {
        e.preventDefault();
        // Space
        Game.markCorrect();
        Game.continue();
        answerMarker.style.display = "none";
        reshowMarker.style.display = "none";
        answerbtn.innerHTML = "Answer";
        ans_a.innerHTML = "";
        ans_a.style.display = "none";
        toProceed = false;
        refresh();
    }
    if(e.key == "r" && !e.ctrlKey && e.target != objs[0]) {
        e.preventDefault();
        // Reshow
        Game.reshow();
        answerMarker.style.display = "none";
        reshowMarker.style.display = "none";
        answerbtn.innerHTML = "Answer";
        ans_a.innerHTML = "";
        ans_a.style.display = "none";
        toProceed = false;
        refresh();
    }
});
window.addEventListener("input", () => {
    if(selected) return;
    if(!toProceed) return;
    if(Game.fetchProblem().type == "txt" && requireCorrect) {
        let ans = objs[0].textContent.toLowerCase().replaceAll(/\s/g, "");
        if (!Game.check(ans)) {
            answerbtn.innerHTML = "Enter the correct answer before advancing.";
            answerbtn.disabled = true;
            return;
        } else {
            answerbtn.innerHTML = "Continue >>> (Enter)";
            answerbtn.disabled = false;
        }
    }
});
window.addEventListener("beforeunload", e => {
    let progress = Game.getProgress();
    if(progress.seen == 0 || progress.remaining == 0) return;
    let confirm = "Are you sure you want to leave learn mode and stop reviewing?";
    (e || window.event).returnValue = confirm;
    return confirm;
});