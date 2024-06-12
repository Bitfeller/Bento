<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Settings</title>
    <?php require_once "../globalreqs.php"?>
    <link rel="stylesheet" href="../../css/settings.css"/>
</head>
<body data-uo="true">
    <?php require_once "../header.php"?>
    <div id="settings-container">
        <div class="setting-box">
            <h2>Set Size:</h2>
            <div id="set-size-slider-stuff">
                <output id="set-size-output">5</output>
                <input type="range" min="1" max="5" value="5" class="slider"  id="set-size-slider" oninput="displaySliderValue('set-size-slider', 'set-size-output')">
            </div>
        </div>
        <!-- <div class="setting-box" id="vocab-repetition-setting">
            <p>Vocab Repetition:</p>
            <div class="radio-container">
                <input name="radio" type="radio" checked>
                <span class="radio-label">| Something</span>
            </div>
            <div class="radio-container">
                <input name="radio" type="radio">
                <span class="radio-label">| Something Else</span>
            </div>
        </div> -->
        <div class="setting-box">
            <p>Other:</p>
            <div class="checkbox-container">
                <input type="checkbox">
                | Show Previous Vocab
            </div>
            <div class="checkbox-container">
                <input type="checkbox">
                | Vacation Mode
            </div>
        </div>
        <div class="setting-box">
            <h2>Change Password</h2>
            <input type="password" class="change-input" placeholder="New Password">
            <button>Submit</button>
            <pre>
            </pre>
            <h2>Change Username</h2>
            <input type="text" class="change-input" placeholder="New Username">
            <button>Submit</button>
        </div>
        <div class="setting-box" id="dangerZoneBox">
            <h2>Danger Zone</h2>
            <button>Delete Account</button>
            <button>Reset Account</button>
        </div>
    </div>
    <img id="settings-icon-nondescructive">
</body>
<script src="/sitejs/settings.js"></script>
</html>