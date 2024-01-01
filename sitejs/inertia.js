import { DeckGateway } from "../server/client-gateway/deck-gateway.js";
import { UserGateway } from "../server/client-gateway/user-gateway.js";

function random(a, b) {
    return Math.floor(Math.random() * (b - a) + a + 0.5);
}
function round(a) {
    return Math.floor(a + 0.5);
}

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

let paused = false;
let ended = false;
let deck;
let deckData = [];
let asteroids = [];

let frameCount = 0;
let mainfn;
let score = 0;
let level = 1;

// Preset values
render.textAlign = "center";

function createAsteroid() {
    let q = round(random(0, deckData.length - 1));
    while(deckData[q].type == "ranking") {
        q = round(random(0, deckData.length - 1));
    }
    let card = deckData[q];
    return new Asteroid(card);
}

function updateDisplay () {
    scoreEl.innerHTML = score;
    levelEl.innerHTML = level;
}

function endGame () {
    asteroids = [];
    ended = true;
    window.clearInterval(mainfn);
    render.clearRect(0, 0, width, height);
    render.font = "30px Kadwa";
    render.fillStyle = "red";
    render.fillText("Game Over!", width/2, height / 2);
    updateDisplay();
}

function pauseGame () {
    if(ended) return;
    if(!paused) {
        paused = true;
        asteroids.forEach((ast) => ast.render());
    } else {
        paused = false;
        requestAnimationFrame(frame);
    }
}

function gameStart () {
    mainfn = window.setInterval(() => {
        frameCount++;
        if(paused) return;
        if(ended) return;
        if(frameCount % (15 - level < 1 ? 1 : (15 - level) * 3) == 0) {
            asteroids.push(createAsteroid());
        }
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
        } else line = testLine;
    }
    lines.push(line);
    return lines;
}

function frame() {
    if(paused || ended) return;
    render.clearRect(0, 0, width, height);
    asteroids.forEach((ast) => ast.render());
    // if(paused) return;
    // if(ended) return;
    // asteroids.forEach((asteroid) => {
    //     if(ended) return;
    //     asteroid.y += (asteroid.speed) + level;
    //     render.drawImage(asteroidImg, asteroid.x, asteroid.y, 500, 500);
    //     render.fillStyle = "rgb(255, 255, 255)";
    //     render.rect(asteroid.x, asteroid.y, 500, 500);
    //     render.font = "10px Kadwa";
    //     render.fillStyle = "black";
    //     let text = wrapText(asteroid.text + " btw this is some extra text that is right here", 100);
    //     for(let i = 0; i < text.length; i++) {
    //         render.fillText(text[i], asteroid.x + 250, asteroid.y + 400 + i * 15);
    //     }
    //     if(asteroid.y + 200 > height) {
    //         endGame();
    //     }
    // });
    if(ended) return;
    requestAnimationFrame(frame);
}

class Asteroid {
    constructor(card) {
        this.x = random(0, width - 520);
        this.y = -550;
        this.speed = random(1, 1.5) * (level / 2);
        this.q = card.q;
        this.answer = card.type != "ranking" ? card.ans : "";
        this.wrappedText = wrapText(this.q, 100);
    }
    render() {
        if(ended) return;
        if(paused) {
            render.drawImage(asteroidImg, this.x, this.y, 500, 500);
            render.font = "14px Kadwa";
            render.fillStyle = "black";
            render.fillText("❌🧀", this.x + 250, this.y + 450);
            if (this.y + 500 > height) endGame();
            return;
        }
        this.y += this.speed;
        render.drawImage(asteroidImg, this.x, this.y, 500, 500);
        render.fillStyle = "rgb(255, 255, 255)";
        render.rect(this.x, this.y, 500, 500);
        render.font = "10px Kadwa";
        render.fillStyle = "black";
        for(let i = 0; i < this.wrappedText.length; i++) {
            render.fillText(this.wrappedText[i], this.x + 250, this.y + 430 + i * 15);
        }
        if(this.y + 200 > height) endGame();
    }
}

(async () => {
    let [success, user] = await UserGateway.getuser();
    if (!success) return;
    const paramList = new URLSearchParams(window.location.search);
    if(!paramList.get("ds")) {
        window.location.href = "/home";
        return;
    }
    
    let decks = paramList.get("ds").split(",");
    decks.forEach((val, idx) => {
        decks[idx] = parseInt(val);
    });
    let ntronly = parseFloat(paramList.get("m")) == 1 ? true : false;
    let randomTerms = parseFloat(paramList.get("sh")) == 1 ? true : false;

    let deckContnt = [];
    let updateReviews = false;
    for(let i = 0; i < decks.length; i++) {
        let [success, data] = await DeckGateway.get(decks[i]);
        if(!success) {
            console.log(data);
            window.location.href = "/home";
            return;
        }
        let userReview = user.reviews[deck];
        if(!userReview) {
            // Doesn't exist in our reviews? interesting... regardless, might as well add it if for some reason specified...?
            userReview = {};
            user.reviews[deck] = userReview;
            let json = JSON.stringify(user.reviews);
            await UserGateway.editUser("reviews", json);
        }
        let updateIdx = false;
        let r_keys = Object.keys(userReview);
        for(let i = 0; i < r_keys.length; i++) {
            let userCard = userReview[r_keys[i]];
            let q = r_keys[i];
            let last = userCard.last;
            let box = userCard.box;
            let deckCard = data.data.contnt[q];
            if(ntronly && deckCard) {
                let ntr = UserGateway.calculateNTR(box, last);
                if(!ntr) delete data.data.contnt[q];
            }
            if(!deckCard) {
                delete userReview[r_keys[i]];
                updateReviews = true;
                updateIdx = true;
            }
        }
        if(updateIdx) user.reviews[deck] = userReview;
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
        let json = JSON.stringify(user.reviews);
        await UserGateway.editUser("reviews", json);
    }
    // Add terms to deckContnt
    for(let i = 0; i < deckContnt.length; i++) {
        for(let j = 0; j < deckContnt[i].length; j++) {
            deckData.push(deckContnt[i][j]);
        }
    }
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
    
    gameStart();
    input.addEventListener("keyup", () => {
        asteroids.forEach((asteroid, idx) => {
            if(input.value.toLowerCase().replaceAll(/\s/g, "") == asteroid.answer.toLowerCase().replaceAll(/\s/g, "")) {
                input.value = "";
                asteroids.splice(idx, 1);
                score++;
                updateDisplay();
            }
        })
    });
    pause.addEventListener("mousedown", pauseGame);
    restart.addEventListener("mousedown", () => {
        score = 0;
        level = 1;
        asteroids = [];
        frameCount = 0;
        paused = false;
        ended = false;
    });
})();