<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Profile</title>
    <?php require_once "../globalreqs.php"?>
    <link rel="stylesheet" href="../../css/profile.css"/>
    <script type="module" src="../../sitejs/profile.js"></script>
</head>
<body data-uo="true">
    <?php require_once "../header.php"?>
    <div class="profile-grid">
        <div class="grid-box pfp-box">
            <div class="pfp-container">
                <img src="../../img/defaultpfp.png" id="pfp">
                <input class="file-selector" accept="image/png,image/jpeg" id="fileselecttrigger" type="file">
                <span class="material-symbols-outlined" id="pfpAddBtn">add_a_photo</span>
                <span class="material-symbols-outlined" id="pfpResetBtn">refresh</span>
            </div>
            
            <h1 id="username">Username</h1>
        </div>
        <div class="grid-box">
            <h2>Theme:</h2>
            <p>
                Change the theme of the site to suit your preferences. The theme will be saved to your account across devices.
            </p>
            <div class="theme-radio-container">
                <div class="theme-radio-box nord">
                    <input type="radio" name="repeat" id="nord-radio" name="theme-select">
                    <label for="nord-radio">Forest Nord</label>
                </div>
                <div class="theme-radio-box coffee-midnight">
                    <input type="radio" name="repeat" id="coffee-midnight-radio" name="theme-select">
                    <label for="coffee-midnight-radio">Coffee Midnight</label>
                </div>
                <div class="theme-radio-box catppuccin-mocha-ish">
                    <input type="radio" name="repeat" id="catppuccin-radio" name="theme-select">
                    <label for="catppuccin-radio">Catppuccin Mocha-ish</label>
                </div>
                <!-- <div class="theme-radio-box grayscale">
                    <input type="radio" name="repeat" id="grayscale-radio" name="theme-select">
                    <label for="grayscale-radio">Grayscale</label>
                </div> -->
            </div>
        </div>
        <div class="grid-box change-box">
            <h2>Change Username</h2>
            <input type="text" id="new-username" placeholder="Username">
            <div>
                <p>Usernames can only container alphanumeric characters, numbers, and the usual special symbols.</p>
                <p><b><i>Dont be stupid</i></b></p>
                <code>[a-zA-Z0-9\- !@#$%^&*\(\)\[\]\{\}\.]*</code>
            </div>
            <button id="submit-username">Change</button>
            <p class="info-error" id="username-error"></p>
        </div>
        <div class="grid-box change-box">
            <h2>Change Email</h2>
                <input type="text" id="email-curr-password" placeholder="Current Password">
                <input type="text" id="email" placeholder="Email">
            <p>Changing your email will require you to verify the new email address so make sure you can access it.</p>
            <button id="change-email">Change</button>
            <p class="info-error" id="email-error"></p>
        </div>
        <div class="grid-box change-box">
            <h2>Change Password</h2>
            <input type="password" id="password-curr-password" placeholder="Current Password">
            <input type="password" id="password" placeholder="New Password">
            <p>Passwords must be at least 8 characters long <p><i>for now...</i></p></p>
            <button id="change-password">Change</button>
            <p class="info-error" id="password-error"></p>
        </div>
        <div class="grid-box change-box danger-box">
            <h2>Danger Zone</h2>
            <div>
                <h3>Account Deletion:</h3>
                <p>Deleting your account will remove all of your data from our servers. This action is irreversible.</p>
                <button id="delete-account">Delete Account</button>
                <p class="info-error" id="delete-account-error"></p>
            </div>
            <div>
                <h3>Reset Account:</h3>
                <p>This will reset all of your reviews data and preferences.</p>
                <button id="reset-account">Reset Account</button>
                <p class="info-error" id="reset-account-error"></p>
                <img id="settings-icon-nondescructive">
            </div>
        </div>
    </div>
    <section>
        <dialog id="warning-dialog">
            <h1>Are you sure?</h1>
            <p>This action is irreversible and will remove all of your data from our servers.</p>
            <br>
            <p>Enter your current password to continue...</p>
            <input type="password" id="delete-account-password" placeholder="Current Password">
            <br>
            <button id="delete-account-confirm">Delete Account</button>
            <button id="delete-account-cancel">Cancel</button>
        </dialog>
    </section>
</body>
</html>