<?php
    // Essential functions
    function fail($reason) {
        http_response_code(200);
        echo json_encode(["status" => "error", "reason" => $reason]);
        exit();
    }
    function success($data = null) {
        http_response_code(200);
        echo json_encode(["status" => "success", "data" => $data]);
        exit();
    }
    function access_fail() {
        http_response_code(400);
        echo "Invalid";
        exit();
    }
    function validate_request() {
        header("Access-Control-Allow-Origin: *");
        if(!isset($_SERVER['CONTENT_TYPE'])) {
            access_fail();
        }
        if($_SERVER['CONTENT_TYPE'] !== "application/json") {
            access_fail();
        }
    }
    function get_data(...$required_values) {
        $json_data = file_get_contents('php://input');
        $data = json_decode($json_data, true);
        if(!empty($required_values)) {
            foreach ($required_values as $req_value) {
                if(!isset($data[$req_value])) {
                    access_fail();
                }
            }
        }
        return $data;
    }
    function require_types($types, ...$params) {
        $data = get_data();
        if(!is_string($types) or !is_array($params)) {
            return;
        }
        if(strlen($types) !== sizeof($params)) {
            return;
        }
        foreach ($params as $index => $param) {
            // format type
            $type = "";
            $secondType = ""; // if applicable
            switch($types[$index]) {
                case "s":
                    $type = "string";
                break;
                case "n":
                    $type = "integer";
                    $secondType = "double";
                break;
                case "a":
                    $type = "array";
                break;
                case "b":
                    $type = "boolean";
                break;
            }
            $val = $data[$param];
            if(isset($val) and (gettype($val) !== $type and gettype($val) !== ($secondType or $type))) {
                access_fail();
            }
        }
    }