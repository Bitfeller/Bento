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
    // Add deck
    $json_data = file_get_contents('php://input');
    $data = json_decode($json_data, true);
    if(isset($data['name'])) {
        // Init database
        require_once 'deck_dbh.php';
        if(!$conn) {
            fail("conn: ". mysqli_connect_error());
        }
        // Get body values
        session_start();
        $name = $data['name'];
        $owner = $_SESSION['uid'];
        $data = $data['data'];
        $public = $data['public'];
        // Check if name is valid
        if(!preg_match("/^[\-A-Za-z0-9\s]*$/", $name)) {
            fail("invalid name");
        }
        // Add deck to database
        $sql = "INSERT INTO decks (name, owner, data, viewdata, public) VALUES (?, ?, ?, ?, ?)";
        $stmt = mysqli_stmt_init($conn);
        if(!mysqli_stmt_prepare($stmt, $sql)) {
            fail("stmt: ". mysqli_stmt_error($stmt));
        }
        $viewdata = '[]';
        mysqli_stmt_bind_param($stmt, "sisss", $name, $owner, $data, $viewdata, $public);
        mysqli_stmt_execute($stmt);
        mysqli_stmt_close($stmt);
    } else {
        access_fail();
    }