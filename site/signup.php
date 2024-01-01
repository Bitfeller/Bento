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
                <p><u>Sign Up</u></p>
                <p>Username:</p>
                <input type="text" id="signUpUsername">
                <p>Email:</p>
                <input type="email" id="signUpEmail">
                <p>Password:</p>
                <input type="password" id="signUpPassword">
                <p style="font-size: 13px; font-family: kadwa;">Your password is always secure. No one can see your password, not even us.</p>
                <p>Confirm Password:</p>
                <input type="password" id="signUpPassword2">
                <button class="submitBtn" id="signUpBtn">Sign Up</button>
                <p class='login-box-selector' onclick="location.href='/login'">I have an account >></p>
                <p class="info-error" id="err"></p>
        </div>
    </div>
    <script type='module'>
        import { UserGateway } from "../server/client-gateway/user-gateway.js";

        (async () => {
            let [success, reason] = await UserGateway.getuser();
            if(success)
                window.location.href = "/home";
        })();
        
        const s_user = document.getElementById("signUpUsername");
        const s_pass = document.getElementById("signUpPassword");
        const s_pass2 = document.getElementById("signUpPassword2");
        const s_email = document.getElementById("signUpEmail");
        const s_btn = document.getElementById("signUpBtn");
        const err = document.getElementById("err");

        async function signup() {
            if(s_pass.value != s_pass2.value) return void (window.SHOW_ERROR("Passwords do not match."));
            let [success, reason] = await UserGateway.signup(s_user.value, s_pass.value, s_email.value);
            if(!success) {
                switch(reason) {
                    case "bad pwd":
                        window.SHOW_ERROR("Password is either common or less than 8 characters long.");
                    break;
                    case "invalid username":
                        window.SHOW_ERROR("That username has invalid characters. (Valid characters include a-z, A-Z, and 0-9)");
                    break;
                    case "flagged":
                        window.SHOW_ERROR("Your username was flagged for inappropriate content.");
                    break;
                    case "invalid email":
                        window.SHOW_ERROR("Please enter in a valid email.");
                    break;
                    case "user exists":
                        window.SHOW_ERROR("That username is already taken.");
                    break;
                    case "autologin":
                        window.SHOW_ERROR("We successfully made an account for you; but we failed to log you in automatically. Try logging in with your new account manually.");
                    break;
                    default:
                        console.log(reason);
                        window.SHOW_ERROR("Looks like there's an issue on our side. Try again later.");
                    break;
                }
                return;
            }
            window.location.href = "/home";
        }
        s_btn.addEventListener("mousedown", signup);
        window.onkeydown = async (e) => {
            if (e.key === "Enter")
                await signup();
        }
    </script>
</body>
</html>