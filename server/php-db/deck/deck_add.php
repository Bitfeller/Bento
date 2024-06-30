<?php
    require_once '../funcs.php';
    validate_request();
    $data = get_data('name', 'data', 'public');
    require_types('ssn', 'name', 'data', 'public');
    // Make sure session exists
    session_start();
    if(!isset($_SESSION['uid'])) {
        fail("no session");
    }
    // Get body values
    $name = $data['name'];
    $owner = $_SESSION['username'];
    $deckData = $data['data'];
    $public = $data['public'];
    try {
        require_once '../dbh.php';
        // Check if name is valid
        if(!preg_match("/^[\-A-Za-z0-9\s]*$/", $name)) {
            fail("invalid name");
        }
        // Check for previous deck made from same user
        $sql = "SELECT * FROM decks WHERE name = ? AND owner = ?;";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("ss", $name, $owner);
        $stmt->execute();
        if(mysqli_fetch_assoc($stmt->get_result())) {
            fail("name exists");
        }
        $stmt->close();
        // Add deck to database
        $sql = "INSERT INTO decks (name, owner, data, viewdata, public) VALUES (?, ?, ?, ?, ?);";
        $stmt = $conn->prepare($sql);
        $viewdata = '[]';
        $stmt->bind_param("ssssi", $name, $owner, $deckData, $viewdata, $public);
        $stmt->execute();
        $stmt->close();
        success();
    } catch(Exception $e) {
        fail("exception: " . $e->getMessage());
    }