<?php
    require_once '../module.php';
    validate_request();
    $data = get_data('id');
    require_types('nbbb', 'id', 'load_pic', 'load_data', 'load_contnt_len');
    // Make sure session exists
    session_start();
    if(!isset($_SESSION['uid'])) fail("no session");
    // Get body values
    $id = $data['id'];
    $load_pic = $data['load_pic'] ? 1 : 0;
    $load_data = $data['load_data'] ? 1 : 0;
    $load_contnt_len = $data['load_contnt_len'] ? 1 : 0;
    $owner = $_SESSION['username'];
    try {
        $conf = get_server_config();
        $conn = connect_to_db();
        // Get deck
        $sql = "SELECT * FROM decks WHERE id = ? AND (public = ? OR owner = ?) LIMIT 1;";
        $stmt = $conn->prepare($sql);
        $public = 1;
        $stmt->bind_param("iis", $id, $public, $owner);
        $stmt->execute();
        $result = $stmt->get_result()->fetch_assoc();
        if($result) {
            if($load_pic == 1) {
                $path = $conf['file_db'] . 'decks/primary/' . $result['id'] . '.pic';
                $pfp = @file_get_contents($path);
                $pfp === false ? $result['deckpic'] = $pfp = '' : $result['deckpic'] = json_encode($pfp);
            }
            if($load_contnt_len == 1) $result['contnt_len'] = count(json_decode($result['data'], true, $conf['php_cfg']['json_max_depth'], $conf['php_cfg']['json_flags'])['contnt']);
            if($load_data == 0) unset($result['data']);
            // Unload viewdata and only get views
            $views = sizeof(json_decode($result['viewdata'], true, $conf['php_cfg']['json_max_depth'], $conf['php_cfg']['json_flags']));
            $result['views'] = $views;
            unset($result['viewdata']);
            success(json_encode($result));
        } else fail("no deck");
    } catch(Exception $e) {
        fail("exception: " . $e->getMessage());
    }