<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <?php require_once "globalreqs.php"?>
    <title>Login</title>
    <link rel="stylesheet" href="/css/barrier.css">
</head>
<body>
    <?php require_once "header.php"?>
    <div class="modal" id="signInModal">
        <div class="modal-content">
            <p><u>Login</u></p>
            <p>Username/Email:</p>
            <input type="text" id="signInUsername" autofocus>
            <p>Password:</p>
            <input type="password" id="signInPassword">
            <button class="submitBtn" id="signInBtn">Login</button>
            <p class='login-box-selector' onclick="location.href='/user/resetpwd'">I forgot my password >></p>
            <p class='login-box-selector' onclick="location.href='/signup'">Create an account >></p>
        </div>
    </div>
    <script type='module'>
        import { UserGateway } from "../server/client-gateway/user-gateway.js";

        (async () => {
            let [success, reason] = await UserGateway.getuser();
            if(success) {
                const paramList = new URLSearchParams(window.location.search);
                if(paramList.get("s")) window.location.href = "/" + paramList.get("s");
                else window.location.href = "/home";
            }
        })();
        
        const l_user = document.getElementById("signInUsername");
        const l_pass = document.getElementById("signInPassword");
        const l_btn = document.getElementById("signInBtn");
        const err = document.getElementById("err");

        async function login() {
            if(l_pass.value.length < 8) return window.SHOW_ERROR("Bad username or password.");
            let [success, reason] = await UserGateway.login(l_user.value, l_pass.value);
            if(!success) {
                switch(reason) {
                    case "bad u/p":
                        window.SHOW_ERROR("Bad username or password.");
                    break;
                    case "broken user":
                        window.SHOW_ERROR("Your account is broken. Contact bentoboxcenter@gmail.com for help.");
                    break;
                    default:
                        console.log(reason);
                        window.SHOW_ERROR("Looks like there's an issue on our side. Try again later.");
                    break;
                }
                return;
            }
            const paramList = new URLSearchParams(window.location.search);
            if(paramList.get("s")) {
                window.location.href = "/" + paramList.get("s");
            } else {
                window.location.href = "/home";
            }
        }
        l_btn.addEventListener("mousedown", login);
        window.onkeydown = async (e) => {
            if (e.key === "Enter")
                await login();
        }
    </script>
</body>
</html>