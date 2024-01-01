<?php
    require_once '../funcs.php';
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
        // Sanitize values
        $decodedpic = base64_decode($deckpic);
        $deckpic = htmlspecialchars(strip_tags($decodedpic));
        $deckpic = base64_encode($deckpic);
        $deckData = json_decode($deckData, true);
        if($deckData == null) {
            fail("exception: data isn't valid JSON.");
        }
        $newVal = [];
        $newVal['desc'] = htmlspecialchars(strip_tags($deckData['desc']));
        $newVal['contnt'] = (object) [];
        // Check for duplicate questions
        $problems = [];
        foreach($deckData['contnt'] as $prob => $data) {
            $newProb = htmlspecialchars(strip_tags($prob));
            if(in_array($newProb, $problems)) {
                fail('same problem');
            }
            $problems[] = $newProb;
            $newItem = [];
            $newItem['type'] = htmlspecialchars(strip_tags($data['type']));
            if(isset($data['op'])) {
                $newItem['op'] = [];
                foreach($data['op'] as $op) {
                    $newItem['op'][] = htmlspecialchars(strip_tags($op));
                }
            }
            if(gettype($data['ans']) == 'array') {
                $newItem['ans'] = [];
                foreach($data['ans'] as $ans) {
                    $newItem['ans'][] = htmlspecialchars(strip_tags($ans));
                }
            } else {
                $newItem['ans'] = htmlspecialchars(strip_tags($data['ans']));
            }
            $newVal['contnt']->$newProb = $newItem;
        }
        $deckData = json_encode($newVal);
        // Check image limit
        if(strlen($deckpic) > 2 * 1000 * 1000) {
            fail('size limit');
        }
        // Add deck to database
        $sql = "INSERT INTO decks (name, deckpic, owner, data, viewdata, public) VALUES (?, ?, ?, ?, ?, ?);";
        $stmt = $conn->prepare($sql);
        $viewdata = '[]';
        $stmt->bind_param("sssssi", $name, $deckpic, $owner, $deckData, $viewdata, $public);
        $stmt->execute();
        $stmt->close();
        success();
    } catch(Exception $e) {
        fail("exception: " . $e->getMessage());
    }