<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Profile</title>
    <?php require_once "../globalreqs.php"?>
    <link rel="stylesheet" href="../../css/settings.css"/>
    <link rel="stylesheet" href="../../css/profile.css"/>
    <script type="module" src="../../sitejs/profile.js"></script>
</head>
<body data-uo="true">
    <?php require_once "../header.php"?>
    <div id="profile-container">
        <div id="left-div">
            <div id="profile-picture-container">
                <img src="../../img/defaultpfp.png" class="profile-picture" id="pfp">
                <input class='file-selector' accept="image/png,image/jpeg" id="fileselecttrigger" type="file">
                <span class="material-symbols-outlined" id="pfpAddBtn">add_a_photo</span>
                <span class="material-symbols-outlined" id="pfpReset">refresh</span>
            </div>
            <h1 id="username">Username</h1>
            <div class="setting-box">
                <h2>Theme:</h2>
                <select id="theme-select">
                    <option value="nord">Nord</option>
                    <option value="coffee-midnight">Coffee Midnight</option>
                    <option value="catppuccin">Catppuccin Mocha-ish</option>
                </select>
            </div>
        </div>
        <div id="right-div">
            <div class="setting-box">
                <h2>Change Email</h2>
                <input type="password" id="e_currpwd" class="change-input" placeholder="Current Password">
                <input type="email" id='emailfield' class="change-input" placeholder="New Email">
                <button disabled id="emailbtn">Submit</button>
                <pre>
                </pre>
                <h2>Change Password</h2>
                <input type="password" id="currpwd" class="change-input" placeholder="Current Password">
                <input type="password" id='pwdfield' class="change-input" placeholder="New Password">
                <button id="pwdbtn">Submit</button>
                <pre>
                </pre>
                <h2>Change Username</h2>
                <input type="text" id='userfield' class="change-input" placeholder="New Username">
                <button id="userbtn">Submit</button>
            </div>
            <div class="setting-box" id="dangerZoneBox">
                <h2>Danger Zone</h2>
                <button id="delacc">Delete Account</button>
                <button id="resetacc">Reset Account</button>
            </div>
        </div>
    </div>
    <section>
        <dialog id="warningdialog">
            <div class="title-bar">
                <h2>Are you sure?</h2>
                <button class="closeBtns" id="leave">Back...</button>
            </div>
            <br>
            <div class="main"></div>
        </dialog>
    </section>
    <img id="settings-icon-nondescructive">
</body>
</html>