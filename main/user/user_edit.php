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
    if(isset($data['setting'])) {
        // Check if user session exists
        session_start();
        if(!isset($_SESSION['uid'])) {
            fail("no session");
        }
        $setting = $data['setting'];
        $val = $data['val'];
        $verifpwd = $data['verifpwd'];
        try {
            // Establish connection to database
            require_once 'user_dbh.php';
            if(!$conn) {
                fail("conn: " . mysqli_connect_error());
            }
            $sql = "SELECT * FROM users WHERE username = ? OR email = ?;";
            $stmt = mysqli_stmt_init($conn);
            if(!mysqli_stmt_prepare($stmt, $sql)) {
                fail("stmt: " . mysqli_stmt_error($stmt));
            }
            mysqli_stmt_bind_param($stmt, "ss", $_SESSION['username'], $_SESSION['email']);
            mysqli_stmt_execute($stmt);
            $result = mysqli_fetch_assoc(mysqli_stmt_get_result($stmt));
            if(!$result) {
                fail("no user");
            }
            switch($setting) {
                case 'username':
                    $sql = "UPDATE users SET username = ? WHERE id = ?";
                    $stmt = mysqli_stmt_init($conn);
                    if(!mysqli_stmt_prepare($stmt, $sql)) {
                        fail("stmt: ". mysqli_stmt_error($stmt));
                    }
                    mysqli_stmt_bind_param($stmt, "si", $val, $result['id']);
                    mysqli_stmt_execute($stmt);
                    mysqli_stmt_close($stmt);
                    $_SESSION['username'] = $val;
                break;
                case 'email':
                    if(!password_verify($verifpwd, $result['password'])) {
                        fail('invalid pwd');
                    }
                    $sql = "UPDATE users SET email = ? AND verified = 0 WHERE id = ?";
                    $stmt = mysqli_stmt_init($conn);
                    if(!mysqli_stmt_prepare($stmt, $sql)) {
                        fail("stmt: ". mysqli_stmt_error($stmt));
                    }
                    mysqli_stmt_bind_param($stmt, "si", $val, $result['id']);
                    mysqli_stmt_execute($stmt);
                    mysqli_stmt_close($stmt);
                    $_SESSION['email'] = $val;
                    $_SESSION['verified'] = false;
                break;
                case 'password':
                    if(!password_verify($verifpwd, $result['password'])) {
                        fail('invalid pwd');
                    }
                    $sql = "UPDATE users SET password = ? WHERE id = ?";
                    $stmt = mysqli_stmt_init($conn);
                    if(!mysqli_stmt_prepare($stmt, $sql)) {
                        fail("stmt: ". mysqli_stmt_error($stmt));
                    }
                    $newPwd = password_hash($val, PASSWORD_DEFAULT);
                    mysqli_stmt_bind_param($stmt, "si", $newPwd, $result['id']);
                    mysqli_stmt_execute($stmt);
                    mysqli_stmt_close($stmt);
                break;
                case 'remove':
                    if(!password_verify($verifpwd, $result['password'])) {
                        fail('invalid pwd');
                    }
                    $sql = "UPDATE users SET reviews = '[]' AND sets = '[]' WHERE id = ?";
                    $stmt = mysqli_stmt_init($conn);
                    if(!mysqli_stmt_prepare($stmt, $sql)) {
                        fail("stmt: ". mysqli_stmt_error($stmt));
                    }
                    mysqli_stmt_bind_param($stmt, "i", $result['id']);
                    mysqli_stmt_execute($stmt);
                    mysqli_stmt_close($stmt);
                    $_SESSION['reviews'] = '[]';
                    $_SESSION['sets'] = '[]';
                break;
            }
            success();
        } catch (Exception $e) {
            fail("exception: " . $e->getMessage());
        }
        
    } else {
        access_fail();
    }