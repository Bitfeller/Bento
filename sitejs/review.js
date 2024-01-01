import { Game } from "./client-modules/game-library.js";
import { UserGateway } from "../server/client-gateway/user-gateway.js";

const percentCorrect = document.getElementById("percentageCorrect");
const numberCompleted = document.getElementById("numberCompleted");
const numberRemaining = document.getElementById("numberRemaining");
const question = document.getElementById("questionText");
const answer = document.getElementById("answers");
const answerInfo = document.getElementById("answerInfo");

let requireCorrect = false;
let lazyCheck = false;

let data;
let answers = [];

// Rendering or something idk dont as me
let r_temp = document.createElement('div');
r_temp.style.visibility = 'hidden';
document.body.appendChild(r_temp);

// Time
let startTick = -1;
let endTick = -1;

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
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
    } catch(_) {
        return false;
    }
}
function showDisplay(msg) {
    answerInfo.innerHTML = msg;
    answerInfo.style.display = "block";
}
function hideDisplay() {
    console.log("Hiding display");
    answerInfo.style.display = "none";
}
function showCorrect() {
    answerInfo.innerHTML = "Correct!";
    answerInfo.classList.add("correct");
    answerInfo.style.display = "block";
    window.setTimeout(() => {
        answerInfo.style.display = "none";
        answerInfo.classList.remove("correct");
    }, 1000);
}
function showContinue(text = "Continue") {
    let continueButton = answer.appendChild(document.createElement("button"));
    continueButton.innerHTML = text;
    continueButton.id = "continueButton";

    window.addEventListener("keydown", (e) => {
        if(e.key == "Enter" && document.getElementById("continueButton")) {
            let continueButton = document.getElementById("continueButton");
            e.preventDefault();
            continueButton.click();
        }
    });

    continueButton.addEventListener("click", (e) => {
        Game.continue();
        continueButton.remove();
        refresh();
    });
}

function refresh() {
    

    if(Game.isDead()) {
        // Handle dead game state
    }

    for(let i = 0; i < answers.length; i++) answers[i].remove();
    data = Game.fetchProblem();
    question.innerHTML = data.q;
    typeset(question);

    startTick = Date.now();

    switch (data.type) {
        case "txt":
            let input = answer.appendChild(document.createElement("input"));
            input.id = "answerText"
            input.type = "text";
            input.placeholder = "Type your answer...";
            input.autofocus = true;
            input.focus();

            answers.push(input);

            input.addEventListener("keydown", e => {
                if(e.key == "Enter") {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    answerHandler();
                }
            });

            // input.addEventListener('keyup', async () => {
            //     if(await renderable(input.value) && input.value.match(/\$[^$]*\$/g)) showDisplay(input.value); 
            //         else hideDisplay();
            // });

            break;
        case "mc":
            // Handle multiple choice question
            break;
        case "ranking":
            // Handle ranking question
            break;
        case "match":
            // Handle matching question
            break;
    }
}
function answerHandler() {
    if (Game.isDead()) window.location.href = "/home?l=lm&s=1";

    let correct = false;
    switch (data.type) {
        case "txt":
            if(answers[0].value.trim() === "") {
                showDisplay("Please enter an answer.");
                window.setTimeout(() => hideDisplay(), 1000);
                return;
            }

            if(lazyCheck) correct = Game.isLazyCorrect(answers[0].value.toLowerCase().trim());
            else correct = Game.isCorrect(answers[0].value.toLowerCase().trim());

            if(correct) {
                Game.registerTick(Date.now() - startTick);
                Game.continue();

                answers[0].classList.add("correct");
                answers[0].disabled = true;

                showCorrect();
                refresh();
            } else {
                answers[0].classList.add("incorrect");

                let correctAnswer = answer.appendChild(document.createElement("input"));
                correctAnswer.id = "answerText";
                correctAnswer.classList.add("correct");
                correctAnswer.type = "text";
                correctAnswer.disabled = true;
                correctAnswer.value = window.lib.recur_decode(data.ans.join(" • "));

                answers.push(correctAnswer);

                if(requireCorrect) {
                    showDisplay("Enter the correct answer to continue.");
                    answers[0].value = "";
                } else {
                    answers[0].readOnly = true;
                    answers[0].blur();

                    showContinue();
                }
            }
        break;
    }
}

(async () => {
    let [success, _] = await UserGateway.getuser(false, false, false, false);
    if (!success) return;
    const paramList = new URLSearchParams(window.location.search);
    if (!paramList.get("ds")) return window.location.href = "/home";
    let dsVal = paramList.get("ds").split(",");
    dsVal.forEach((val, idx) => dsVal[idx] = parseInt(val));
    let m = parseFloat(paramList.get("m")) ?? 0;
    let r = parseFloat(paramList.get("r")) ?? 0;
    let sh = parseFloat(paramList.get("sh")) ?? 1;
    let i = parseFloat(paramList.get("i")) ?? 0;
    let rc = parseFloat(paramList.get("rc")) ?? 0;
    let lc = parseFloat(paramList.get("lc")) ?? 0;
    await Game.init(dsVal, {
        NTRonly: m == 1 ? true : false,
        randomTerms: sh == 1 ? true : false,
        deckSize: 8,
        cardRepeat: r == 1 ? 2 : 1,
        infinite_mode: i == 1 && m != 1 ? true : false,
        deckdistr: [6, 1, 1]
    });
    if (rc == 1) requireCorrect = true;
    if (lc == 1) lazyCheck = true;

    refresh();
    window.LOADED();
})();