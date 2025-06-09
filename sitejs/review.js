import { Game } from "./client-modules/game-library.js";
import { UserGateway } from "../server/client-gateway/user-gateway.js";

const percentCorrect = document.getElementById("percentageCorrect");
const numberCompleted = document.getElementById("numberCompleted");
const numberRemaining = document.getElementById("numberRemaining");

const question = document.getElementById("questionText");
const answer = document.getElementById("answers");

const answerInfo = document.getElementById("answerInfo");
const answerOptions = document.getElementsByClassName("answer-options")[0];

const reshowButton = document.getElementById("reshow");
const markCorrectButton = document.getElementById("markCorrect");

let requireCorrect = false;
let lazyCheck = false;

let data;
let answers = [];

// Rendering or something idk dont ask me
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
    answerInfo.style.height = "30px";
    answerInfo.style.padding = "5px 20px";
}
async function hideDisplay() {
    answerInfo.style.padding = "0px 20px";
    answerInfo.style.borderWidth = "0px 3px"
    answerInfo.style.height = "0";
}
function showCorrect() {
    answerInfo.classList.add("correct");
    showDisplay("Correct!");

    window.setTimeout(() => {
        hideDisplay();
        window.setTimeout(() => answerInfo.classList.remove("correct"), 1500);
    }, 700);
}
function showContinue(text = `Continue <span class="shortcut">Enter</span>`) {
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
function showOptions() {
    answerOptions.style.display = "flex";
}
function hideOptions() {
    answerOptions.style.display = "none";
}

function refresh() {
    document.getElementById("continueButton")?.remove();
    hideOptions();

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

            input.addEventListener('keyup', async () => {
                if(await renderable(input.value) && input.value.match(/\$[^$]*\$/g)) {
                    showDisplay(input.value);
                    typeset(answerInfo);
                };
            });

            break;
        case "mc":
            data.op.forEach(async (e) => {
                let option = answer.appendChild(document.createElement("div"));
                option.classList.add("mc-option");
                option.innerHTML = e;

                if(await renderable(option.innerHTML) && option.innerHTML.match(/\$[^$]*\$/g)) {
                        typeset(answerInfo);
                }

                option.addEventListener("click", () => {
                    option.id = "selectedOption";
                    answerHandler();
                });

                answers.push(option);
            });
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
    
    showOptions();

    let correct = false;
    switch (data.type) {
        case "txt":
            if(answers[0].value.trim() === "") {
                showDisplay("Please enter an answer.");
                window.setTimeout(() => hideDisplay(), 1500);
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
        case "mc":
            let selectedIndex;
            for(let i = 0; i < answers.length; i++) {
                if(answers[i].id == "selectedOption") {
                    selectedIndex = i;
                }
            }
            correct = Game.isCorrect(selectedIndex);

            if (correct) {
                Game.registerTick(Date.now() - startTick);
                Game.continue();

                answers[selectedIndex].classList.add("correct");
                window.setTimeout(() => {}, 1000);

                showCorrect();
                refresh();
            } else {
                answers[selectedIndex].classList.add("mc-incorrect");

                let correctAnswer;
                for(let i = 0; i < answers.length; i++) {
                    if(Game.isCorrect(i)) {
                        correctAnswer = answers[i];
                        break;
                    }
                }

                correctAnswer.classList.add("mc-correct");
                if (requireCorrect) {
                    correctAnswer.addEventListener("click", () => {
                        refresh();
                    });
                    showDisplay("Select the correct answer to continue.");
                    answers[selectedIndex].id = "";
                } else {
                    showContinue();
                }
            }
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

reshowButton.addEventListener("click", () => {
    Game.registerTick(endTick - startTick);
    Game.reshow();
    refresh();
});
markCorrectButton.addEventListener("click", () => {
    Game.markCorrect();
    Game.registerTick(endTick - startTick);
    Game.continue();
    refresh();
});
window.addEventListener("keyup", (e) => {
    if(e.key == "r" && document.getElementById("reshow")) {
        e.preventDefault();
        reshowButton.click();
    }
});
window.addEventListener("keyup", (e) => {
    if(e.key == " " && document.getElementById("markCorrect")) {
        e.preventDefault();
        markCorrectButton.click();
    }
});
window.addEventListener("keyup", (e) => {
    if(e.key == "Enter" && document.getElementById("continueButton")) {
        let continueButton = document.getElementById("continueButton");
        e.preventDefault();
        continueButton.click();
    }
});