<?php
    require_once '../module.php';
    validate_request();
    $data = get_data('name', 'deckpic', 'data', 'public');
    require_types('sssn', 'name', 'deckpic', 'data', 'public');
    // Make sure session exists
    session_start();
    if(!isset($_SESSION['uid'])) {
        fail("no session");
    }
    // Get body values
    $name = $data['name'];
    $deckpic = $data['deckpic'];
    $owner = $_SESSION['username'];
    $deckData = $data['data'];
    $public = $data['public'];
    if(strlen($name) == 0) {
        fail("invalid name");
    }
    try {
        $conf = get_server_config();
        $conn = connect_to_db();
        // Sanitize name
        $name = htmlspecialchars(strip_tags($name));
        // Check for previous deck made from same user
        $sql = "SELECT * FROM decks WHERE name = ? AND owner = ?;";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("ss", $name, $owner);
        $stmt->execute();
        if(mysqli_fetch_assoc($stmt->get_result())) {
            fail("name exists");
        }
        $stmt->close();
        // Sanitize values
        if($deckpic !== "" && $conf['check_image'] == true) {
            $deckpicData = explode(",", $deckpic, 2);
            $deckpicData = $deckpicData[1];
            $decodedpic = base64_decode($deckpicData);
            $imageValid = imagecreatefromstring($decodedpic);
            if($imageValid === false) {
                fail("exception: deckpic isn't a valid image. For security purposes, the server has denied the image.");
            }
        }
        $deckData = json_decode($deckData, false);
        $deckData = sanitize($deckData);
        $deckData = json_encode($deckData);
        if(strlen($deckpic) > 2 * 1000 * 1000) {
            fail('size limit');
        }
        // Add deck to database
        $sql = "INSERT INTO decks (name, owner, data, viewdata, public) VALUES (?, ?, ?, ?, ?, ?);";
        $stmt = $conn->prepare($sql);
        $viewdata = '[]';
        $stmt->bind_param("ssssi", $name, $owner, $deckData, $viewdata, $public);
        $stmt->execute();
        $stmt->close();
        // Get deck
        $sql = "SELECT * FROM decks WHERE name = ? AND owner = ?;";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("ss", $name, $owner);
        $stmt->execute();
        $result = mysqli_fetch_assoc($stmt->get_result());
        if(!$result) {
            fail("refetch failed?");
        }
        // Create deck pic
        $path = $conf['file_db'] . 'decks/primary/' . $result['id'] . '.pic';
        $handle = fopen($path, "w");
        if(!$handle) {
            fail("CRITICAL: couldn't create deckpic!");
        }
        fclose($handle);
        if($deckpic !== "") {
            file_put_contents($path, $deckpic);
        }
        success();
    } catch(Exception $e) {
        fail("exception: " . $e->getMessage());
    }