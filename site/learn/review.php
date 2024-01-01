<?php $_X_UO = true; ?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bento | Learn</title>
    <link rel="stylesheet" href="../../css/review.css"/>
    <?php require_once "../globalreqs.php"?>
    <script type="module" src="../../sitejs/review.js" data-loading="true"></script>
    <!-- MathJax -->
    <script>
        window.MathJax = {
            tex: {
                inlineMath: [['$', '$'], ['\\(', '\\)']],
                displayMath: []
            },
            svg: {
                fontCache: 'global',
                scale: 1,
            },
            startup: {}
        };
    </script>
    <script type="text/javascript" async src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-svg.js"></script>
</head>
<body>
    <?php require_once "../header.php"?>
    <div class="progress-display">
        <div id="progressBar"></div>
        <div class="progress-icons">
            <span class="line-up-icons">
                <span id="percentageCorrect">0</span>
                <span class="material-symbols-outlined">percent</span>
            </span>
            <span class="line-up-icons">
                <span id="numberCompleted">0</span>
                <span class="material-symbols-outlined">check</span>
            </span>
            <span class="line-up-icons">
                <span id="numberRemaining">0</span>
                <span class="material-symbols-outlined">box</span>
            </span>
        </div>
    </div>
    <div class="review-container">
        <div id="question">
            <!-- Just text -->
            <!-- <span id="questionText">
                Example question here.
                This is a matching question which has several fill in the 
            </span> -->

            <!-- Text and picture -->
            <span id="questionText">
                Example question here.
                This is a matching question which has several fill in the   
            </span>
            <!-- <img id="questionImage" src="https://cdn.mos.cms.futurecdn.net/42E9as7NaTaAi4A6JcuFwG.jpg" alt="Question Image"> -->
        </div>
        <div id="answers">
            <!-- Continue Button -->
            <!-- <button id="continueButton">
                Continue?
            </button> -->

            <!-- Text -->
            <!-- <input type="text" id="answerText" placeholder="Type your answer here..." autocomplete="off"> -->

            <!-- Multiple Choice -->
            <!-- <div class="mc-option">The Correct Answer</div>
            <div class="mc-option">Less correct answer</div>
            <div class="mc-option">A very not correct answer that also happens to be longA very not correct answer that also happens to be long</div>
            <div class="mc-option">A not correct answer</div>
            <div class="mc-option">A not correct answer</div>
            <div class="mc-option">A not correct answer</div> -->

            <!-- Ranking -->
            <!-- <div class="ranking-option">Is the best or something</div>
            <div class="ranking-option">Is the worst or something</div>
            <div class="ranking-option">Is not the worst or something</div> -->

            <!-- Matching -->
            <!-- <div class="matching-option">1. This goes here</div>
            <div class="matching-option">2. This goes there</div>
            <div class="matching-option">3. That goes where?</div> -->

            <!-- More?! -->
        </div>
        <div id="answerInfo">
            Please input a valid answer
        </div>
        <div class="answer-options">
                <span id="reshow">
                    Show Question Again <span class="shortcut">R</span>
                </span>
                <span id="markCorrect">
                    Mark Answer as Correct <span class="shortcut">_</span>
                </span>
        </div>
        <!-- 
            Multiple choice:
                right: option chose appears correct
                wrong: option chose appears incorrect, correct option appears correct
            Ranking:
                right: all answers briefly flash correct
                wrong: answers rearrange themselves to correct order, those in incorrect order are marked incorrect, others correct
            Matching:
                right: all answers briefly flash correct
                wrong: correct answers appear correct, incorect answers show selected option in incorrect and correct together
            Text:
                right: answer appears correct 
                wrong: the correct answer appears below
                
        -->

    </div>
</body>