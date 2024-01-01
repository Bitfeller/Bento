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
        try {
            // Establish connection to database
            require_once 'user_dbh.php';
            if(!$conn) {
                fail("conn: " . mysqli_connect_error());
            }
            $sql = "SELECT * FROM users WHERE username = ? OR email = ?";
            $stmt = mysqli_stmt_init($conn);
            if(!mysqli_stmt_prepare($stmt, $sql)) {
                fail("stmt: " . mysqli_stmt_error($stmt));
            }
            mysqli_stmt_bind_param($stmt, "ss", $username, $username);
            mysqli_stmt_execute($stmt);
            $result = mysqli_fetch_assoc(mysqli_stmt_get_result($stmt));
            if(!$result) {
                fail("bad u/p");
            }
            $userPwd = $result["password"];
            $valid = password_verify($pwd, $userPwd);
            if(!$valid) {
                fail("bad u/p");
            }
            session_start();
            $_SESSION["uid"] = $result["id"];
            $_SESSION["username"] = $result["username"];
            $_SESSION["email"] = $result["email"];
            $_SESSION["reviews"] = $result["reviews"];
            $_SESSION["sets"] = $result["sets"];
            $_SESSION["verified"] = $result["verified"] === 0 ? false : true;
            success();
        } catch (Exception $e) {
            fail("exception: " . $e->getMessage());
        }
    } else {
        access_fail();
    }