<?php
    require_once '../funcs.php';
    validate_request();
    $data = get_data("mode");
    // Get body values
    $mode = $data['mode'];
    $uid = $data['uid'];
    $verif = $data['verif'];
    $newPwd = null;
    if(isset($data['newPwd'])) {
        $newPwd = $data['newPwd'];
    }
    try {
        require_once "../dbh.php";
        if($mode === "emailverif") {
            $sql = "SELECT * FROM users WHERE id = ?;";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("i", $uid);
            $stmt->execute();
            $res = mysqli_fetch_assoc($stmt->get_result());
            if(!$res) {
                fail("no user");
            }
            $userVerif = $res['verif'];
            $valid = password_verify($verif, $userVerif);
            if(!$valid) {
                fail("invalid verif");
            }
            $sql = "UPDATE users SET verified = ? AND verif = ? WHERE id = ?;";
            $stmt = $conn->prepare($sql);
            $verified = 1;
            $verif = "";
            $stmt->bind_param("isi", $verified, $verif, $uid);
            $stmt->execute();
            success();
        } else if($mode === "pwdrecover") {
            session_start();
            if(isset($_SESSION['pwd_change'])) {
                unset($_SESSION['pwd_change']);
                unset($_SESSION['pwd_uid']);
            }
            $sql = "SELECT * FROM users WHERE id = ?;";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("i", $uid);
            $stmt->execute();
            $res = mysqli_fetch_assoc($stmt->get_result());
            if(!$res) {
                fail("no user");
            }
            $verified = $res['verified'];
            if($verified === 0) {
                fail("not verified");
            }
            $userVerif = $res['verif'];
            $valid = password_verify($verif, $userVerif);
            $_SESSION['pwd_change'] = true;
            $_SESSION['pwd_uid'] = $uid;
            success();
        } else if($mode === "newpwd") {
            session_start();
            if(!isset($_SESSION['pwd_change']) || !isset($_SESSION['pwd_uid'])) {
                fail("not valid");
            }
            if(!isset($newPwd)) {
                fail("no pwd");
            }
            $sql = "UPDATE users SET password = ? AND verif = ? WHERE id = ?;";
            $stmt = $conn->prepare($sql);
            $hashPwd = password_hash($newPwd, PASSWORD_DEFAULT);
            $verif = "";
            $stmt->bind_param("ssi", $hashPwd, $verif, $_SESSION['pwd_uid']);
            $stmt->execute();
            $stmt->close();
            unset($_SESSION['pwd_change']);
            unset($_SESSION['pwd_uid']);
            success();
        }
    }