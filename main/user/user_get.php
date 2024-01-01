<?php
    require_once '../funcs.php';
    validate_request();
    session_start();
    if(!isset($_SESSION['uid']) || !isset($_SESSION['username'])) {
        fail('no session');
    } else {
        success(
            ["uid"=>$_SESSION['uid'], "username"=>$_SESSION['username'], "email"=>$_SESSION['email'], "reviews"=>$_SESSION['reviews'], "verified"=>$_SESSION['verified'], "creation_date"=>$_SESSION['creation_date']]
        );
    }