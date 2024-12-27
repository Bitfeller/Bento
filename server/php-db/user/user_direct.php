<?php
    require_once '../module.php';
    validate_request();
    $data = get_data('mode', 'uid', 'verif');
    require_types('snss', 'mode', 'uid', 'verif', 'newPwd');
    // Get body values
    $mode = $data['mode'];
    $uid = $data['uid'];
    $verif = $data['verif'];
    $newPwd = $data['newPwd'] or "";
    try {
        $conn = connect_to_db();
        if($mode === "emailverif") {
            $sql = "SELECT * FROM users WHERE id = ? LIMIT 1;";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("i", $uid);
            $stmt->execute();
            $res = $stmt->get_result()->fetch_assoc();
            if(!$res) fail("no user");
            $userVerif = $res['verif'];
            if($verif != $userVerif) fail("invalid verif");
            $sql = "UPDATE users SET verified = ?, verif = ? WHERE id = ? LIMIT 1;";
            $stmt = $conn->prepare($sql);
            $verified = 1;
            $verif = "";
            $stmt->bind_param("isi", $verified, $verif, $uid);
            $stmt->execute();
            $stmt->close();
            session_start();
            if(isset($_SESSION['uid'])) $_SESSION['verified'] = true;
            success();
        } else if($mode === "pwdrecover") {
            session_start();
            if(isset($_SESSION['pwd_change'])) {
                unset($_SESSION['pwd_change']);
                unset($_SESSION['pwd_uid']);
                unset($_SESSION['pwd_timestamp']);
            }
            $sql = "SELECT * FROM users WHERE id = ? LIMIT 1;";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("i", $uid);
            $stmt->execute();
            $res = $stmt->get_result()->fetch_assoc();
            if(!$res) fail("no user");
            if($res['verified'] === 0) fail("not verified");
            $userVerif = $res['verif'];
            if($verif != $userVerif) fail("invalid verif");
            $_SESSION['pwd_change'] = true;
            $_SESSION['pwd_uid'] = $uid;
            $_SESSION['pwd_timestamp'] = time();
            success();
        } else if($mode === "newpwd") {
            session_start();
            if(!isset($_SESSION['pwd_change']) || !isset($_SESSION['pwd_uid'])) fail("not valid");
            if((time() - $_SESSION['pwd_timestamp']) > 10 * 60) {
                unset($_SESSION['pwd_change']);
                unset($_SESSION['pwd_uid']);
                unset($_SESSION['pwd_timestamp']);
                fail('past time');
            }
            if(!isset($newPwd)) fail("no pwd");
            $sql = "UPDATE users SET password = ?, verif = ? WHERE id = ? LIMIT 1;";
            $stmt = $conn->prepare($sql);
            $hashPwd = password_hash($newPwd, PASSWORD_DEFAULT);
            $verif = "";
            $stmt->bind_param("ssi", $hashPwd, $verif, $_SESSION['pwd_uid']);
            $stmt->execute();
            $stmt->close();
            unset($_SESSION['pwd_change']);
            unset($_SESSION['pwd_uid']);
            unset($_SESSION['pwd_timestamp']);
            success();
        }
    } catch(Exception $e) {
        fail('exception: ' . $e->getMessage());
    }