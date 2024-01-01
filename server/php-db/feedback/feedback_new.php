<?php
    require '../module.php';
    validate_request();
    $data = get_data('feedback');
    require_types('s', 'feedback'); // professional code right here
    // wouldn't you agree?
    session_start();
    if(!isset($_SESSION['uid'])) {
        fail('no session');
    }
    $id = $_SESSION['uid'];
    $feedback = $data['feedback'];
    try {
        $conn = connect_to_db();
        $sql = "INSERT INTO feedback (uid, feedback) VALUES (?, ?)";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("is", $id, $feedback);
        $stmt->execute();
        success();
    } catch (Throwable $e) {
        fail("exception: " . $e->getMessage());
    }