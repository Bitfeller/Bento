import {Game} from "./library.js";

var problem = document.getElementById("problem");
var cont_a = document.getElementById("cont_a");
var answerbtn = document.getElementById("answerbtn");
var fillBar = document.getElementById("fill-bar");

var objs = [];
var selected;

function refresh() {
    if(Game.isActive() === false) {
        problem.innerHTML = "You completed Bento's Learn!";
        for(var i = 0; i < objs.length; i++) {
            objs[i].remove();
        }
        selected = undefined;
        return;
    }
    var data = Game.getProblemData();
    problem.innerHTML = data.question;
    for(var i = 0; i < objs.length; i++) {
        objs[i].remove();
    }
    objs = [];
    console.log(objs);
    selected = undefined;
    switch(data.type) {
        case "selection":
            for(var i = 0; i < data.answers.length; i++) {
                var op_i = document.createElement("button");
                op_i.className = "option";
                op_i.innerHTML = data.answers[i];
                op_i.id = "not-select";
                op_i.setAttribute("i", i);
                op_i.addEventListener("mousedown", function() {
                    if(selected) {
                        selected.id = "not-select";
                    }
                    selected = this;
                    selected.id = "select";
                });
                objs.push(op_i);
                cont_a.appendChild(op_i);
            }
        break;
        case "input":
            var input = document.createElement("input");
            input.type = "text";
            input.className = "op-input";
            input.placeholder = "Enter an answer here...";
            objs.push(input);
            cont_a.appendChild(input);
        break;
        case "timeline":

        break;
        case "matching":

        break;
    }
    var progress = Game.getProgress();
    fillBar.style.width = (100 * progress.current / progress.max) + "%";
}

Game.setDeck("data", refresh);
answerbtn.addEventListener("mousedown", function() {
    if(Game.isActive() !== false) {
        var data = Game.getProblemData();
        var correct = false;
        switch(data.type) {
            case "selection":
                if(!selected) {
                    answerbtn.innerHTML = "No answer provided!";
                    window.setTimeout(function() {answerbtn.innerHTML = "Answer";}, 1000);
                    return;
                }
                correct = Game.answerProblem(parseInt(selected.getAttribute("i")));
                if(correct) {
                    answerbtn.innerHTML = "Correct!";
                    window.setTimeout(function() {answerbtn.innerHTML = "Answer";}, 1000);
                } else {
                    answerbtn.innerHTML = "Wrong!";
                    window.setTimeout(function() {answerbtn.innerHTML = "Answer";}, 1000);
                }
                refresh();
            break;
            case "input":
                console.log(objs[0]);
                if(objs[0].value === "") {
                    answerbtn.innerHTML = "No answer provided!";
                    window.setTimeout(function() {answerbtn.innerHTML = "Answer";}, 1000);
                    return;
                }
                correct = Game.answerProblem(objs[0].value.toLowerCase());
                if(correct) {
                    answerbtn.innerHTML = "Correct!";
                    window.setTimeout(function() {answerbtn.innerHTML = "Answer";}, 1000);
                } else {
                    answerbtn.innerHTML = "Wrong!";
                    window.setTimeout(function() {answerbtn.innerHTML = "Answer";}, 1000);
                }
                refresh();
            break;
            case "timeline":

            break;
            case "matching":

            break;
        }
    }
})
/*btn.addEventListener("mousedown", function() {
    if(Game.isActive() === false) {
        switch(Game.getMode()) {
            case Game.modes.Selection:
                
            break;
            case Game.modes.Input:

            break;
            case Game.modes.Timeline:

            break;
            case Game.modes.Matching:

            break;
        }
    }
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
})*/