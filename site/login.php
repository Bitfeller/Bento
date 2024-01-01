<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <?php require_once "globalreqs.php"?>
    <title>Login</title>
    <style>
        .modal {
            border: none;
            left: 0;
            top: 0;
            width: 100%; 
            height: 100%; 
            overflow: auto;
        }
        .modal-content {
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            gap: 1dvh;
            background-color: var(--dark-gray);
            border-style: none;
            margin: 15% auto; 
            padding: 30px;
            width: 30%; 
            border-radius: 10px;
            animation-name: animatetop;
            animation-duration: 0.4s;
        }
        .modal-content > p {
            font-size: 18pt;
        }
        .modal-content > input {
            border: none;
            font-size: 18pt;
            border-radius: 5px;
            padding-left: 1%;
        }
        .modal-content > button {
            margin-top: 1.5dvh;
            height: 44px;
            font-size: 18pt;
        }
        @media screen and (max-width: 1000px) {
            .modal-content {
                width: 80%;
            }
        }
    </style>
</head>
<body>
    <?php require_once "header.php"?>
    <div class="modal" id="signInModal">
        <div class="modal-content">
            <p><u>Login</u></p>
            <p>Username:</p>
            <input type="text" id="signInUsername" autofocus>
            <p>Password:</p>
            <input type="password" id="signInPassword">
            <button class="submitBtn" id="signInBtnM">Login</button>
            <p class='reset-pwd' onclick="location.href='/user/resetpwd'">I forgot my password >></p>
            <p class="info-error" id="err"></p>
        </div>
    </div>
    <script type='module'>
        import { UserGateway } from "../server/client-gateway/user-gateway.js";

        (async () => {
            let [success, reason] = await UserGateway.getuser();
            if(success) {
                const paramList = new URLSearchParams(window.location.search);
                if(paramList.get("s")) {
                    window.location.href = "/" + paramList.get("s");
                } else {
                    window.location.href = "/home";
                }
            }
        })();
        
        const l_user = document.getElementById("signInUsername");
        const l_pass = document.getElementById("signInPassword");
        const l_btn = document.getElementById("signInBtnM");
        const err = document.getElementById("err");

        l_btn.addEventListener("mousedown", async () => {
            let [success, reason] = await UserGateway.login(l_user.value, l_pass.value);
            if(!success) {
                switch(reason) {
                    case "bad u/p":
                        err.innerHTML = "Bad username or password.";
                    break;
                    default:
                        console.log(reason);
                        err.innerHTML = "Looks like there's an issue on our side. Try again later.";
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
        });
        window.onkeydown = async (e) => {
            if (e.key === "Enter") {
                let [success, reason] = await UserGateway.login(l_user.value, l_pass.value);
                if(!success) {
                    switch(reason) {
                        case "bad u/p":
                            err.innerHTML = "Bad username or password.";
                        break;
                        default:
                            console.log(reason);
                            err.innerHTML = "Looks like there's an issue on our side. Try again later.";
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
        }
    </script>
</body>
</html>