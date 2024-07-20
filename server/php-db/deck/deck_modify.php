<?php
    require_once '../funcs.php';
    validate_request();
    $data = get_data('d_id', 'setting', 'val');
    require_types('nss', 'd_id', 'setting', 'val');
    // Make sure session exists
    session_start();
    if(!isset($_SESSION['uid'])) {
        fail("no session");
    }
    // Get body values
    $id = $data['d_id'];
    $owner = $_SESSION['username'];
    $setting = $data['setting'];
    $val = $data['val'];
    try {
        require_once '../dbh.php';
        // Fetch deck
        $sql = "SELECT * FROM decks WHERE id = ? AND owner = ?;";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("is", $id, $owner);
        $stmt->execute();
        $result = mysqli_fetch_assoc($stmt->get_result());
        if(!$result) {
            fail("no deck");
        }
        $stmt->close();
        switch($setting) {
            case "name":
                // Check if name is valid
                if(!preg_match("/^[\-A-Za-z0-9\s]*$/", $val)) {
                    fail("invalid name");
                }
                // Check if name is already taken by another deck from same user
                $sql = "SELECT * FROM decks WHERE name = ? AND owner = ?;";
                $stmt = $conn->prepare($sql);
                $stmt->bind_param("ss", $val, $owner);
                $stmt->execute();
                if(mysqli_fetch_assoc($stmt->get_result())) {
                    fail("name taken");
                }
                $stmt->close();
                // Update name
                $sql = "UPDATE decks SET name = ? WHERE id = ?;";
                $stmt = $conn->prepare($sql);
                $stmt->bind_param("si", $val, $id);
                $stmt->execute();
                $stmt->close();
                success();
            break;
            case "deckpic":
                $saveVal = htmlspecialchars(strip_tags($val));
                if(strlen($safeVal) > 2 * 1000 * 1000) {
                    fail('size limit');
                }
                $sql = "UPDATE decks SET deckpic = ? WHERE id = ?;";
                $stmt = $conn->prepare($sql);
                $stmt->bind_param("si", $saveVal, $id);
                $stmt->execute();
                $stmt->close();
                success();
            case "data":
                $val = json_decode($val, true);
                if($val == null) {
                    fail("exception: data isn't valid JSON.");
                }
                $safeVal = [];
                $safeVal['desc'] = htmlspecialchars(strip_tags($val['desc']));
                $safeVal['contnt'] = [];
                // Check for duplicate questions
                $problems = [];
                foreach($val['contnt'] as $prob => $data) {
                    $newProb = htmlspecialchars(strip_tags($prob));
                    if(in_array($newProb, $problems)) {
                        fail('same problem');
                    }
                    $problems[] = $newProb;
                    $newItem = [];
                    $newItem['type'] = htmlspecialchars(strip_tags($data['type']));
                    if(isset($data['op'])) {
                        $newItem['op'] = json_decode(htmlspecialchars(strip_tags(json_encode($data['op']))));
                    }
                    $newItem['ans'] = json_decode(htmlspecialchars(strip_tags(json_encode($data['ans']))));
                    $safeVal['contnt'][$newProb] = $newItem;
                }
                $safeVal = json_encode($safeVal);
                $sql = "UPDATE decks SET data = ? WHERE id = ?;";
                $stmt = $conn->prepare($sql);
                $stmt->bind_param("si", $safeVal, $id);
                $stmt->execute();
                $stmt->close();
                success();
            break;
            case "public":
                $sql = "UPDATE decks SET public = ? WHERE id = ?;";
                $stmt = $conn->prepare($sql);
                $val = (int)$val;
                if($val > 1 || $val < 0) {
                    $val = 0;
                }
                $stmt->bind_param("ii", $val, $id);
                $stmt->execute();
                $stmt->close();
                success();
            break;
        }
    } catch(Exception $e) {
        fail("exception: " . $e->getMessage());
    }