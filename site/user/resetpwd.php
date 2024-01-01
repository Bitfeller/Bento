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
</body>
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
        } else {
            success.className = 'info-error';
            success.innerHTML = "This email isn't verified yet, or there's an issue on our side.";
        }
    });
    </script>
<style>
    .password-container h1, .password-container p {
        text-align: center;
    }
    .password-container {
        max-width: 700px;
        background-color: var(--dark-gray);
        padding: 15px;
        border-radius: 10px;
        min-height: 40dvh;
        margin: auto;
        width: max-content;
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
        margin-top: 10px;
        gap: 10px;
        width: max-content;
        margin: auto;
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