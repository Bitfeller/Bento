<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bento!</title>
    <?php require_once "../globalreqs.php"?>
    <script type="module" src="../../sitejs/userdir.js" type="text/javascript" data-loading="true"></script>
</head>
<body>
    <?php require_once "../header.php"?>
    <section class="holder">
        <h1>Let's reset your password.</h1>
        <p>Create a new password for your account.</p>
        <input id="new-password" placeholder="New password...">
        <button id="changepwd">Set as my password</button>
        <p class="info-error"></p>
    </section>
</body>
</html>