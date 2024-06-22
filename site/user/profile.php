<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Profile</title>
    <?php require_once "../globalreqs.php"?>
    <link rel="stylesheet" href="../../css/settings.css"/>
    <link rel="stylesheet" href="../../css/profile.css"/>
</head>
<body data-uo="true">
    <?php require_once "../header.php"?>
    <div id="profile-container">
        <div id="left-div">
            <img src="../../img/default-pfp.png" class="profile-picture">
            <span class="material-symbols-outlined" id="pfpAddBtn">add_a_photo</span>
        </div>
        <div id="right-div">
            <div class="setting-box">
                <h2>Change Email</h2>
                <input type="email" class="change-input" placeholder="New Email">
                <button>Submit</button>
                <pre>
                </pre>
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
    </div>
</body>
</html>