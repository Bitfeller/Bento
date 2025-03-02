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
        <p>Check your email for a verification link.</p>
        <p>Didn't receive one? <button id='resend'>Resend</button></p>
        <p id='resend-suc' class="info-success"></p>
        <p>Or, if you want to change your email:</p>
        <input type="password" name="password" id="change-pwd" placeholder="Current password" required>
        <input type="email" name="email" id="change-email" placeholder="New email" required>
        <button id='change-email-btn'>Change</button>
        <p id='change-suc' class="info-success"></p>
        <p>Or, if you want to delete this account forever:</p>
        <input type="password" name="password" id="curr-pwd" placeholder="Current password" required>
        <button id='delacc-btn'>Delete Account</button>
        <p>If this account has never been verified before, the account will be automatically deleted in 7 days.</p>
    </section>
</body>
</html>