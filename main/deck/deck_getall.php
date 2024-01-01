<?php
    require_once '../funcs.php';
    validate_request();
    // Make sure session exists
    session_start();
    if(!isset($_SESSION['uid'])) {
        fail("no session");
    }
    try {
        require_once '../dbh.php';
        // Fetch decks
        $sql = "SELECT * FROM decks WHERE public = ? OR owner = ?;";
        $stmt = $conn->prepare($sql);
        $public = 1;
        $stmt->bind_param("is", $public, $_SESSION['username']);
        $stmt->execute();
        $raw_res = $stmt->get_result();
        $decks = [];
        while($row = mysqli_fetch_assoc($raw_res)) {
            if($row['owner'] !== $_SESSION['username']) {
                unset($row['viewdata']);
                unset($row['public']);
            }
            $decks[] = $row;
        }
        $stmt->close();
        success(json_encode($decks));
    } catch(Exception $e) {
        fail("exception: " . $e->getMessage());
    }