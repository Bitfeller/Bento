import {Game} from "./library.js";

var problem = document.getElementById("problem");
var btn = document.getElementById("btn");
var getwrong = document.getElementById("getwrong");
Game.setDeck("data", function() {
    problem.innerHTML = Game.getProblem();
});
btn.addEventListener("mousedown", function() {
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
})