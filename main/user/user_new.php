<?php
    // Essential functions
    function fail($reason) {
        echo json_encode(['status' => 'error', 'reason' => $reason]);
        exit();
    }
    function access_fail() {
        echo "Invalid.";
        exit();
    }
    function success() {
        echo json_encode(['status' => 'success']);
        exit();
    }
    // Make valid request
    $content_type = $_SERVER['CONTENT_TYPE'];
    if($content_type !== 'application/json') {
        access_fail();
    }
    // Get data
    $json_data = file_get_contents('php://input');
    $data = json_decode($json_data, true);
    if(isset($data['username'])) {
        $username = $data['username'];
        $pwd = $data['pwd'];
        $email = $data['email'];
        try {
            // Establish connection to database
            require_once 'user_dbh.php';
            if(!$conn) {
                fail("conn: " . mysqli_connect_error());
            }
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
            $stmt = mysqli_stmt_init($conn);
            if(!mysqli_stmt_prepare($stmt, $sql)) {
                fail("stmt: " . mysqli_stmt_error($stmt));
            }
            mysqli_stmt_bind_param($stmt, "ss", $username, $email);
            mysqli_stmt_execute($stmt);
            if(mysqli_fetch_assoc( mysqli_stmt_get_result($stmt) )) {
                fail("user exists");
            }
            mysqli_stmt_close($stmt);
            // Create user
            $sql = "INSERT INTO users (username, password, email, reviews, sets, verified) VALUES (?, ?, ?, ?, ?, false);";
            $stmt = mysqli_stmt_init($conn);
            if(!mysqli_stmt_prepare($stmt, $sql)) {
                fail("" . mysqli_stmt_error($stmt));
            }
            $reviews = "[]";
            $sets = "[]";
            $newPwd = password_hash($pwd, PASSWORD_DEFAULT);
            mysqli_stmt_bind_param($stmt, "sssss", $username, $newPwd, $email, $reviews, $sets);
            mysqli_stmt_execute($stmt);
            mysqli_stmt_close($stmt);
            // Autologin user
            $sql = "SELECT * FROM users WHERE username = ? OR email = ?;";
            $stmt = mysqli_stmt_init($conn);
            if(!mysqli_stmt_prepare($stmt, $sql)) {
                fail("stmt: " . mysqli_stmt_error($stmt));
            }
            mysqli_stmt_bind_param($stmt, "ss", $username, $email);
            mysqli_stmt_execute($stmt);
            $result = mysqli_fetch_assoc(mysqli_stmt_get_result($stmt));
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
            $_SESSION["sets"] = $sets;
            $_SESSION["verified"] = false;
            success();
        } catch (Exception $e) {
            fail("exception: " . $e->getMessage());
        }
    } else {
        access_fail();
    }