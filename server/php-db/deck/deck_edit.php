<?php
    require_once '../module.php';
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
        $conf = get_server_config();
        $conn = connect_to_db();
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
                if($result['name'] == $val) {
                    success();
                }
                // Sanitize name
                $val = htmlspecialchars(strip_tags($val));
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
                if($val !== "" && $conf['check_image'] == true) {
                    try {
                        $data = explode(",", $val, 2);
                        $data = $data[1];
                        $decodedVal = base64_decode($data);
                        $imageValid = imagecreatefromstring($decodedVal);
                        if($imageValid === false) {
                            fail("exception: deckpic isn't a valid image. For security purposes, the server has denied the image.");
                        }
                    } catch(Throwable $e) {
                        fail("exception: deckpic isn't a valid image. For security purposes, the server has denied the image.");
                    }
                }
                if(strlen($val) > 2 * 1000 * 1000) {
                    fail('size limit');
                }
                $path = $conf['file_db'] . 'decks/primary/' . $id . '.pic';
                file_put_contents($path, data: $val);
                success();
            case "data":
                $val = json_decode($val, false);
                $safeVal = sanitize($val);
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
            case 'delete':
                $sql = "DELETE FROM decks WHERE id = ?;";
                $stmt = $conn->prepare($sql);
                $stmt->bind_param("i", $id);
                $stmt->execute();
                $stmt->close();
                success();
            break;
        }
    } catch(Exception $e) {
        fail("exception: " . $e->getMessage());
    }