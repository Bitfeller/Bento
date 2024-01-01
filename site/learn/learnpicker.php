<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Learn Picker</title>
    <?php require_once "../globalreqs.php"?>
    <link rel="stylesheet" href="../../css/learnPicker.css"/>
    <script type="module" src="../../sitejs/learnpicker.js"> </script>
</head>
<body data-uo="true">
    <?php require_once "../header.php"?>
    <div id="overall-container">
        <div id="left-div">
            <div class="big-box" id="mode-big-box">
                <h2>Learn Mode</h2>
                <div class="settings-container">
                    <div class="setting-box">
                        <input type="radio" name="mode" class="sb-radio mode" id="1" checked="true">
                        <p> Review select decks </p>
                    </div>
                    <div class="setting-box">
                        <input type="radio" name="mode" class="sb-radio mode" id="2">
                        <p> Review terms that need to be reviewed </p>
                    </div>
                </div>
            </div>
            <div class="big-box" id="deck-big-box">
                <h2>Deck Picker</h2>
                <span class="material-symbols-outlined" id="deckSelectAll">select_all</span>
                <!-- select_all (on click) -> check_box (on uncertain) -> indeterminate_check_box -->
                <div class="deck-container">
                    <!-- <div class="deck-box">
                        <p>Deck 1</p>
                        <input type="checkbox" id="deck1Check">
                    </div> -->
                
                </div>
            </div>
        </div>
        <div>
            <div class="big-box" id="settings-big-box">
                <h2>Repetition</h2>
                <div class="settings-container">
                    <div class="setting-box">
                        <input type="radio" name="repeat" class="sb-radio repeat" id="1">
                        <p>| Show a new term twice for repetition. <i>[IF NEEDED]</i> </p> <!-- (Skip to the next term immediately) -->
                    </div>
                    <div class="setting-box">
                        <input type="radio" name="repeat" class="sb-radio repeat" id="2" checked="true">
                        <p>| Show a term only once for repetition.</p>
                    </div>
                    <!--  -->
                </div>
            </div>
            <div class="big-box" id="settings-big-box">
                <h2>Shuffling</h2>
                <div class="settings-container">
                    <div class="setting-box">
                        <input type="radio" name="shuffle" class="sb-radio shuffle" id="1" checked="true">
                        <p>| Shuffle terms <i>(recommended)</i> </p> <!-- (Skip to the next term immediately) -->
                    </div>
                    <div class="setting-box">
                        <input type="radio" name="shuffle" class="sb-radio shuffle" id="2">
                        <p>| Don't shuffle terms <i>(not recommended)</i></p>
                    </div>
                </div>
            </div>
            <button id="reviewBtn"><h1>Review! →</h1></button>
            <p class="info-error" id="errmsg"></p>
        </div>
    </div>
</body>
</html>