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
    function meets_req($hasMc, $hasTxt, $hasRanking, $hasMtch) {
        global $strictly, $mc, $txt, $ranking, $mtch;
        if($strictly == false) {
            if($mc == true and $hasMc == true) return true;
            if($txt == true and $hasTxt == true) return true;
            if($ranking == true and $hasRanking == true) return true;
            if($mtch == true and $hasMtch == true) return true;
            if($mc == false and $txt == false and $ranking == false and $mtch == false) return true;
            return false;
        }
        if($mc == true and $hasMc == false) return false;
        if($txt == true and $hasTxt == false) return false;
        if($ranking == true and $hasRanking == false) return false;
        if($mtch == true and $hasMtch == false) return false;
        if($mc == false and $hasMc == true) return false;
        if($txt == false and $hasTxt == true) return false;
        if($ranking == false and $hasRanking == true) return false;
        if($mtch == false and $hasMtch == true) return false;
        return true;
    }
    try {
        $conf = get_server_config();
        $conn = connect_to_db();

        // Fetch decks
        $sql = "SELECT * FROM decks WHERE (public = ? OR owner = ?)";
        if(!empty($searchTerms)) {
            // Check name and owner
            $coll = $caseSensitive ? "latin1_general_cs" : "latin1_general_ci";
            $comp = $regex ? "REGEXP" : "LIKE";
            
            $sql .= "AND (";
            
            $cond = [];
            foreach((array) $searchTerms as $term) $cond[] = "name COLLATE $coll $comp CONCAT('%', ?, '%')";
            $sql .= implode(" OR ", $cond);
            
            $cond = [];
            foreach((array) $searchTerms as $term) $cond[] = "owner COLLATE $coll $comp CONCAT('%', ?, '%')";
            $sql .= " OR " . implode(" OR ", $cond);
            
            $sql .= ") ";
        }
        
        // Check for tags
        if(!empty($tags)) {
            $sql .= "AND (";

            $cond = [];
            foreach((array) $tags as $tag) $cond[] = "JSON_CONTAINS(data, '\"?\"', '$.tags')";
            $sql .= implode(" OR ", $cond);

            $sql .= ") ";
        }

        $conj = $strictly ? "AND" : "OR";
        if($mc or $txt or $ranking or $mtch) {
            $sql .= "AND (";
            $cond = [];
            if($mc) $cond[] = `data LIKE '%"type":"mc"%'`;
            if($txt) $cond[] = `data LIKE '%"type":"txt"%'`;
            if($ranking) $cond[] = `data LIKE '%"type":"ranking"%'`;
            if($mtch) $cond[] = `data LIKE '%"type":"mtch"%'`;
            $sql .= implode(" $conj ", $cond);

            $sql .= ") ";
        }
        
        $sortType = "";
        switch($sortFilter) {
            case 1:
                $sortType = "id ASC";
            break;
            case 2:
                $sortType = "id DESC";
            break;
            case 3:
                $sortType = "name DESC";
            break;
            case 4:
                $sortType = "name ASC";
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
            $views = sizeof(json_decode($row['viewdata'], true));
            $row['views'] = $views;

            // Remove if they don't fit the filter
            $hasMc = false;
            $hasTxt = false;
            $hasRanking = false;
            $hasMtch = false;
            $data = json_decode($row['data'], false);
            foreach($data->contnt as $key => $val) {
                if($val->type == "mc") $hasMc = true;
                if($val->type == "txt") $hasTxt = true;
                if($val->type == "ranking") $hasRanking = true;
                if($val->type == "mtch") $hasMtch = true;
                if(meets_req($hasMc, $hasTxt, $hasRanking, $hasMtch) == false) break;
            }
            if(!meets_req($hasMc, $hasTxt, $hasRanking, $hasMtch)) continue;
            
            unset($row['data']);
            unset($row['viewdata']);
            $decks[] = $row;
        }
        $stmt->close();
        success(json_encode($decks));
    } catch(Exception $e) {
        fail("exception: " . $e->getMessage());
    }