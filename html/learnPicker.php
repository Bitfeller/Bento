<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Learn Picker</title>
    <?php require_once "globalReqs.php"?>
    <link rel="stylesheet" href="/css/learnPicker.css"/>
    <script type="module" src="/js/learnpicker.js"> </script>
</head>
<body>
    <?php require_once "header.php"?>
    <div id="overall-container">
        <div class="big-box">
            <h2>Deck Picker</h2>
            <span class="material-symbols-outlined" id="deckSelectAll">select_all</span>
            <!-- select_all (on click) -> check_box (on uncertain) -> indeterminate_check_box -->
            <div id="deck-container">
                <!--<div class="deck-box">
                    <p>Deck 1</p>
                    <input type="checkbox" id="deck1Check">
                </div>
                <div class="deck-box">
                    <p>Deck 2</p>
                    <input type="checkbox" id="deck2Check">
                </div>
                <div class="deck-box">
                    <p>Deck 3</p>
                    <input type="checkbox" id="deck3Check">
                </div>
                <!-- Example decks to test overflow --\>
                <div class="deck-box">
                    <p>Deck 1</p>
                    <input type="checkbox">
                </div>
                <div class="deck-box">
                    <p>Deck 2</p>
                    <input type="checkbox">
                </div>
                <div class="deck-box">
                    <p>Deck 3</p>
                    <input type="checkbox">
                </div>
                <div class="deck-box">
                    <p>Deck 1</p>
                    <input type="checkbox">
                </div>
                <div class="deck-box">
                    <p>Deck 2</p>
                    <input type="checkbox">
                </div>
                <div class="deck-box">
                    <p>Deck 3</p>
                    <input type="checkbox">
                </div>
                <div class="deck-box">
                    <p>Deck 1</p>
                    <input type="checkbox">
                </div>
                <div class="deck-box">
                    <p>Deck 2</p>
                    <input type="checkbox">
                </div>
                <div class="deck-box">
                    <p>Deck 3</p>
                    <input type="checkbox">
                </div>
                <div class="deck-box">
                    <p>Deck 1</p>
                    <input type="checkbox">
                </div>
                <div class="deck-box">
                    <p>Deck 2</p>
                    <input type="checkbox">
                </div>
                <div class="deck-box">
                    <p>Deck 3</p>
                    <input type="checkbox">
                </div>
                <div class="deck-box">
                    <p>Deck 1</p>
                    <input type="checkbox">
                </div>
                <div class="deck-box">
                    <p>Deck 2</p>
                    <input type="checkbox">
                </div>
                <div class="deck-box">
                    <p>Deck 3</p>
                    <input type="checkbox">
                </div>
                <div class="deck-box">
                    <p>Deck 1</p>
                    <input type="checkbox">
                </div>
                <div class="deck-box">
                    <p>Deck 2</p>
                    <input type="checkbox">
                </div>
                <div class="deck-box">
                    <p>Deck 3</p>
                    <input type="checkbox">
                </div>
                <div class="deck-box">
                    <p>Deck 1</p>
                    <input type="checkbox">
                </div>
                <div class="deck-box">
                    <p>Deck 2</p>
                    <input type="checkbox">
                </div>
                <div class="deck-box">
                    <p>Deck 3</p>
                    <input type="checkbox">
                </div> -->
            </div>
        </div>
        <div>
            <div class="big-box" id="settings-big-box">
                <h2>Settings</h2>
                <div id="settings-container">
                    <div class="setting-box">
                        <input type="checkbox" id="setting1Check">
                        <p>| Fast Mode </p> <!-- (Skip to the next term immediately) -->
                    </div>
                    <div class="setting-box">
                        <input type="checkbox" id="setting2Check">
                        <p>| Setting 2</p>
                    </div>
                    <div class="setting-box">
                        <input type="checkbox" id="setting3Check">
                        <p>| Setting 3</p>
                    </div>
                    <!--  -->
                </div>
            </div>
            <button id="reviewBtn"><h1>Review! →</h1></button>
        </div>
    </div>
</body>
</html>