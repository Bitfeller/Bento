import { Game } from "./client-modules/game-library.js";
import { UserGateway } from "../server/client-gateway/user-gateway.js";

const percentCorrect = document.getElementById("percentageCorrect");
const numberCompleted = document.getElementById("numberCompleted");
const numberRemaining = document.getElementById("numberRemaining");
const question = document.getElementById("questionText");
const answer = document.getElementById("answers");

let requireCorrect = false;
let lazyCheck = false;

let data;

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

function refresh() {
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