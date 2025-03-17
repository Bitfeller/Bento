<?php $_X_VE = true; ?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bento!</title>
    <?php require_once "../globalreqs.php"?>
    <link rel="stylesheet" href="/css/verify.css"/>
    <script type="module" src="../../sitejs/verify.js" type="text/javascript" data-loading="true"></script>
</head>
<body>
    <?php require_once "../header.php"?>
    <section class="email-container">
        <h2>Verify your email before continuing.</h2>
        <div>
            <p>Check your email for a verification link.</p>
            <p>Didn't receive one?</p>
            <button id='resend'>Resend</button>
            <p id='resendSuccess' class="info-success"></p>
        </div>
        <div>
            <p>If you think you put in the wrong email, you can change it here:</p>
            <input type="password" name="password" id="change-pwd" placeholder="Current password" required>
            <input type="email" name="email" id="change-email" placeholder="New email" required>
            <button id='change-email-btn'>Change</button>
            <p id='changeSuccess' class="info-success"></p>
        </div>
        <div>
            <p>Or, if you want to delete this account forever:</p>
            <input type="password" name="password" id="curr-pwd" placeholder="Current password" required>
            <button id='delacc-btn'>Delete Account</button>
            <p><i>If an account has not been verified in 7 days it will be automatically deleted</i></p>
        </div>
    </section>
</body>
</html>