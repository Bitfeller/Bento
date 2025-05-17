<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bento!</title>
    <?php require_once "../globalreqs.php"?>
    <link rel="stylesheet" href="../../css/user/userdir.css"/>
    <script type="module" src="../../sitejs/userdir.js" type="text/javascript" data-loading="true"></script>
</head>
<body>
    <?php require_once "../header.php"?>
    <section class="password-container">
        <div class="holder"></div>
        <div class="password-inputs">
            <p class="info-blank">Enter a new password</p>
            <input type="password" id="new-password" placeholder="New Password">
            <button id="changepwd">Submit</button>
            <p class="info-success"></p>
        </div>
    </section>
</body>
</html>