<?php
    require_once '../module.php';
    validate_request();
    $data = get_data('time');
    require_types('n', 'time');
    // Make sure session exists
    session_start();
    if(!isset($_SESSION['uid'])) {
        fail("no session");
    }
    // Get body values
    $time = $data['time'];
    $owner = $_SESSION['username'];
    try {
        $conf = get_server_config();
        $conn = connect_to_db();
        // @ = no warnings
        $path = $conf['file_db'] . 'drafts/' . $_SESSION['uid'] . '-' . $time . '.pic';
        $pic = @file_get_contents($path);
        if($pic !== "" && $pic === false) {
            @unlink($path); // Delete if it exists
            fail("broken img");
        } else {
            success($pic);
        }
    } catch(Exception $e) {
        fail("exception: " . $e->getMessage());
    }