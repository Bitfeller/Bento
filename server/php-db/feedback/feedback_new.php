<?php
    require '../module.php';
    validate_request();
    $data = get_data('feedback');
    require_types('s', 'feedback');
    session_start();
    if(!isset($_SESSION['uid'])) fail('no session');
    $id = $_SESSION['uid'];
    $username = $_SESSION['username'];
    $feedback = $data['feedback'];
    try {
        $conn = connect_to_db();
        $sql = "INSERT INTO feedback (uid, username, feedback) VALUES (?, ?, ?)";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("iss", $id, $username, $feedback);
        $stmt->execute();
        success();
    } catch (Throwable $e) {
        fail("exception: " . $e->getMessage());
    }