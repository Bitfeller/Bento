<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bento! - Reset Password</title>
    <?php require_once '../globalreqs.php'?>
</head>
<body>
    <?php require_once '../header.php'?>
    <section>
        <h1>Let's reset your password.</h1>
        <p>Enter in the email you use for your account:</p>
        <input type="text" id="email">
        <button id="resetpwd">Send an email to reset my password</button>
        <p class="info-success"></p>
    </section>
    <script type="module">
        import { UserGateway } from '../../server/client-gateway/user-gateway.js';
        let email = document.getElementById('email');
        let success = document.getElementsByClassName('info-success')[0];
        document.getElementById('resetpwd').addEventListener('mousedown', async () => {
            if(email.value == '') return;
            let [s, data] = await UserGateway.resetPwd(email.value);
            if(s) {
                success.className = 'info-success';
                success.innerHTML = "If this user exists, we sent an email.";
            } else {
                success.className = 'info-error';
                success.innerHTML = "This email isn't verified yet, or there's an issue on our side.";
            }
        });
    </script>
</body>
</html>