<?php
    // Essential functions
    function fail($reason) {
        echo json_encode(['status' => 'error', 'reason' => $reason]);
        exit();
    }
    function access_fail() {
        echo "Invalid.";
        exit();
    }
    // Make valid request
    $content_type = $_SERVER['CONTENT_TYPE'];
    if($content_type !== 'application/json') {
        access_fail();
    }
    // Add deck
    $json_data = file_get_contents('php://input');
    $data = json_decode($json_data, true);
    if(isset($data['name'])) {
        // Init database
        require_once 'data_dbh.php';
        if(!$conn) {
            fail('conn: '. mysqli_connect_error());
        }
        // Get body values
        $name = $data['name'];
        // Get deck
        $sql = "SELECT * FROM decks WHERE name = ?";
        $stmt = mysqli_stmt_init($conn);
    } else {
        access_fail();
    }