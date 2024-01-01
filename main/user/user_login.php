<?php
    require_once '../funcs.php';
    validate_request();
    $data = get_data('username');
    // Get body values
    $username = $data['username'];
    $pwd = $data['pwd'];
    try {
        require_once '../dbh.php';
        // Get user
        $sql = "SELECT * FROM users WHERE username = ? OR email = ?;";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("ss", $username, $username);
        $stmt->execute();
        $result = mysqli_fetch_assoc($stmt->get_result());
        if(!$result) {
            fail("bad u/p");
        }
        $userPwd = $result['password'];
        $valid = password_verify($pwd, $userPwd);
        if(!$valid) {
            fail("bad u/p");
        }
        session_start();
        $_SESSION['uid'] = $result['id'];
        $_SESSION['username'] = $result['username'];
        $_SESSION['email'] = $result['email'];
        $_SESSION['reviews'] = $result['reviews'];
        $_SESSION['verified'] = $result['verified'] === 0 ? false : true;
        $_SESSION['creation_date'] = $result['creation_date'];
        $stmt->close();
        success();
    } catch(Exception $e) {
        fail("exception: " . $e->getMessage());
    }