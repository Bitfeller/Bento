<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Settings</title>
    <?php require_once "globalReqs.php"?>
    <link rel="stylesheet" href="/css/settings.css" />
</head>
<body>
    <?php require_once "header.php"?>
    <div id="settings-container">
        <div class="setting-box">
            <p>Set Size:</p>
            <input type="range" min="1" max="5" value="5" class="slider"  id="set-size-slider" oninput="displaySliderValue('set-size-slider', 'set-size-output')">
            <output id="set-size-output">5</output>
        </div>
        <div class="setting-box" id="vocab-repetition-setting">
            <div>Vocab Repetition:</div>
            <div>
                <input name="radio" type="radio" checked>
                <span class="radio-label">Something</span>
            </div>
            <div>
                <input name="radio" type="radio">
                <span class="radio-label">Something Else</span>
            </div>
        </div>
        <div class="setting-box">
            <input type="checkbox">
            Show Previous Vocab
        </div>
        <div class="setting-box">
            <input type="checkbox">
            Vacation Mode
        </div>
        <div class="setting-box">
            <p>Change Password</p>
            <input type="text" class="change-input">
            <button>Submit</button>
        </div>
        <div class="setting-box">
            <p>Change Username</p>
            <input type="text" class="change-input">
            <button>Submit</button>
        </div>
        <div class="setting-box">
            <button>Delete Account</button>
        </div>
        <div class="setting-box">
            <button>Reset Account</button>
        </div>


    </div>
</body>
<script src="js/settings.js"></script>
</html>