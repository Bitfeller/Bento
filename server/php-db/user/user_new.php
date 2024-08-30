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
        $conn = connect_to_db();
        // Check username
        if(!preg_match("/^[A-Za-z0-9\-]*$/", $username)) {
            fail("invalid username");
        }
        // Check email
        if(!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            fail("invalid email");
        }
        // Check whether current username/email exists
        $sql = "SELECT * FROM users WHERE username = ? OR email = ?;";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("ss", $username, $email);
        $stmt->execute();
        if(mysqli_fetch_assoc($stmt->get_result())) {
            fail("user exists");
        }
        $stmt->close();
        // Create user
        $sql = "INSERT INTO users (username, password, email, userdata, verified, verif, notifsub, creation_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?);";
        $stmt = $conn->prepare($sql);
        $userdata = '{"reviews":{},"draftdecks":{},"theme":0}';
        $verified = 0;
        $notifsub = "0";
        $date = date("Y-m-d");
        // Generate verifStr
        $verifStr = '';
        $chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$%^&*()-=_+[]\\{}|;\':",./<>?`~';
        $len = strlen($chars);
        for($i = 0; $i < $len; $i++) {
            $verifStr .= $chars[random_int(0, $len-1)];
        }
        // Generate hashed pwd + verifStr
        $newPwd = password_hash($pwd, PASSWORD_DEFAULT);
        $hashVerif = password_hash($verifStr, PASSWORD_DEFAULT);
        // Bind new params
        $stmt->bind_param("ssssisss", $username, $newPwd, $email, $userdata, $verified, $hashVerif, $notifsub, $date);
        $stmt->execute();
        $stmt->close();
        // mail($email, "Welcome to Bento!", "Hey there! Welcome to Bento.\r\nWe'd like to make sure you get the best experience, so we'd like to\r\nmake sure we've got the right email. To verify your email, please visit:\r\nhttps://valleynas.uk", "From: coolstuff@bento.com");
        // Autologin user
        $sql = "SELECT * FROM users WHERE username = ? OR email = ?;";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("ss", $username, $email);
        $stmt->execute();
        $result = mysqli_fetch_assoc($stmt->get_result());
        if(!$result) {
            fail("autologin");
        }
        $userPwd = $result["password"];
        $valid = password_verify($pwd, $userPwd);
        if(!$valid) {
            fail("autologin");
        }
        session_start();
        $_SESSION["uid"] = $result["id"];
        $_SESSION["username"] = $username;
        $_SESSION["pfp"] = "";
        $_SESSION["email"] = $email;
        $_SESSION["verified"] = false;
        $_SESSION['creation_date'] = $date;
        $_SESSION['notifsub'] = "0";
        $stmt->close();
        success();
    } catch(Exception $e) {
        fail("exception: " . $e->getMessage());
    }