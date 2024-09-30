<?php
    require_once '../module.php';
    validate_request();
    $data = get_data('id');
    require_types('nbb', 'id', 'load_pic', 'load_data');
    // Make sure session exists
    session_start();
    if(!isset($_SESSION['uid'])) {
        fail("no session");
    }
    // Get body values
    $id = $data['id'];
    $load_pic = $data['load_pic'] or false;
    $load_data = $data['load_data'] or true;
    $owner = $_SESSION['username'];
    try {
        $conn = connect_to_db();
        // Get deck
        $sql = "SELECT * FROM decks WHERE id = ? AND (public = ? OR owner = ?);";
        $stmt = $conn->prepare($sql);
        $public = 1;
        $stmt->bind_param("iis", $id, $public, $owner);
        $stmt->execute();
        $result = mysqli_fetch_assoc($stmt->get_result());
        if($result) {
            if($load_pic == false) {
                unset($result['deckpic']);
            }
            if($load_data == false) {
                unset($result['data']);
            }
            success(json_encode($result));
        } else {
            fail("no deck");
        }
    } catch(Exception $e) {
        fail("exception: " . $e->getMessage());
    }