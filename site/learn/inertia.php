<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bento | Inertia</title>
    <?php require_once "../globalreqs.php"?>
    <link rel="stylesheet" href="../../css/intertia.css"/>
    <script type="module" src="../../sitejs/inertia.js"></script>
</head>
<body data-uo="true">
    <?php require_once "../header.php"?>
    <div>
        <div id="left-div">
            <div>
                <h1>Inertia</h1>
                <div id="score-display">
                    <h2>Score: <h2 id="score">0</h2></h2>
                    <pre></pre>
                    <h2>Level: <h2 id="level">1</h2></h2>
                </div>
            </div>
            <div>
                <button id="pause"><h2>Pause</h2></button>
                <button id="restart"><h2>Restart</h2></button>
            </div>
        </div>
        <div id="right-div">
            <canvas id="game">
                <img src="/img/asteroid.png" alt="asteroid" id="asteroidImg">
            </canvas>
            <input id="input" type="text" placeholder="Answer Here...">
        </div>
    </div>
</body>
</html>