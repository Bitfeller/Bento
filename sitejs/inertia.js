import { DeckGateway } from "../main/deck_gateway.js";
import { UserGateway } from "../main/user_gateway.js";
// import { Game } from "../main/library.js";

function random(a, b) {
    return Math.floor(Math.random() * (b - a) + a + 0.5);
}

let running = false;
let paused = false;
let currentDeck;
let deck;
let deckKeys;
let asteroids = [];

let counter = 0;
let score = 0;
let level = 1;

function createAsteroid() {
    let speed = random(1, 2);
    let questionNumber = deckKeys[random(0, deckKeys.length-1)];
    return new Asteroid(speed, questionNumber);
}

function updateDisplay () {
    document.getElementById("score").innerHTML = score;
    document.getElementById("level").innerHTML = level;
}

function endGame () {
    if (!paused) {
        render.font = "30px Kadwa";
        render.fillStyle = "red";
        render.clearRect(0, 0, gameElement.width, gameElement.height);
        render.fillText("Game Over", gameElement.width/2-100, gameElement.height/2);
    
        let counter = 0;
        let score = 0;
        let level = 1;
        updateDisplay();
    }
}

function pauseGame () {
    if (running === true) {
        paused = true;
        running = false;
        asteroids.forEach((asteroid) => {
            render.drawImage(asteroidImg, asteroid.x, asteroid.y, 200, 200);
            render.font = "14px Kadwa";
            render.fillStyle = "black";
            render.fillText("❌🧀", asteroid.x+80, asteroid.y+180);
            if (asteroid.y > 0) {
                running = false;
            }
        });
    } else {
        running = true;
        gameStart();
    }
}

function gameStart () {
    if (!running) {return};
    setInterval(() => {
        counter++;
        if (counter % 10 == 0) {
            level++;
            updateDisplay();
        }
        asteroids.push(createAsteroid());
    }, 5000+(5000*(-level/30)));
    gameFrame();
}

function gameFrame () {
    if (!running) {
        endGame();
        return;
    };
    render.clearRect(0, 0, gameElement.width, gameElement.height);
    asteroids.forEach((asteroid) => {
        asteroid.y += (asteroid.speed/20)+counter/10;
        render.drawImage(asteroidImg, asteroid.x, asteroid.y, 200, 200);
        render.font = "10px Kadwa";
        render.fillStyle = "black";
        render.fillText(asteroid.text, asteroid.x+80, asteroid.y+180);
        if (asteroid.y > 0) {
            running = false;
        }
    });
    requestAnimationFrame(gameFrame);
}

class Asteroid {
    constructor(speed, questionNumber) {
        this.x = random(0, gameElement.width-100);
        this.y = -(gameElement.height)-300;
        this.speed = speed;
        if (deck[questionNumber].type === "ranking") {
            this.answer = deck[questionNumber].answer[0];
        } else {
            this.answer = deck[questionNumber].correctAnswer;
        }
        this.text = deck[questionNumber].question;
    }
}

const input = document.getElementById("input");
const pause = document.getElementById("pause");
const restart = document.getElementById("restart");
const asteroidImg = document.getElementById("asteroidImg");
const gameElement = document.getElementById("game");
const render = gameElement.getContext("2d");

(async () => {
    let [success, data] = await UserGateway.getuser();
    if (!success) {console.error(data); return}
    [success, currentDeck] = await DeckGateway.get(1);
    if (!success) {console.error(currentDeck); return}

    deck = currentDeck.data.deckData;
    deckKeys = Object.keys(deck);
    running = true;
    gameStart();
})();

input.onkeyup = (e) => {
    if (!running) {return};
    asteroids.forEach((asteroid) => {
        if (input.value == asteroid.answer) {
            input.value = "";
            asteroids.splice(asteroids.indexOf(asteroid), 1);
            score++;
            updateDisplay();
        }
    });
}

pause.onclick = function() {
    pauseGame();
}

restart.onclick = function() {
    endGame();
    running = true;
    gameStart();
}