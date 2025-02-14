<?php
    require_once '../module.php';
    validate_request();
    session_start();
    if(!isset($_SESSION['uid'])) fail('no session');
    try {
        success(json_encode($_SESSION['uid']));
    } catch(_) {
        header('Location: /');
        session_start();
        session_unset();
        session_destroy();
        fail("invalid user data");
    }