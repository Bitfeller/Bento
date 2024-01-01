<?php
    require_once '../module.php';
    validate_request();
    $data = get_data('offset');
    require_types('na', 'offset', 'searchTerms');
    $offset = $data['offset'];
    $searchTerms = $data['searchTerms'] or [];
    // Make sure session exists
    session_start();
    if(!isset($_SESSION['uid'])) fail("no session");
    try {
        $conf = get_server_config();
        $conn = connect_to_db();
        // Fetch decks
        $sql = "SELECT * FROM decks WHERE (public = ? OR owner = ?)";
        if(!empty($searchTerms)) {
            $sql .= "AND (";
            $cond = [];
            foreach((array) $searchTerms as $term) $cond[] = "name LIKE CONCAT('%', ?, '%')";
            $sql .= implode(" OR ", $cond);
            $cond = [];
            foreach((array) $searchTerms as $term) $cond[] = "owner LIKE CONCAT('%', ?, '%')";
            $sql .= " OR " . implode(" OR ", $cond);
            $sql .= ") ";
        }
        $limit = $conf['deckload_limit'];
        $sql .= "ORDER BY id DESC LIMIT $limit OFFSET ?;";
        $sql = (string)$sql;
        $stmt = $conn->prepare($sql);
        $public = 1;
        $tble = [$offset]; 
        $stmt->bind_param("is" . str_repeat("ss", count((array) $searchTerms)) . "i", $public, $_SESSION['username'], ...$searchTerms, ...$searchTerms, ...$tble);
        $stmt->execute();
        $raw_res = $stmt->get_result();
        $decks = [];
        while($row = $raw_res->fetch_assoc()) {
            // Unload viewdata and only get views
            $views = sizeof(json_decode($row['viewdata'], true));
            $row['views'] = $views;
            
            unset($row['data']);
            unset($row['viewdata']);
            $decks[] = $row;
        }
        $stmt->close();
        success(json_encode($decks));
    } catch(Exception $e) {
        fail("exception: " . $e->getMessage());
    }