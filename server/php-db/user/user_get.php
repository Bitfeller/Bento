<?php
    require_once '../module.php';
    validate_request();
    $data = get_data();
    require_types('bbbb', 'getpfp', 'getudata', 'getreviews', 'getdrafts');
    session_start();
    if(!isset($_SESSION['uid']) || !isset($_SESSION['username'])) fail('no session');
    $getpfp = $data['getpfp'] ? 1 : 0;
    $getudata = $data['getudata'] ? 1 : 0;
    $getreviews = $data['getreviews'] ? 1 : 0;
    $getdrafts = $data['getdrafts'] ? 1 : 0;
    try {
        $conf = get_server_config();
        if(redis_get('update-'.$_SESSION['uid']) == 1) {
            $sql = "SELECT * FROM users WHERE id = ? LIMIT 1;";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("i", $_SESSION['uid']);
            $stmt->execute();
            $result = $stmt->get_result()->fetch_assoc();
            if(!$result) {
                session_unset();
                session_destroy();
                header("Location: /login");
            }

            $pfp = @file_get_contents($conf['file_db'] . 'pfps/' . $result['id'] . '.pfp');
            if($pfp !== "" && $pfp === false) {
                $handle = fopen($conf['file_db'] . 'pfps/' . $result['id'] . '.pfp', "w");
                if(!$handle) fail("CRITICAL: couldn't create pfp!");
                fclose($handle);
                $pfp = "";
            }
            
            $_SESSION['uid'] = $result['id'];
            $_SESSION['username'] = $result['username'];
            $_SESSION['pfp'] = $pfp;
            $_SESSION['email'] = $result['email'];
            $_SESSION['userdata'] = $result['userdata'];
            $_SESSION['verified'] = $result['verified'] === 0 ? false : true;
            $_SESSION['creation_date'] = $result['creation_date'];
            $_SESSION['notifsub'] = $result['notifsub'];
            $stmt->close();
            
            redis_del('update-'.$_SESSION['uid']);
        }
        $data = ["uid"=>$_SESSION['uid'], "username"=>$_SESSION['username'], "email"=>$_SESSION['email'], "verified"=>$_SESSION['verified'], "creation_date"=>$_SESSION['creation_date'], "notifsub"=>$_SESSION['notifsub']];
        if($getudata == 1) {
            $userdata = json_decode($_SESSION['userdata'], false, $conf['php_cfg']['json_max_depth'], $conf['php_cfg']['json_flags']);
            if($getreviews == 0) unset($userdata->reviews);
            if($getdrafts == 0) unset($userdata->draftdecks);
            $data['userdata'] = json_encode($userdata);
        }
        if($getpfp == 1) $data['pfp'] = $_SESSION['pfp'];
        success($data);
    } catch(_) {
        header('Location: /');
        session_start();
        session_unset();
        session_destroy();
        fail("invalid user data");
    }