<?php
    // Essential functions
    function fail($reason) {
        echo json_encode(["status" => "error", "reason" => $reason]);
        exit();
    }
    function success($data = null) {
        echo json_encode(["status" => "success", "data" => $data]);
        exit();
    }
    function access_fail() {
        echo "Invalid";
        exit();
    }
    function validate_request() {
        if(!isset($_SERVER['CONTENT_TYPE'])) {
            access_fail();
        }
        if($_SERVER['CONTENT_TYPE'] !== "application/json") {
            access_fail();
        }
    }
    function get_data($required_value = null) {
        $json_data = file_get_contents('php://input');
        $data = json_decode($json_data, true);
        if($required_value && !isset($data[$required_value])) {
            access_fail();
        }
        return $data;
    }