<?php
    require_once '../funcs.php';
    validate_request();
    // Remove session
    session_start();
    session_unset();
    session_destroy();
    success();