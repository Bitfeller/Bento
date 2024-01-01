<?php
    require_once '../module.php';
    validate_request();
    $data = get_data('setting', 'val');
    require_types('sss', 'setting', 'val', 'verifpwd');
    // Make sure session exists
    session_start();
    if(!isset($_SESSION['uid'])) {
        fail("no session");
    }
    // Get body values
    $setting = $data['setting'];
    $val = $data['val'];
    $verifpwd = $data['verifpwd'];
    try {
        $conn = connect_to_db();
        // Get user
        $sql = "SELECT * FROM users WHERE username = ? OR email = ?;";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("ss", $_SESSION['username'], $_SESSION['email']);
        $stmt->execute();
        $result = mysqli_fetch_assoc($stmt->get_result());
        if(!$result) {
            // Invalid user information
            session_unset();
            session_destroy();
            fail("no user");
        }
        if($result['id'] !== $_SESSION['uid']) {
            // Invalid user information
            session_unset();
            session_destroy();
            fail("no user");
        }
        $stmt->close();
        switch($setting) {
            case "username":
                // Make sure username is valid
                if(!preg_match("/^[A-Za-z0-9]*$/", $val)) {
                    fail("invalid username");
                }
                // Check if username is taken
                $sql = "SELECT * FROM users WHERE username = ?;";
                $stmt = $conn->prepare($sql);
                $stmt->bind_param("s", $val);
                $stmt->execute();
                if(mysqli_fetch_assoc($stmt->get_result())) {
                    fail("username taken");
                }
                $stmt->close();
                // Update username
                $sql = "UPDATE users SET username = ? WHERE id = ?;";
                $stmt = $conn->prepare($sql);
                $stmt->bind_param("si", $val, $_SESSION['uid']);
                $stmt->execute();
                $stmt->close();
                // Update decks to have accurate username as well
                $sql = "UPDATE decks SET owner = ? WHERE owner = ?;";
                $stmt = $conn->prepare($sql);
                $stmt->bind_param("ss", $val, $_SESSION["username"]);
                $stmt->execute();
                $stmt->close();
                // Update session
                $_SESSION['username'] = $val;
            break;
            case "email":
                if(!password_verify($verifpwd, $result['password'])) {
                    fail('invalid pwd');
                }
                // Make sure email is valid
                if(!filter_var($val, FILTER_VALIDATE_EMAIL)) {
                    fail('invalid email');
                }
                // Check if email is taken
                $sql = "SELECT * FROM users WHERE email = ?;";
                $stmt = $conn->prepare($sql);
                $stmt->bind_param("s", $val);
                $stmt->execute();
                if(mysqli_fetch_assoc($stmt->get_result())) {
                    fail("email taken");
                }
                $stmt->close();
                // Set email
                $sql = "UPDATE users SET email = ?, verified = ? WHERE id = ?;";
                $stmt = $conn->prepare($sql);
                $verified = 0;
                $stmt->bind_param("sii", $val, $verified, $_SESSION['uid']);
                $stmt->execute();
                $stmt->close();
                $_SESSION['email'] = $val;
                $_SESSION['verified'] = false;
            break;
            case "password":
                if(!password_verify($verifpwd, $result['password'])) {
                    fail('invalid pwd');
                }
                $sql = "UPDATE users SET password = ? WHERE id = ?";
                $stmt = $conn->prepare($sql);
                $newPwd = password_hash($val, PASSWORD_DEFAULT);
                $stmt->bind_param("si", $newPwd, $_SESSION['uid']);
                $stmt->execute();
                $stmt->close();
            break;
            case 'reviews':
                $val = json_decode($val, false);
                $safeVal = sanitize($val);
                $safeVal = json_encode($safeVal);
                // $val = json_decode($val, true);
                // if(!isset($val)) {
                //     fail("exception: data isn't valid JSON.");
                // }
                // $safeVal = (object) [];
                // foreach($val as $dkey => $deck) {
                //     $safeVal->$dkey = (object) [];
                //     foreach($deck as $prob => $data) {
                //         $newProb = htmlspecialchars(strip_tags($prob));
                //         $newItem = [];
                //         $newItem['last'] = (int)$data['last'];
                //         $newItem['box'] = (int)$data['box'];
                //         $newItem['score'] = (int)$data['score'];
                //         $safeVal->$dkey->$newProb = $newItem;
                //     }
                // }
                // $safeVal = json_encode($safeVal);
                $sql = "UPDATE users SET reviews = ? WHERE id = ?;";
                $stmt = $conn->prepare($sql);
                $stmt->bind_param("si", $safeVal, $_SESSION['uid']);
                $stmt->execute();
                $stmt->close();
                $_SESSION['reviews'] = $safeVal;
            break;
            case 'view':
                $sql = "SELECT * FROM decks WHERE id = ?;";
                $stmt = $conn->prepare($sql);
                $val = (int)$val;
                $stmt->bind_param("i", $val);
                $stmt->execute();
                $result = mysqli_fetch_assoc($stmt->get_result());
                if(!$result) {
                    $stmt->close();
                    fail("no deck");
                }
                $viewdata = json_decode($result['viewdata']);
                $exists = false;
                foreach($viewdata as $idx => $res) {
                    if ($res == $_SESSION['uid']) {
                        $exists = true;
                        break;
                    }
                }
                if($exists == false) {
                    $viewdata[] = $_SESSION['uid'];
                    $viewdata = json_encode($viewdata);
                    $sql = "UPDATE decks SET viewdata = ? WHERE id = ?;";
                    $stmt = $conn->prepare($sql);
                    $stmt->bind_param("si", $viewdata, $val);
                    $stmt->execute();
                    $stmt->close();
                }
            break;
            case 'pfp':
                if($val !== "") {
                    $data = explode(",", $val, 2);
                    $data = $data[1];
                    $decodedVal = base64_decode($data);
                    $imageValid = imagecreatefromstring($decodedVal);
                    if($imageValid === false) {
                        fail("exception: deckpic isn't a valid image. For security purposes, the server has denied the image.");
                    }
                }
                if(strlen($val) > 2 * 1000 * 1000) {
                    fail('size limit');
                }
                $sql = "UPDATE users SET pfp = ? WHERE id = ?;";
                $stmt = $conn->prepare($sql);
                $stmt->bind_param("si", $val, $_SESSION['uid']);
                $stmt->execute();
                $stmt->close();
                $_SESSION['pfp'] = $val;
            break;
            case 'notifsub':
                $sql = "UPDATE users SET notifsub = ? WHERE id = ?;";
                $stmt = $conn->prepare($sql);
                $val = (int)$val;
                $stmt->bind_param("ii", $val, $_SESSION['uid']);
                $stmt->execute();
                $stmt->close();
                $_SESSION['notifsub'] = $val;
            break;
            case 'delete':
                if(!password_verify($verifpwd, $result['password'])) {
                    fail('invalid pwd');
                }
                $sql = "DELETE FROM users WHERE id = ?;";
                $stmt = $conn->prepare($sql);
                $stmt->bind_param("i", $_SESSION['uid']);
                $stmt->execute();
                $stmt->close();
                session_unset();
                session_destroy();
            break;
            case 'draftdecks':
                $val = json_decode($val, true);
                if(!isset($val)) {
                    fail("exception: data isn't valid JSON.");
                }
                $newVal = (object) [];
                foreach($val as $time => $content) {
                    $key = htmlspecialchars(strip_tags($time));
                    $newVal->$key = (object) [];
                    $newVal->$key->desc = htmlspecialchars(strip_tags($val[$time]['desc']));
                    $newVal->$key->contnt = (object) [];
                    // Check for duplicate questions
                    $problems = [];
                    foreach($val[$time]['contnt'] as $prob => $data) {
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
                        $newVal->$key->contnt->$newProb = $newItem;
                    }
                }
                $safeVal = json_encode($newVal);
                $sql = "UPDATE users SET draftdecks = ? WHERE id = ?;";
                $stmt = $conn->prepare($sql);
                $stmt->bind_param("si", $safeVal, $_SESSION['uid']);
                $stmt->execute();
                $stmt->close();
                $_SESSION['draftdecks'] = $safeVal;
            break;
        }
        success();
    } catch(Exception $e) {
        fail("exception: " . $e->getMessage());
    }