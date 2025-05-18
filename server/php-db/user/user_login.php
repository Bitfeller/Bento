<?php
    require_once '../module.php';
    validate_request();
    $data = get_data('username', 'pwd');
    require_types('ss', 'username', 'pwd');
    // Get body values
    $username = $data['username'];
    $pwd = $data['pwd'];
    try {
        $conf = get_server_config();
        $conn = connect_to_db();
        // Get user
        $sql = "SELECT * FROM users WHERE username = ? OR email = ? LIMIT 1;";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("ss", $username, $username);
        $stmt->execute();
        $result = $stmt->get_result()->fetch_assoc();
        if(!$result) fail("bad u/p");
        $userPwd = $result['password'];
        $valid = password_verify($pwd, $userPwd);
        if(!$valid) fail("bad u/p");
        // @ = no warnings
        $pfp = @file_get_contents($conf['file_db'] . 'pfps/' . $result['id'] . '.pfp');
        if($pfp !== "" && $pfp === false) {
            $handle = fopen($conf['file_db'] . 'pfps/' . $result['id'] . '.pfp', "w");
            if(!$handle) fail("CRITICAL: couldn't create pfp!");
            fclose($handle);
            $pfp = "";
        }
        session_start();
        $_SESSION['uid'] = $result['id'];
        $_SESSION['username'] = $result['username'];
        $_SESSION['pfp'] = $pfp;
        $_SESSION['email'] = $result['email'];
        $_SESSION['userdata'] = $result['userdata'];
        $_SESSION['verified'] = $result['verified'] === 0 ? false : true;
        $_SESSION['creation_date'] = $result['creation_date'];
        $_SESSION['notifsub'] = $result['notifsub'];
        $stmt->close();
        success();
    } catch(Exception $e) {
        fail("exception: " . $e->getMessage());
    }