<?php
    require_once '../module.php';
    validate_request();
    $data = get_data('d_id', 'setting', 'val');
    require_types('nss', 'd_id', 'setting', 'val');
    // Make sure session exists
    session_start();
    if(!isset($_SESSION['uid'])) fail("no session");
    // Get body values
    $id = $data['d_id'];
    $owner = $_SESSION['username'];
    $setting = $data['setting'];
    $val = $data['val'];
    try {
        $conf = get_server_config();
        $conn = connect_to_db();
        // Fetch deck
        $sql = "SELECT * FROM decks WHERE id = ? AND owner = ? LIMIT 1;";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("is", $id, $owner);
        $stmt->execute();
        $result = $stmt->get_result()->fetch_assoc();
        if(!$result) fail("no deck");
        $stmt->close();
        switch($setting) {
            case "name":
                // Sanitize name; check
                $val = sanitize($val);
                $result['name'] == $val && success();
                if(filter($val) == true) fail("flagged");
                // Check if name is already taken by another deck from same user
                $sql = "SELECT * FROM decks WHERE name = ? AND owner = ? LIMIT 1;";
                $stmt = $conn->prepare($sql);
                $stmt->bind_param("ss", $val, $owner);
                $stmt->execute();
                if($stmt->get_result()->fetch_assoc()) fail("name taken");
                $stmt->close();
                // Update name
                $sql = "UPDATE decks SET name = ? WHERE id = ? LIMIT 1;";
                $stmt = $conn->prepare($sql);
                $stmt->bind_param("si", $val, $id);
                $stmt->execute();
                $stmt->close();
                success();
            break;
            case "deckpic":
                if($val !== "" && $conf['check_image'] == true) {
                    try {
                        $data = explode(",", $val, 2)[1];
                        $decodedVal = base64_decode($data);
                        if(!imagecreatefromstring($decodedVal)) fail("not a valid/secure image");
                    } catch(Throwable $e) {
                        fail("not a valid/secure image.");
                    }
                }
                if(strlen($val) > $conf['max_image_size']) fail('size limit');
                $path = $conf['file_db'] . 'decks/primary/' . $id . '.pic';
                file_put_contents($path, $val);
                success();
            case "data":
                $val = json_decode($val, false);
                $safeVal = sanitize($val);
                if(filter($safeVal) == true) fail("flagged");
                $safeVal = json_encode($safeVal);
                $sql = "UPDATE decks SET data = ? WHERE id = ? LIMIT 1;";
                $stmt = $conn->prepare($sql);
                $stmt->bind_param("si", $safeVal, $id);
                $stmt->execute();
                $stmt->close();
                success();
            break;
            case "public":
                $sql = "UPDATE decks SET public = ? WHERE id = ? LIMIT 1;";
                $stmt = $conn->prepare($sql);
                $val = ($val == 0 || $val == 1) ? (int)$val : 0;
                $stmt->bind_param("ii", $val, $id);
                $stmt->execute();
                $stmt->close();
                success();
            break;
            case 'delete':
                $sql = "DELETE FROM decks WHERE id = ?;";
                $stmt = $conn->prepare($sql);
                $stmt->bind_param("i", $id);
                $stmt->execute();
                $stmt->close();
                success();
            break;
            default:
                fail("invalid setting");
            break;
        }
    } catch(Throwable $e) {
        fail("exception: " . $e->getMessage());
    }