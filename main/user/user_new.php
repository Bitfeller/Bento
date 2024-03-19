<?php
    require_once '../funcs.php';
    validate_request();
    $data = get_data('username');
    // Get body values
    $username = $data['username'];
    $pwd = $data['pwd'];
    $email = $data['email'];
    try {
        require_once '../dbh.php';
        // Check username
        if(!preg_match("/^[A-Za-z0-9]*$/", $username)) {
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
        $sql = "INSERT INTO users (username, password, email, reviews, verified) VALUES (?, ?, ?, ?, ?);";
        $stmt = $conn->prepare($sql);
        $reviews = '[]';
        $verified = 0;
        $newPwd = password_hash($pwd, PASSWORD_DEFAULT);
        $stmt->bind_param("ssssi", $username, $newPwd, $email, $reviews, $verified);
        $stmt->execute();
        $stmt->close();
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
        $_SESSION["email"] = $email;
        $_SESSION["reviews"] = $reviews;
        $_SESSION["verified"] = false;
        $stmt->close();
        success();
    } catch(Exception $e) {
        fail("exception: " . $e->getMessage());
    }