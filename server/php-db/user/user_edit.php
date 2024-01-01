<?php
    require_once '../module.php';
    validate_request();
    $data = get_data('setting', 'val');
    require_types('sss', 'setting', 'val', 'verifpwd');
    // Make sure session exists
    session_start();
    if(!isset($_SESSION['uid'])) fail("no session");
    // Get body values
    $setting = $data['setting'];
    $val = $data['val'];
    $verifpwd = $data['verifpwd'];
    try {
        $conf = get_server_config();
        $conn = connect_to_db();
        // Get user
        $sql = "SELECT * FROM users WHERE username = ? OR email = ? LIMIT 1;";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("ss", $_SESSION['username'], $_SESSION['email']);
        $stmt->execute();
        $result = $stmt->get_result()->fetch_assoc();
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
        // Check drafts
        function check_drafts($conf, $result, $drafts) {
            // Check for drafts without images
            foreach($drafts as $key => $data) {
                $path = $conf['file_db'] . 'drafts/' . $result['id'] . '-' . $key . '.pic';
                if(!file_exists($path)) {
                    fclose(fopen($path, "w"));
                    // If image
                    if(isset($data->img)) file_put_contents($path, $data->img);
                }
                if(isset($data->img)) unset($data->img);
            }
            // Check for old drafts
            $all = glob($conf['file_db'] . 'drafts/' . $result['id'] . '-*.pic');
            if($all) {
                foreach($all as $file) {
                    $file = explode('-', $file);
                    $file = explode('.', $file[1]);
                    $file = $file[0];
                    if(!isset($drafts->$file)) unlink($conf['file_db'] . 'drafts/' . $result['id'] . '-' . $file . '.pic');
                }
            }
        }
        switch($setting) {
            case "username":
                // Make sure username is valid
                if(!preg_match("/^[a-zA-Z0-9\-!@#$%^&*\(\)\[\]\{\}\.]*$/", $val)) fail("invalid username");
                if(filter($val) == true) fail("flagged");
                // Check if username is taken
                $sql = "SELECT * FROM users WHERE username = ? LIMIT 1;";
                $stmt = $conn->prepare($sql);
                $stmt->bind_param("s", $val);
                $stmt->execute();
                if($stmt->get_result()->fetch_assoc()) fail("username taken");
                $stmt->close();
                // Update username
                $sql = "UPDATE users SET username = ? WHERE id = ? LIMIT 1;";
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
                if(!password_verify($verifpwd, $result['password'])) fail('invalid pwd');
                // Make sure email is valid
                if(!filter_var($val, FILTER_VALIDATE_EMAIL)) fail('invalid email');
                // Check if email is taken
                $sql = "SELECT * FROM users WHERE email = ? LIMIT 1;";
                $stmt = $conn->prepare($sql);
                $stmt->bind_param("s", $val);
                $stmt->execute();
                if($stmt->get_result()->fetch_assoc()) fail("email taken");
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
                for($i = 0; $i < $len; $i++) $verifStr .= $chars[random_int(0, $len-1)];
                $hashVerif = password_hash($verifStr, PASSWORD_DEFAULT);
                // Set email
                $sql = "UPDATE users SET email = ?, verified = ?, verif = ? WHERE id = ? LIMIT 1;";
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
                    "Hey there!<br><br>Verify your new email address for $username <a href='https://bento-app.uk/user/userdir?hash=$hashVerif&v=0&user=$uid'>here</a>.<br><br>If this isn't your account, you can safely ignore this email.<br><br>Bento<br><span style='font-size: 10px; color: rgb(200, 200, 200)'>You can reply to this email to contact us.<br>You're receiving this email because your email was associated with this account.<br>You can safely ignore this email if this account isn't yours, and your email will no longer be associated with this account in a few days if you don't verify this account.</span>", 
                    "Hey there!\n\nVerify your new email address for $username at https://bento-app.uk/user/userdir?hash=$hashVerif&v=0&user=$uid. \nIf this isn't your account, you can safely ignore this email.\n\nBento\n(You can reply to this email to contact us. You're receiving this email because your email was associated with this account.)\n(You can safely ignore this email if this account isn't yours, and your email will no longer be associated with this account in a few days if you don't verify this account.)"
                );
            break;
            case "password":
                if(!password_verify($verifpwd, $result['password'])) fail('invalid pwd');
                $sql = "UPDATE users SET password = ? WHERE id = ? LIMIt 1";
                $stmt = $conn->prepare($sql);
                $newPwd = password_hash($val, PASSWORD_DEFAULT);
                $stmt->bind_param("si", $newPwd, $_SESSION['uid']);
                $stmt->execute();
                $stmt->close();
                $username = $result['username'];
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
                check_drafts($conf, $result, $safeVal->drafts);
                $safeVal = json_encode($safeVal);
                $sql = "UPDATE users SET userdata = ? WHERE id = ? LIMIt 1;";
                $stmt = $conn->prepare($sql);
                $stmt->bind_param("si", $safeVal, $_SESSION['uid']);
                $stmt->execute();
                $stmt->close();
                $_SESSION['userdata'] = $safeVal;
            break;
            // Individual userdata actions
            case 'draftdecks':
                $val = json_decode($val, false);
                $safeVal = sanitize($val);
                check_drafts($conf, $result, $safeVal);
                $safeVal = json_encode($safeVal);
                $curr = $_SESSION['userdata'];
                $curr = json_decode($curr, false);
                $curr->draftdecks = json_decode($safeVal, false);
                $curr = json_encode($curr);
                $sql = "UPDATE users SET userdata = ? WHERE id = ? LIMIT 1;";
                $stmt = $conn->prepare($sql);
                $stmt->bind_param("si", $curr, $_SESSION['uid']);
                $stmt->execute();
                $stmt->close();
                $_SESSION['userdata'] = $curr;
            break;
            case 'reviews':
                $val = json_decode($val, false);
                $safeVal = sanitize($val);
                $safeVal = json_encode($safeVal);
                $curr = $_SESSION['userdata'];
                $curr = json_decode($curr, false);
                $curr->reviews = json_decode($safeVal, false);
                $curr = json_encode($curr);
                $sql = "UPDATE users SET userdata = ? WHERE id = ? LIMIT 1;";
                $stmt = $conn->prepare($sql);
                $stmt->bind_param("si", $curr, $_SESSION['uid']);
                $stmt->execute();
                $stmt->close();
                $_SESSION['userdata'] = $curr;
            break;
            case 'theme':
                $curr = $_SESSION['userdata'];
                $curr = json_decode($curr, false);
                $curr->theme = (int)$val;
                $curr = json_encode($curr);
                $sql = "UPDATE users SET userdata = ? WHERE id = ? LIMIT 1;";
                $stmt = $conn->prepare($sql);
                $stmt->bind_param("si", $curr, $_SESSION['uid']);
                $stmt->execute();
                $stmt->close();
                $_SESSION['userdata'] = $curr;
            break;
            case 'view':
                $sql = "SELECT * FROM decks WHERE id = ? LIMIT 1;";
                $stmt = $conn->prepare($sql);
                $val = (int)$val;
                $stmt->bind_param("i", $val);
                $stmt->execute();
                $result = $stmt->get_result()->fetch_assoc();
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
                    $sql = "UPDATE decks SET viewdata = ? WHERE id = ? LIMIT 1;";
                    $stmt = $conn->prepare($sql);
                    $stmt->bind_param("si", $viewdata, $val);
                    $stmt->execute();
                    $stmt->close();
                }
            break;
            case 'pfp':
                if($val !== "" && $conf['check_image']) {
                    $data = explode(",", $val, 2)[1];
                    $decodedVal = base64_decode($data);
                    if(imagecreatefromstring($decodedVal) === false) fail("exception: deckpic isn't a valid image. For security purposes, the server has denied the image.");
                }
                if(strlen($val) > $conf['max_image_size'] && $conf['check_image']) fail('size limit');
                // Edit user's pfp
                $path = $conf['file_db'] . 'pfps/' . $_SESSION['uid'] . '.pfp';
                file_put_contents($path, $val);
                // Update user's pfp
                $_SESSION['pfp'] = $val;
            break;
            case 'notifsub':
                $sql = "UPDATE users SET notifsub = ? WHERE id = ? LIMIT 1;";
                $stmt = $conn->prepare($sql);
                $val = (int)$val;
                $stmt->bind_param("ii", $val, $_SESSION['uid']);
                $stmt->execute();
                $stmt->close();
                $_SESSION['notifsub'] = $val;
            break;
            case 'delete':
                if(!password_verify($verifpwd, $result['password'])) fail('invalid pwd');
                // Delete draft pics
                $all = glob($conf['file_db'] . 'drafts/' . $result['id'] . '-*.pic');
                if($all) foreach($all as $file) unlink($file);
                // Delete user
                $sql = "DELETE FROM users WHERE id = ? LIMIt 1;";
                $stmt = $conn->prepare($sql);
                $stmt->bind_param("i", $_SESSION['uid']);
                $stmt->execute();
                $stmt->close();
                // Delete pfp
                $path = $conf['file_db'] . 'pfps/' . $_SESSION['uid'] . '.pfp';
                if(file_exists($path)) unlink($path);
                // Remove session
                session_unset();
                session_destroy();
            break;
            case 'resend-verif-email':
                if($result['verified'] == true) fail('verified');
                $uid = $result['id'];
                $username = $result['username'];
                $email = $result['email'];
                $hashVerif = $result['verif'];
                send_mail(
                    $email,
                    "Email Verification", 
                    "Hey there!<br><br>Verify your new email address for <b>$username</b> <a href='https://bento-app.uk/user/userdir?hash=$hashVerif&v=0&user=$uid'>here</a>.<br><br>If this isn't your account, you can safely ignore this email.<br><br>Bento<br><span style='font-size: 10px; color: rgb(200, 200, 200)'>You can reply to this email to contact us.<br>You're receiving this email because your email was associated with this account.<br>You can safely ignore this email if this account isn't yours, and your email will no longer be associated with this account in a few days if you don't verify this account.</span>", 
                    "Hey there!\n\nVerify your new email address for $username at https://bento-app.uk/user/userdir?hash=$hashVerif&v=0&user=$uid. If this isn't your account, you can safely ignore this email.\n\nBento\n(You can reply to this email to contact us. You're receiving this email because your email was associated with this account.)\n(You can safely ignore this email if this account isn't yours, and your email will no longer be associated with this account in a few days if you don't verify this account.)"
                );
            break;
        }
        success();
    } catch(Exception $e) {
        fail("exception: " . $e->getMessage());
    }