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
    <section class="password-container">
        <div class="holder"></div>
        <div class="password-inputs">
            <p class="info-blank">Enter a new password</p>
            <input type="password" id="new-password" placeholder="New Password">
            <button id="changepwd">Submit</button>
        </div>
    </section>
</body>
<style>
    .password-container h1, .password-container p {
        text-align: center;
    }
    .password-container {
        width: 700px;
        background-color: var(--dark-gray);
        padding: 15px;
        border-radius: 10px;
        min-height: 40dvh;
        margin: auto;
        display: flex;
        flex-direction: column;
        justify-content: space-around;
        margin-top: 50px;
        gap: 20px;
    }
    .password-container input {
        text-align: center;
    }
    .password-inputs {
        display: flex;
        flex-direction: column;
        min-width: 260px;
        margin-top: 10px;
        gap: 10px;
        width: max-content;
        margin: auto;
        * {
            font-size: 12pt;
        }
    }
    #resetpwd {
        padding: 0px 5px;
    }
    @media screen and (max-width: 700px) {
        .password-container {
            width: 90%;
        }
    }
</style>
</html>