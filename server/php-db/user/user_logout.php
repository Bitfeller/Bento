<?php
    require_once '../module.php';
    validate_request();
    // Remove session
    session_start();
    session_unset();
    session_destroy();
    success();