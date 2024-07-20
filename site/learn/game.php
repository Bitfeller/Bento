<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bento | Learn</title>
    <link rel="stylesheet" href="../../css/game.css"/>
    <?php require_once "../globalreqs.php"?>
    <script type="module" src="../../sitejs/game.js"></script>
</head>
<body data-uo="true">
    <?php require_once "../header.php"?>    
    <div id="main">
        <div id="left"></div>
        <h2 id="problem"></h2>
        <div>
            <div id="a_container">
                <div id="cont_a"></div>
                <div id="ans_a"></div>
            </div>
            <button id="answerbtn">Answer</button>
            <div id="answer_info"></div>
        </div>
        <br>
    </div>
</body>
</html>