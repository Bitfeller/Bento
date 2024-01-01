<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Learn Picker</title>
    <?php require_once "../globalreqs.php"; ?>
    <link rel="stylesheet" href="../../css/learnPicker.css"/>
    <script type="module" src="../../sitejs/learnpicker.js" data-loading="true"></script>
</head>
<body data-uo="true">
    <?php require_once "../header.php"; ?>
    <div id="overall-container">
        <div id="left-div">
            <div class="big-box" id="mode-big-box">
                <h2>Learn Mode</h2>
                <div class="settings-container">
                    <div class="setting-box">
                        <input type="radio" name="mode" class="sb-radio mode" id="2" checked="true">
                        <p> Review terms that need to be reviewed </p>
                    </div>
                    <div class="setting-box">
                        <input type="radio" name="mode" class="sb-radio mode" id="1">
                        <p> Review select decks </p>
                    </div>
                </div>
            </div>
            <div class="big-box" id="deck-big-box">
                <h2>Deck Picker</h2>
                <span class="material-symbols-outlined" id="deckSelectAll">check_box_outline_blank</span>
                <div class="deck-container"></div>
            </div>
        </div>
        <div>
            <div class="big-box" id="settings-big-box">
                <h2>Repetition</h2>
                <div class="settings-container">
                    <div class="setting-box">
                        <input type="radio" name="repeat" class="sb-radio repeat" id="1">
                        <p>| Show a new term twice for repetition.</p>
                    </div>
                    <div class="setting-box">
                        <input type="radio" name="repeat" class="sb-radio repeat" id="2" checked="true">
                        <p>| Show a term only once for repetition.</p>
                    </div>
                </div>
            </div>
            <div class="big-box" id="settings-big-box">
                <h2>Shuffling</h2>
                <div class="settings-container">
                    <div class="setting-box">
                        <input type="radio" name="shuffle" class="sb-radio shuffle" id="1" checked="true">
                        <p>| Shuffle terms</p>
                    </div>
                    <div class="setting-box">
                        <input type="radio" name="shuffle" class="sb-radio shuffle" id="2">
                        <p>| Don't shuffle terms <i>(not recommended)</i></p>
                    </div>
                </div>
            </div>
            <div class="big-box" id="settings-big-box">
                <h2>Infinite Mode</h2>
                <div class="settings-container">
                    <div class="setting-box">
                        <input type="checkbox" name="infinite_mode" class="sb-radio infinite-mode">
                        <p class="infinite_mode_text">| Infinite Mode</p>
                    </div>
                </div>
            </div>
            <div class="big-box" id="settings-big-box">
                <h2>Assistive Tools </h2>
                <div class="settings-container">
                    <div class="setting-box">
                        <input type="checkbox" name="require_correct" class="sb-radio require_correct">
                        <p>| (Text only) Require correct answer before advancing</p>
                    </div>
                    <div class="setting-box">
                        <input type="checkbox" name="lazy_check" class="sb-radio lazy_check">
                        <p>| (Text only) Allow answers up to 2 characters off</p>
                    </div>
                </div>
            </div>
            <button id="reviewBtn"><h1>Review! →</h1></button>
            <p class="info-error" id="errmsg"></p>
        </div>
    </div>
    <button id="intertiaBtn">
        <img src="/img/space-ship.png" alt="Space Ship" id="inertia-btn">
    </button>
</body>
</html>
