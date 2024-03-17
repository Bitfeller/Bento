<?php
    // Essential functions
    function fail($reason) {
        echo json_encode(['status' => 'error', 'reason' => $reason]);
        exit();
    }
    function access_fail() {
        echo "Invalid.";
        exit();
    }
    // Make valid request
    $content_type = $_SERVER['CONTENT_TYPE'];
    if($content_type !== 'application/json') {
        access_fail();
    }
    // Fetch decks
    require_once 'deck_dbh.php';
    if(!$conn) {
        fail("conn: " . mysqli_connect_error());
    }
    $sql = "SELECT * FROM decks WHERE public = 1";
    $stmt = mysqli_stmt_init($conn);
    if(!mysqli_stmt_prepare($stmt, $sql)) {
        fail("stmt: ". mysqli_stmt_error($stmt));
    }
    mysqli_stmt_execute($stmt);
    $raw_result = mysqli_stmt_get_result($stmt);
    $decks = [];
    while($row = mysqli_fetch_assoc($raw_result)) {
        unset($row->viewdata);
        unset($row->public);
        $decks[] = $row;
    }
    mysqli_stmt_close($stmt);
    echo json_encode(['status' => 'success', 'data' => json_encode($decks)]);