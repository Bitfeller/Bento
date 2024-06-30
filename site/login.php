<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <?php require_once "globalreqs.php"?>
    <title>Login</title>
</head>
<body>
    <?php require_once "header.php"?>
    <div class="modal" id="signInModal">
        <div class="modal-content">
            <p><u>Login</u></p>
            <p>Username:</p>
            <input type="text" id="signInUsername">
            <p>Password:</p>
            <input type="password" id="signInPassword">
            <button class="submitBtn" id="signInBtnM">Login</button>
        </div>
    </div>
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
            background-color: rgb(33, 33, 33);
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
            background-color: rgb(56, 56, 56);
            border-radius: 5px;
            padding-left: 1%;
        }
        .modal-content > button {
            margin-top: 1.5dvh;
            height: 44px;
            font-size: 18pt;
        }
    </style>
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

        l_btn.addEventListener("mousedown", async () => {
            let [success, reason] = await UserGateway.login(l_user.value, l_pass.value);
            if(!success) {
                console.log(reason);
                return;
            }
            const paramList = new URLSearchParams(window.location.search);
            if(paramList.get("s")) {
                window.location.href = "/" + paramList.get("s");
            } else {
                window.location.href = "/home";
            }
        });
    </script>
</body>
</html>