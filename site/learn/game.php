<?php $_X_UO = true; ?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bento | Learn</title>
    <link rel="stylesheet" href="../../css/learn/game.css"/>
    <?php require_once "../globalreqs.php"?>
    <script type="module" src="../../sitejs/game.js" data-loading="true"></script>
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
    <div id="progressNumbers" class="line-up-icons"></div>  
    <div id="main">
        <h2 id="problem"></h2>
        <div>
            <div id="a_container">
                <div id="cont_a"></div>
                <div id="ans_a"></div>
            </div>
            <button id="answerbtn">Answer</button>
            <div id="answer_marker" class="line-up-icons">
                Mark Answer as Correct (Space) <span class="material-symbols-outlined">chevron_right</span>
            </div>
            <div id="reshow_marker" class="line-up-icons">
                Reshow Question (R) <span class="material-symbols-outlined">chevron_right</span>
            </div>
        </div>
        <div id="answer_info"></div>
    </div>
    <div id="progressBar"></div>
</body>
</html>