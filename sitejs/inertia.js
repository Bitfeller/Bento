import { DeckGateway } from "../server/client-gateway/deck-gateway.js";
import { UserGateway } from "../server/client-gateway/user-gateway.js";

let random = (a, b) => Math.floor(Math.random() * (b - a) + a + 0.5);
let round = a => Math.floor(a + 0.5);

const input = document.getElementById("input");
const pause = document.getElementById("pause");
const restart = document.getElementById("restart");
const asteroidImg = document.getElementById("asteroidImg");
const canvas = document.getElementById("game");
const render = canvas.getContext("2d");
const scoreEl = document.getElementById("score");
const levelEl = document.getElementById("level");
let width, height;

window.onresize = () => {
    width = window.innerWidth * 0.7 * devicePixelRatio;
    height = (window.innerHeight - 63) * devicePixelRatio;
    canvas.width = width;
    canvas.height = height;
};
window.onresize();

let paused = false, ended = false, frameCount = 0;
let deck;
let deckData = [];
let asteroids = [];
let mainfn;
let score = 0, level = 1;

// Preset values
render.textAlign = "center";

function createAsteroid() {
    let q = round(random(0, deckData.length - 1));
    return new Asteroid(deckData[q]);
}
function updateDisplay() {
    scoreEl.innerHTML = score;
    levelEl.innerHTML = level;
}
function endGame() {
    asteroids = [];
    ended = true;
    window.clearInterval(mainfn);
    render.clearRect(0, 0, width, height);
    render.font = "30px Kadwa";
    render.fillStyle = "red";
    render.fillText("Game Over!", width/2, height / 2);
    updateDisplay();
}

function pauseGame() {
    if(ended) return;
    paused = !paused;
    if(paused) 
        asteroids.forEach(ast => ast.render());
    else 
        requestAnimationFrame(frame);
}
function gameStart() {
    mainfn = window.setInterval(() => {
        frameCount++;
        if(paused) return;
        if(ended) return;
        if(frameCount % (30 - level < 1 ? 1 : (30 - level) * 3) == 0) 
            asteroids.push(createAsteroid());
        if(frameCount % 100 == 0) {
            level++;
            updateDisplay();
        }
    }, 100);
    requestAnimationFrame(frame);
}

function wrapText(str, maxWidth) {
    const words = str.split(' ');
    let line = '';
    let lines = [];
    for(let word of words) {
        let testLine = line + (line.length > 0 ? ' ' : '') + word;
        let width = render.measureText(testLine).width;
        if(width > maxWidth) {
            lines.push(line);
            line = word;
        } else 
            line = testLine;
    }
    lines.push(line);
    return lines;
}

function frame() {
    if(paused || ended) return;
    render.clearRect(0, 0, width, height);
    asteroids.forEach(ast => ast.render());
    if(ended) return;
    requestAnimationFrame(frame);
}

class Asteroid {
    constructor(card) {
        this.x = random(0, width - 520);
        this.y = -550;
        this.speed = random(1, 1.5) * (level / 2);
        this.q = card.q;
        this.answer = card.type == "txt" ? card.ans : [];
        if(card.type == "mc")
            for(let i = 0; i < card.ans.length; i++) 
                this.answer.push(card.op[card.ans[i]]);
        this.wrappedText = wrapText(this.q, 100);
    }
    render() {
        if(ended) return;
        if(paused) {
            render.drawImage(asteroidImg, this.x, this.y, 500, 500);
            render.font = "14px Kadwa";
            render.fillStyle = "black";
            render.fillText("❌🧀", this.x + 250, this.y + 450);
            if (this.y + 500 > height) 
                endGame();
            return;
        }
        this.y += this.speed;
        render.drawImage(asteroidImg, this.x, this.y, 500, 500);
        render.fillStyle = "rgb(255, 255, 255)";
        render.rect(this.x, this.y, 500, 500);
        render.font = "10px Kadwa";
        render.fillStyle = "black";
        for(let i = 0; i < this.wrappedText.length; i++) 
            render.fillText(this.wrappedText[i], this.x + 250, this.y + 430 + i * 15);
        if(this.y + 200 > height) 
            endGame();
    }
}

(async () => {
    let [success, user] = await UserGateway.getuser(false, true, true, false);
    if (!success) return;
    const paramList = new URLSearchParams(window.location.search);
    if(!paramList.get("ds")) 
        return void (window.location.href = "/home");
    
    let decks = paramList.get("ds").split(",");
    decks.forEach((val, idx) => decks[idx] = parseInt(val));
    let ntronly = parseFloat(paramList.get("m")) == 1;
    let randomTerms = parseFloat(paramList.get("sh")) == 1;

    // Unsanitize
    user.userdata.reviews = window.lib.recur_decode(user.userdata.reviews);

    let deckContnt = [];
    let updateReviews = false;
    for(let i = 0; i < decks.length; i++) {
        let [success, data] = await DeckGateway.get(decks[i], true, false);
        if(!success) {
            console.log(data);
            window.location.href = "/home";
            return;
        }
        let userReview = user.userdata.reviews[deck];
        if(!userReview) {
            // Doesn't exist in our reviews? interesting... regardless, might as well add it if for some reason specified...?
            userReview = {};
            user.userdata.reviews[deck] = userReview;
            let json = JSON.stringify(user.userdata.reviews);
            await UserGateway.editUser("reviews", json);
        }
        let updateIdx = false;
        let r_keys = Object.keys(userReview);
        for(let i = 0; i < r_keys.length; i++) {
            let userCard = userReview[r_keys[i]];
            let [q, last, box] = [userCard.q, userCard.last, userCard.box];
            let deckCard = data.data.contnt[q];
            if(!deckCard) {
                delete userReview[r_keys[i]];
                updateReviews = true;
                updateIdx = true;
            }
            if(ntronly && !UserGateway.calculateNTR(box, last)) 
                delete data.data.contnt[q];
        }
        if(updateIdx) 
            user.userdata.reviews[deck] = userReview;
        let d_keys = Object.keys(data.data.contnt);
        let datalist = [];
        for(let i = 0; i < d_keys.length; i++) {
            data.data.contnt[d_keys[i]].q = d_keys[i];
            data.data.contnt[d_keys[i]].d_id = decks[i];
            datalist.push(data.data.contnt[d_keys[i]]);
        }
        deckContnt.push(datalist);
    }
    if(updateReviews) {
        let json = JSON.stringify(user.userdata.reviews);
        await UserGateway.editUser("reviews", json);
    }
    // Add terms to deckContnt
    for(let i = 0; i < deckContnt.length; i++)
        for(let j = 0; j < deckContnt[i].length; j++)
            if(deckContnt[i][j].type != "ranking" && deckContnt[i][j].type != "mtch") 
                deckData.push(deckContnt[i][j]);
    // Scramble terms if needed
    if(randomTerms == true) {
        let save = deckData;
        deckData = [];
        while(save.length > 0) {
            let idx = random(0, save.length - 1);
            deckData.push(save[idx]);
            save.splice(idx, 1);
        }
    }
    
    input.addEventListener("keyup", () => {
        asteroids.forEach((asteroid, idx) => {
            for(let i = 0; i < asteroid.answer.length; i++) {    
                if(input.value.toLowerCase().replaceAll(/\s/g, "") == asteroid.answer[i].toLowerCase().replaceAll(/\s/g, "")) {
                    input.value = "";
                    asteroids.splice(idx, 1);
                    score++;
                    updateDisplay();
                }
            }
        })
    });
    pause.addEventListener("mousedown", pauseGame);
    restart.addEventListener("mousedown", () => window.location.reload());
    window.LOADED();
    gameStart();
})();