<?php
    require_once '../module.php';
    validate_request();
    $data = get_data('offset');
    require_types('nabbanbbbbb', 'offset', 'searchTerms', 'regex', 'caseSensitive', 'tags', 'sortFilter', 'strictly', 'mc', 'txt', 'ranking', 'mtch');
    $offset = $data['offset'];
    // Get search parameters
    $searchTerms = $data['searchTerms'] or [];
    $regex = $data['regex'] or false;
    $caseSensitive = $data['caseSensitive'] or false;
    $tags = $data['tags'] or [];
    $sortFilter = $data['sortFilter'] or 4;
    $strictly = $data['strictly'] or false;
    $mc = $data['mc'] or false;
    $txt = $data['txt'] or false;
    $ranking = $data['ranking'] or false;
    $mtch = $data['mtch'] or false;
    // Make sure session exists
    session_start();
    if(!isset($_SESSION['uid'])) fail("no session");
    try {
        $conf = get_server_config();
        $conn = connect_to_db();

        // Fetch decks
        $sql = "SELECT * FROM decks WHERE (public = ? OR owner = ?)";
        if(!empty($searchTerms)) {
            // Check name and owner
            $coll = $caseSensitive ? "utf8mb4_unicode_cs" : "utf8mb4_unicode_ci";
            $comp = $regex ? "REGEXP ?" : "LIKE CONCAT('%', ?, '%')";
            
            $sql .= "AND (";
            
            $cond = [];
            foreach((array) $searchTerms as $term) $cond[] = "name COLLATE $coll $comp";
            $sql .= implode(" OR ", $cond);
            
            $cond = [];
            foreach((array) $searchTerms as $term) $cond[] = "owner COLLATE $coll $comp";
            $sql .= " OR " . implode(" OR ", $cond);
            
            $sql .= ") ";
        }
        
        // Check for tags
        if(!empty($tags)) {
            $sql .= "AND (";

            $cond = [];
            foreach((array) $tags as $tag) $cond[] = "json_extract(data, '$.tags') LIKE CONCAT('%', ?, '%')";
            $sql .= implode(" OR ", $cond);

            $sql .= ") ";
        }

        $conj = $strictly ? "AND" : "OR";
        if($mc or $txt or $ranking or $mtch) {
            $sql .= "AND (";
            $cond = [];
            if($mc) $cond[] = 'data LIKE \'%"type":"mc"%\'';
            if($txt) $cond[] = 'data LIKE \'%"type":"txt"%\'';
            if($ranking) $cond[] = 'data LIKE \'%"type":"ranking"%\'';
            if($mtch) $cond[] = 'data LIKE \'%"type":"mtch"%\'';
            $sql .= implode(" $conj ", $cond);

            $sql .= ") ";
        }
        
        $sortType = "";
        switch($sortFilter) {
            case 1:
                $sortType = "id DESC";
            break;
            case 2:
                $sortType = "id ASC";
            break;
            case 3:
                $sortType = "name ASC";
            break;
            case 4:
                $sortType = "name DESC";
            break;
        }
        $limit = $conf['deckload_limit'];
        $sql .= "ORDER BY $sortType LIMIT $limit OFFSET ?;";
        $sql = (string)$sql;
        $stmt = $conn->prepare($sql);
        $public = 1;
        $tble = [$offset];
        $stmt->bind_param("is" . str_repeat("ss", count((array) $searchTerms)) . str_repeat('s', count((array) $tags)) . "i", $public, $_SESSION['username'], ...$searchTerms, ...$searchTerms, ...$tags, ...$tble);
        $stmt->execute();
        $raw_res = $stmt->get_result();
        $decks = [];
        while($row = $raw_res->fetch_assoc()) {
            // Unload viewdata and only get views
            $views = sizeof(json_decode($row['viewdata'], true, $conf['php_cfg']['json_max_depth'], $conf['php_cfg']['json_flags']));
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