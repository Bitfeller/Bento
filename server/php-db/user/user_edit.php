<?php
    require_once '../funcs.php';
    validate_request();
    $data = get_data('setting', 'val');
    require_types('sss', 'setting', 'val', 'verifpwd');
    // Make sure session exists
    session_start();
    if(!isset($_SESSION['uid'])) {
        fail("no session");
    }
    // Get body values
    $setting = $data['setting'];
    $val = $data['val'];
    $verifpwd = $data['verifpwd'];
    try {
        require_once '../dbh.php';
        // Get user
        $sql = "SELECT * FROM users WHERE username = ? OR email = ?;";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("ss", $_SESSION['username'], $_SESSION['email']);
        $stmt->execute();
        $result = mysqli_fetch_assoc($stmt->get_result());
        if(!$result) {
            // Invalid user information
            session_unset();
            session_destroy();
            fail("no user");
        }
        if($result['id'] !== $_SESSION['uid']) {
            // Invalid user information
            session_unset();
            session_destroy();
            fail("no user");
        }
        $stmt->close();
        switch($setting) {
            case "username":
                // Make sure username is valid
                if(!preg_match("/^[A-Za-z0-9]*$/", $val)) {
                    fail("invalid username");
                }
                // Check if username is taken
                $sql = "SELECT * FROM users WHERE username = ?;";
                $stmt = $conn->prepare($sql);
                $stmt->bind_param("s", $val);
                $stmt->execute();
                if(mysqli_fetch_assoc($stmt->get_result())) {
                    fail("username taken");
                }
                $stmt->close();
                // Update username
                $sql = "UPDATE users SET username = ? WHERE id = ?;";
                $stmt = $conn->prepare($sql);
                $stmt->bind_param("si", $val, $_SESSION['uid']);
                $stmt->execute();
                $stmt->close();
                // Update decks to have accurate username as well
                $sql = "UPDATE decks SET owner = ? WHERE owner = ?;";
                $stmt = $conn->prepare($sql);
                $stmt->bind_param("ss", $val, $_SESSION["username"]);
                $stmt->execute();
                $stmt->close();
                // Update session
                $_SESSION['username'] = $val;
            break;
            case "email":
                if(!password_verify($verifpwd, $result['password'])) {
                    fail('invalid pwd');
                }
                // Make sure email is valid
                if(!filter_var($val, FILTER_VALIDATE_EMAIL)) {
                    fail('invalid email');
                }
                // Check if email is taken
                $sql = "SELECT * FROM users WHERE email = ?;";
                $stmt = $conn->prepare($sql);
                $stmt->bind_param("s", $val);
                $stmt->execute();
                if(mysqli_fetch_assoc($stmt->get_result())) {
                    fail("email taken");
                }
                $stmt->close();
                // Set email
                $sql = "UPDATE users SET email = ?, verified = ? WHERE id = ?;";
                $stmt = $conn->prepare($sql);
                $verified = 0;
                $stmt->bind_param("sii", $val, $verified, $_SESSION['uid']);
                $stmt->execute();
                $stmt->close();
                $_SESSION['email'] = $val;
                $_SESSION['verified'] = false;
            break;
            case "password":
                if(!password_verify($verifpwd, $result['password'])) {
                    fail('invalid pwd');
                }
                $sql = "UPDATE users SET password = ? WHERE id = ?";
                $stmt = $conn->prepare($sql);
                $newPwd = password_hash($val, PASSWORD_DEFAULT);
                $stmt->bind_param("si", $newPwd, $_SESSION['uid']);
                $stmt->execute();
                $stmt->close();
            break;
            case 'reviews':
                $val = json_decode($val, true);
                if($val == null) {    
                    fail("exception: data isn't valid JSON.");
                }
                $safeVal = [];
                foreach($val as $dkey => $deck) {
                    $safeVal[$dkey] = [];
                    foreach($deck as $prob => $data) {
                        $newProb = htmlspecialchars(strip_tags($prob));
                        $newItem = [];
                        $newItem['last'] = (int)$data['last'];
                        $newItem['box'] = (int)$data['box'];
                        $newItem['score'] = (int)$data['score'];
                        $safeVal[$dkey][$newProb] = $newItem;
                    }
                }
                $safeVal = json_encode($safeVal);
                $sql = "UPDATE users SET reviews = ? WHERE id = ?;";
                $stmt = $conn->prepare($sql);
                $stmt->bind_param("si", $safeVal, $_SESSION['uid']);
                $stmt->execute();
                $stmt->close();
                $_SESSION['reviews'] = $safeVal;
            break;
            case 'view':
                $sql = "SELECT * FROM decks WHERE id = ?;";
                $stmt = $conn->prepare($sql);
                $val = (int)$val;
                $stmt->bind_param("i", $val);
                $stmt->execute();
                $result = mysqli_fetch_assoc($stmt->get_result());
                if(!$result) {
                    $stmt->close();
                    fail("no deck");
                }
                $viewdata = json_decode($result['viewdata']);
                $exists = false;
                foreach($viewdata as $idx => $res) {
                    if ($res == $_SESSION['uid']) {
                        $exists = true;
                        break;
                    }
                }
                if($exists == false) {
                    $viewdata[] = $_SESSION['uid'];
                    $viewdata = json_encode($viewdata);
                    $sql = "UPDATE decks SET viewdata = ? WHERE id = ?;";
                    $stmt = $conn->prepare($sql);
                    $stmt->bind_param("si", $viewdata, $val);
                    $stmt->execute();
                    $stmt->close();
                }
            break;
            case 'pfp':
                $safeVal = htmlspecialchars(strip_tags($val));
                if(strlen($safeVal) > 2 * 1000 * 1000) {
                    fail('size limit');
                }
                $sql = "UPDATE users SET pfp = ? WHERE id = ?;";
                $stmt = $conn->prepare($sql);
                $stmt->bind_param("si", $safeVal, $_SESSION['uid']);
                $stmt->execute();
                $stmt->close();
                $_SESSION['pfp'] = $safeVal;
            break;
            case 'notifsub':
                $sql = "UPDATE users SET notifsub = ? WHERE id = ?;";
                $stmt = $conn->prepare($sql);
                $val = (int)$val;
                $stmt->bind_param("ii", $val, $_SESSION['uid']);
                $stmt->execute();
                $stmt->close();
                $_SESSION['notifsub'] = $val;
            break;
            case 'delete':
                if(!password_verify($verifpwd, $result['password'])) {
                    fail('invalid pwd');
                }
                $sql = "DELETE FROM users WHERE id = ?;";
                $stmt = $conn->prepare($sql);
                $stmt->bind_param("i", $_SESSION['uid']);
                $stmt->execute();
                $stmt->close();
                session_unset();
                session_destroy();
            break;
        }
        success();
    } catch(Exception $e) {
        fail("exception: " . $e->getMessage());
    }