<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bento! - Reset Password</title>
    <?php require_once '../globalreqs.php'?>
    <link rel="stylesheet" href="../../css/user/resetpwd.css" />
</head>
<body>
    <?php require_once '../header.php'?>
    <section class="password-container">
        <h1>Reset Your Password.</h1>
        <p>
            Unfortunately you forgot your password. But all you need to get it back is the email you signed up with!
            Fortunately, we don't store your password, but that means we can't give it back to you. But we can help you reset it.
        </p>
        <div class="password-inputs">
            <p class="info-blank">Enter the email you used to signup</p>
            <input type="email" id="email" placeholder="Email">
            <button id="resetpwd" >Submit</button>
        </div>
    </section>
    <script type="module" defer>
        import { UserGateway } from '../../server/client-gateway/user-gateway.js';
        let email = document.getElementById('email');
        let success = document.getElementsByClassName('info-blank')[0];
        document.getElementById('resetpwd').addEventListener('mousedown', async () => {
            if(email.value == '') return;
            let [s, data] = await UserGateway.resetPwd(email.value);
            if(s) {
                success.className = 'info-success';
                success.innerHTML = "If this user exists, we sent an email.";
            } else window.SHOW_ERROR("This email isn't verified yet, or there's an issue on our side.");
        });
    </script>
</body>
</html>