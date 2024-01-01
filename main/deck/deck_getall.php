<?php
    require_once '../funcs.php';
    validate_request();
    $data = get_data('offset');
    require_types('na', 'offset', 'searchTerms');
    $offset = $data['offset'];
    $searchTerms = $data['searchTerms'] or [];
    // Make sure session exists
    session_start();
    if(!isset($_SESSION['uid'])) {
        fail("no session");
    }
    try {
        require_once '../dbh.php';
        // Fetch decks
        $sql = "SELECT * FROM decks WHERE (public = ? OR owner = ?)";
        if(!empty($searchTerms)) {
            $sql .= " AND (";
        }
        $cond = [];
        foreach ((array) $searchTerms as $term) {
            $cond[] = "name LIKE CONCAT('%', ?, '%')";
        }
        $sql .= implode(" OR ", $cond);
        if(!empty($searchTerms)) {
            $sql .= ") ";
        }
        $sql .= "ORDER BY viewnum DESC LIMIT 60 OFFSET ?;";
        $sql = (string) $sql;
        $stmt = $conn->prepare($sql);
        $public = 1;
        $tble = [$offset];
        $stmt->bind_param("is" . str_repeat("s", count((array) $searchTerms)) . "i", $public, $_SESSION['username'], ...$searchTerms, ...$tble);
        //$sql = "SELECT * FROM decks WHERE public = ? OR owner = ? ORDER BY viewnum DESC LIMIT 60 OFFSET ?;";
        //$stmt = $conn->prepare($sql);
        //$public = 1;
        //$stmt->bind_param("isi", $public, $_SESSION['username'], $offset);
        $stmt->execute();
        $raw_res = $stmt->get_result();
        $decks = [];
        while($row = mysqli_fetch_assoc($raw_res)) {
            if($row['owner'] !== $_SESSION['username']) {
                unset($row['public']);
            }
            $decks[] = $row;
        }
        $stmt->close();
        // Sort results
        if(!empty($searchTerms)) {
            function calculateScore($result, $searchTerms) {
                $score = 0;
                foreach ($searchTerms as $term) {
                    $score += substr_count(strtolower($result['name']), strtolower($term));
                }
                return $score;
            }
            usort($decks, function($a, $b) use ($searchTerms) {
                $scoreA = calculateScore($a, $searchTerms);
                $scoreB = calculateScore($b, $searchTerms);
                return $scoreB - $scoreA;
            });
        }
        success(json_encode($decks));
    } catch(Exception $e) {
        fail("exception: " . $e->getMessage());
    }