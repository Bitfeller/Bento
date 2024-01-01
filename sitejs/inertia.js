import { DeckGateway } from "../server/client-gateway/deck-gateway.js";
import { UserGateway } from "../server/client-gateway/user-gateway.js";
// import { Game } from "../main/library.js";

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
let deckData;
let asteroids = [];

let frameCount = 0;
let mainfn;
let score = 0;
let level = 1;

// Preset values
render.textAlign = "center";

function createAsteroid() {
    let speed = random(1, 2);
    let d_keys = Object.keys(deckData);
    let card = round(random(0, d_keys.length - 1));
    while(deckData[d_keys[card]].type == "ranking") {
        card = round(random(0, d_keys.length - 1));
    }
    card = deckData[d_keys[card]];
    card.q = d_keys[card];
    return new Asteroid(speed, card);
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
        asteroids.forEach((asteroid) => {
            render.drawImage(asteroidImg, asteroid.x, asteroid.y, 200, 200);
            render.font = "14px Kadwa";
            render.fillStyle = "black";
            render.fillText("❌🧀", asteroid.x + 100, asteroid.y+180);
            if (asteroid.y + 200 > height) {
                endGame();
            }
        });
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
        if(frameCount % (15 - level < 1 ? 1 : 15 - level) == 0) {
            asteroids.push(createAsteroid());
        }
        if(frameCount % 100 == 0) {
            level++;
            updateDisplay();
        }
    }, 100);
    requestAnimationFrame(frame);
}

function frame() {
    if(paused) return;
    if(ended) return;
    render.clearRect(0, 0, width, height);
    asteroids.forEach((asteroid) => {
        if(ended) return;
        asteroid.y += (asteroid.speed) + level;
        render.drawImage(asteroidImg, asteroid.x, asteroid.y, 200, 200);
        render.fillStyle = "rgb(255, 255, 255)";
        render.rect(asteroid.x, asteroid.y, 500, 500);
        render.font = "10px Kadwa";
        render.fillStyle = "black";
        render.fillText(asteroid.text, asteroid.x+100, asteroid.y+180);
        if(asteroid.y + 200 > height) {
            endGame();
        }
    });
    if(ended) return;
    requestAnimationFrame(frame);
}

class Asteroid {
    constructor(speed, card) {
        this.x = random(20, width-220);
        this.y = -200;
        this.speed = speed;
        this.answer = card.type !== "ranking" ? card.ans : "";
        this.text = card.q;
    }
}

(async () => {
    let [success, data] = await UserGateway.getuser();
    if (!success) return;
    const paramList = new URLSearchParams(window.location.search);
    if(!paramList.get("d")) {
        window.location.href = "/home";
        return;
    }
    [success, deck] = await DeckGateway.get(1);
    if (!success) {console.log(deck); window.location.href = "/home"; return}
    
    deckData = deck.data.contnt;
    gameStart();
    input.addEventListener("keyup", () => {
        asteroids.forEach((asteroid) => {
            if(input.value == asteroid.ans) {
                input.value = "";
                asteroids.splice(asteroids.indexOf(asteroid), 1);
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