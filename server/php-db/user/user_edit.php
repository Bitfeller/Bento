<?php
    require_once '../module.php';
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
        $conn = connect_to_db();
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
                // Send email to previous email
                $uid = $result['id'];
                $username = $result['username'];
                send_mail(
                    $result['email'], 
                    "Changed Email", 
                    "Hey there!<br><br>Your account, <b>$username</b>, recently changed its email to $val.<br>If you didn't make this change, please let us know immediately so that we can help restore your account.<br><br>Bento<br><span style='font-size: 10px; color: rgb(200, 200, 200)'>You can reply to this email to contact us.<br>You're receiving this email because you were the last email associated with this account.</span>", 
                    "Hey there!\n\nYour account, $username, recently changed its email to $val.\nIf you didn't make this change, please let us know immediately so that we can help restore your account.\n\nBento\n\n(You can reply to this email to contact us. You're receiving this email because you were the last email associated with this account.)"
                );
                // Generate verifStr
                $verifStr = '';
                $chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$%^&*()-=_+[]\\{}|;\':",./<>?`~';
                $len = strlen($chars);
                for($i = 0; $i < $len; $i++) {
                    $verifStr .= $chars[random_int(0, $len-1)];
                }
                $hashVerif = password_hash($verifStr, PASSWORD_DEFAULT);
                // Set email
                $sql = "UPDATE users SET email = ?, verified = ?, verif = ? WHERE id = ?;";
                $stmt = $conn->prepare($sql);
                $verified = 0;
                $stmt->bind_param("sisi", $val, $verified, $hashVerif, $_SESSION['uid']);
                $stmt->execute();
                $stmt->close();
                $_SESSION['email'] = $val;
                $_SESSION['verified'] = false;
                send_mail(
                    $val,
                    "Email Verification", 
                    "Hey there!<br><br>Verify your new email address for $username <a href='https://bento.valleynas.uk/user/userdir?hash=$hashVerif&v=0&user=$uid'>here</a>.<br><br>If this isn't your account, you can safely ignore this email.<br><br>Bento<br><span style='font-size: 10px; color: rgb(200, 200, 200)'>You can reply to this email to contact us.<br>You're receiving this email because your email was associated with this account.<br>You can safely ignore this email if this account isn't yours, and your email will no longer be associated with this account in a few days if you don't verify this account.</span>", 
                    "Hey there!\n\nVerify your new email address for $username at https://bento.valleynas.uk/user/userdir?hash=$hashVerif&v=0&user=$uid. \nIf this isn't your account, you can safely ignore this email.\n\nBento\n(You can reply to this email to contact us. You're receiving this email because your email was associated with this account.)\n(You can safely ignore this email if this account isn't yours, and your email will no longer be associated with this account in a few days if you don't verify this account.)"
                );
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
                send_mail(
                    $result['email'], 
                    "Changed Password", 
                    "Hey there!<br><br>Your account, <b>$username</b>, recently changed its password.<br>If you didn't make this change, please let us know immediately so that we can help restore your account.<br><br>Bento<br><span style='font-size: 10px; color: rgb(200, 200, 200)'>You can reply to this email to contact us.<br>You're receiving this email because you're currently the email associated with this account.</span>", 
                    "Hey there!\n\nYour account, $username, recently changed its password.\nIf you didn't make this change, please let us know immediately so that we can help restore your account.\n\nBento\n\n(You can reply to this email to contact us. You're receiving this email because you're currently the email associated with this account.)"
                );
            break;
            case 'userdata':
                $val = json_decode($val, false);
                $safeVal = sanitize($val);
                $safeVal = json_encode($safeVal);
                // $val = json_decode($val, true);
                // if(!isset($val)) {
                //     fail("exception: data isn't valid JSON.");
                // }
                // $safeVal = (object) [];
                // foreach($val as $dkey => $deck) {
                //     $safeVal->$dkey = (object) [];
                //     foreach($deck as $prob => $data) {
                //         $newProb = htmlspecialchars(strip_tags($prob));
                //         $newItem = [];
                //         $newItem['last'] = (int)$data['last'];
                //         $newItem['box'] = (int)$data['box'];
                //         $newItem['score'] = (int)$data['score'];
                //         $safeVal->$dkey->$newProb = $newItem;
                //     }
                // }
                // $safeVal = json_encode($safeVal);
                $sql = "UPDATE users SET userdata = ? WHERE id = ?;";
                $stmt = $conn->prepare($sql);
                $stmt->bind_param("si", $safeVal, $_SESSION['uid']);
                $stmt->execute();
                $stmt->close();
                $_SESSION['userdata'] = $safeVal;
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
                if($val !== "") {
                    $data = explode(",", $val, 2);
                    $data = $data[1];
                    $decodedVal = base64_decode($data);
                    $imageValid = imagecreatefromstring($decodedVal);
                    if($imageValid === false) {
                        fail("exception: deckpic isn't a valid image. For security purposes, the server has denied the image.");
                    }
                }
                if(strlen($val) > 3 * 1000 * 1000) {
                    fail('size limit');
                }
                $sql = "UPDATE users SET pfp = ? WHERE id = ?;";
                $stmt = $conn->prepare($sql);
                $stmt->bind_param("si", $val, $_SESSION['uid']);
                $stmt->execute();
                $stmt->close();
                $_SESSION['pfp'] = $val;
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