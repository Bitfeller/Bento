<?php
    require_once '../module.php';
    validate_request();
    $data = get_data('username', 'pwd', 'email');
    require_types('sss', 'username', 'pwd', 'email');
    // Get body values
    $username = $data['username'];
    $pwd = $data['pwd'];
    $email = $data['email'];
    try {
        $conf = get_server_config();
        $conn = connect_to_db();
        // Check username
        if(!preg_match("/^[a-zA-Z0-9\-!@#$%^&*\(\)\[\]\{\}\.]*$/", $username)) fail("invalid username");
        // Check email
        if(!filter_var($email, FILTER_VALIDATE_EMAIL)) fail("invalid email");
        // Check whether current username/email exists
        $sql = "SELECT * FROM users WHERE username = ? OR email = ? LIMIT 1;";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("ss", $username, $email);
        $stmt->execute();
        if($stmt->get_result()->fetch_assoc()) fail("user exists");
        $stmt->close();
        // Create user
        $sql = "INSERT INTO users (username, password, email, userdata, verified, verif, notifsub, creation_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?);";
        $stmt = $conn->prepare($sql);
        $userdata = '{"reviews":{},"draftdecks":{},"theme":0}';
        $verified = 0;
        $notifsub = 0;
        $date = date("Y-m-d");
        // Generate verifStr
        $verifStr = '';
        $chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$%^&*()-=_+[]\\{}|;\':",./<>?`~';
        $len = strlen($chars);
        for($i = 0; $i < $len; $i++) $verifStr .= $chars[random_int(0, $len-1)];
        // Generate hashed pwd + verifStr
        $newPwd = password_hash($pwd, PASSWORD_DEFAULT);
        $hashVerif = password_hash($verifStr, PASSWORD_DEFAULT);
        // Bind new params
        $stmt->bind_param("ssssisis", $username, $newPwd, $email, $userdata, $verified, $hashVerif, $notifsub, $date);
        $stmt->execute();
        $stmt->close();
        // Autologin user
        $sql = "SELECT * FROM users WHERE username = ? OR email = ? LIMIT 1;";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("ss", $username, $email);
        $stmt->execute();
        $result = $stmt->get_result()->fetch_assoc();
        // Theoretically should never happen.
        if(!$result) fail("autologin");
        $userPwd = $result["password"];
        $valid = password_verify($pwd, $userPwd);
        if(!$valid) fail("autologin");
        // Create pfp for user
        $pfp = $conf['file_db'] . 'pfps/' . $result['id'] . '.pfp';
        $handle = fopen($pfp, "w");
        if(!$handle) fail("CRITICAL: couldn't create pfp!");
        fclose($handle);
        // Start session
        session_start();
        $_SESSION["uid"] = $result["id"];
        $_SESSION["username"] = $username;
        $_SESSION["pfp"] = "";
        $_SESSION["email"] = $email;
        $_SESSION["userdata"] = $userdata;
        $_SESSION["verified"] = false;
        $_SESSION['creation_date'] = $date;
        $_SESSION['notifsub'] = "0";
        $stmt->close();
        $uid = $result["id"];
        send_mail(
            $email,
            "Email Verification", 
            "Hey there!<br><br>Verify your new email address for $username <a href='https://bento-app.uk/user/userdir?hash=$hashVerif&v=0&user=$uid'>here</a>.<br><br>If this isn't your account, you can safely ignore this email.<br><br>Bento<br><span style='font-size: 10px; color: rgb(200, 200, 200)'>You can reply to this email to contact us.<br>You're receiving this email because your email was associated with this account.<br>You can safely ignore this email if this account isn't yours, and your email will no longer be associated with this account in a few days if you don't verify this account.</span>", 
            "Hey there!\n\nVerify your new email address for $username at https://bento-app.uk/user/userdir?hash=$hashVerif&v=0&user=$uid. If this isn't your account, you can safely ignore this email.\n\nBento\n(You can reply to this email to contact us. You're receiving this email because your email was associated with this account.)\n(You can safely ignore this email if this account isn't yours, and your email will no longer be associated with this account in a few days if you don't verify this account.)"
        );
        success();
    } catch(Exception $e) {
        fail("exception: " . $e->getMessage());
    }