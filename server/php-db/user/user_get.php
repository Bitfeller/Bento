<?php
    require_once '../module.php';
    validate_request();
    session_start();
    if(!isset($_SESSION['uid']) || !isset($_SESSION['username'])) {
        fail('no session');
    } else {
        try {
            success(
                ["uid"=>$_SESSION['uid'], "username"=>$_SESSION['username'], "pfp"=>$_SESSION['pfp'], "email"=>$_SESSION['email'], "userdata"=>$_SESSION['userdata'], "verified"=>$_SESSION['verified'], "creation_date"=>$_SESSION['creation_date'], "notifsub"=>$_SESSION['notifsub']]
            );
        } catch(e) {
            header('Location: /');
            session_start();
            session_unset();
            session_destroy();
            fail("invalid user data");
        }
    }