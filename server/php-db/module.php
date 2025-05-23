<?php
    // Load libraries
    //      Load PHPMailer
    require_once '../lib/phpmailer/src/Exception.php';
    require_once '../lib/phpmailer/src/PHPMailer.php';
    require_once '../lib/phpmailer/src/SMTP.php';

    use PHPMailer\PHPMailer\PHPMailer;
    use Predis\Client as Redis;

    require_once '../lib/predis/autoload.php';

    // Redis
    global $redis;
    function build_redis() {
        $conf = get_server_config();
        $GLOBALS['redis'] = new Redis([
            'scheme' => 'tcp',
            'host' => $conf['redis']['host'],
            'port' => $conf['redis']['port'],
            'password' => $conf['redis']['password']
        ]);
        $GLOBALS['redis']->connect();
        return $GLOBALS['redis'];
    }
    function get_redis() {
        if(!isset($GLOBALS['redis'])) return build_redis();
        return $GLOBALS['redis'];
    }
    function close_redis() {
        $redis = get_redis();
        $redis->disconnect();
        $GLOBALS['redis'] = null;
    }

    // Essential functions
    //      Success and fail return functions
    function fail($reason) {
        http_response_code(200);
        header("Content-Type: application/json");
        echo json_encode(["status" => "error", "reason" => $reason]);
        exit();
    }
    function success($data = null) {
        http_response_code(200);
        header("Content-Type: application/json");
        echo json_encode(["status" => "success", "data" => $data]);
        exit();
    }
    function access_fail() {
        http_response_code(400);
        echo "Invalid";
        exit();
    }
    //      Request validation
    function is_host_allowed($origin, $allowed_origins) {
        $origin = str_replace("/http[s]*:\/\//", "", $origin);
        $origin = str_replace("/:[0-9]+/", "", $origin);
        return array_search($origin, $allowed_origins) ? true : false;
    }
    function validate_request() {
        $config = get_server_config();
        if($config["allowed_hosts"] === "*") header("Access-Control-Allow-Origin: *");
        else {
            $origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : "";
            if(is_host_allowed($origin, $config["allowed_hosts"])) header("Access-Control-Allow-Origin: $origin");
        }
        if(!isset($_SERVER['CONTENT_TYPE'])) access_fail();
        if($_SERVER['CONTENT_TYPE'] !== "application/json") access_fail();
    }
    //      Fetch body data
    function get_data(...$required_values) {
        $json_data = file_get_contents('php://input');
        $data = json_decode($json_data, true);
        if(!empty($required_values))
            foreach ($required_values as $req_value)
                if(!isset($data[$req_value])) access_fail();
        return $data;
    }
    function require_types($types, ...$params) {
        $data = get_data();
        if($data == null) return;
        if(!is_string($types) or !is_array($params)) return;
        if(strlen($types) !== sizeof($params)) return;
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
            if(!isset($data[$param])) continue;
            $val = $data[$param];
            if(gettype($val) !== $type and gettype($val) !== ($secondType or $type)) access_fail();
        }
    }

    //      Get server config and other configurations
    function is_local_config() {
        return file_exists('../../conf/local-config.json');
    }
    function get_server_config() {
        if(is_local_config()) 
            return json_decode(file_get_contents("../../conf/local-config.json"), true);
        else 
            return json_decode(file_get_contents('../../conf/config.json'), true);
    }
    function get_allowed_tags() {
        return json_decode(file_get_contents('../../conf/allowed_tags.json'), true);
    }

    //      Content sanitizer
    function _traverse_array_sanitize(array $content) {
        $newContnt = [];
        foreach($content as $val) {
            $newVal = null;
            if(gettype($val) == "array") $newVal = _traverse_array_sanitize($val);
            if(gettype($val) == "object") $newVal = _traverse_object_sanitize($val);
            if(gettype($val) == "string") $newVal = _traverse_str_sanitize($val);
            if(gettype($val) == "double" || gettype($val) == "integer" || gettype($val) == "boolean") $newVal = $val;
            $newContnt[] = $newVal;
        }
        return $newContnt;
    }
    function _traverse_object_sanitize(object $content) {
        $newContnt = (object) [];
        foreach($content as $key => $val) {
            $newKey = _traverse_str_sanitize($key);
            $newVal = null;
            if(gettype($val) == "array") $newVal = _traverse_array_sanitize($val);
            if(gettype($val) == "object") $newVal = _traverse_object_sanitize($val);
            if(gettype($val) == "string") $newVal = _traverse_str_sanitize($val);
            if(gettype($val) == "double" || gettype($val) == "integer" || gettype($val) == "boolean") $newVal = $val;
            $newContnt->$newKey = $newVal;
        }
        return $newContnt;
    }
    function _traverse_str_sanitize(string $content) {
        return str_replace("\r", "", str_replace("\n", "", htmlspecialchars($content)));
    }
    function sanitize($content) {
        if(gettype($content) == "array") return _traverse_array_sanitize($content);
        if(gettype($content) == "object") return _traverse_object_sanitize($content);
        if(gettype($content) == "string") return _traverse_str_sanitize($content);
        return null;
    }
    //      Content filter
    function _traverse_array_filter(array $content) {
        foreach($content as $val) {
            if(gettype($val) == "array")
                if(_traverse_array_filter($val) == true) return true;
            if(gettype($val) == "object")
                if(_traverse_object_filter($val) == true) return true;
            if(gettype($val) == "string")
                if(_traverse_str_filter($val) == true) return true;
        }
        return false;
    }
    function _traverse_object_filter(object $content) {
        foreach($content as $key => $val) {
            if(_traverse_str_filter($key) == true) return true;
            if(gettype($val) == "array")
                if(_traverse_array_filter($val) == true) return true;
            if(gettype($val) == "object")
                if(_traverse_object_filter($val) == true) return true;
            if(gettype($val) == "string")
                if(_traverse_str_filter($val) == true) return true;
        }
        return false;
    }
    function _traverse_str_filter(string $content) {
        $filter_list = get_filter_list();
        foreach($filter_list as $filter)
            if(preg_match("/$filter/", $content))
                return true;
        return false;
    }
    function get_filter_list() {
        return file('../../conf/moderator/config-filter-regex.list');
    }
    function filter($content) {
        if(gettype($content) == "array") return _traverse_array_filter($content);
        if(gettype($content) == "object") return _traverse_object_filter($content);
        if(gettype($content) == "string") return _traverse_str_filter($content);
        return false;
    }

    // Connect to database
    function connect_to_db() {
        $conf = get_server_config();
        $conn = mysqli_connect($conf['mysql']['host'], $conf['mysql']['user'], $conf['mysql']['password'], $conf['mysql']['db']);
        if(!$conn) fail("conn: ". mysqli_connect_error());
        return $conn;
    }
    // Mailer
    function send_mail($target, $subject, $body, $alt_body = null) {
        $conf = get_server_config();
        $mail = new PHPMailer();
        $mail->isSMTP();
        $mail->Host = $conf['mail_smtp_server'];
        $mail->Port = 465;
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
        $mail->SMTPAuth = true;
        $mail->Username = $conf['mail_username'];
        $mail->Password = $conf['mail_password'];
        $mail->setFrom($conf['mail_username'], $conf['mail_name']);
        $mail->addAddress($target, '');
        $mail->Subject = $subject;
        $mail->isHTML();
        $mail->Body = $body;
        if(isset($alt_body)) $mail->AltBody = $alt_body;
        if(!$mail->send()) return false;
        return true;
    }
    
    // File/log updater
    function increment($file) {
        // Do not affect if using local_config
        if(file_exists('../../conf/local-config.json')) return;
        $current = file_get_contents($file);
        $current++;
        file_put_contents($file, $current);
    }
    
    // Sets a key in redis db
    function redis_set($key, $value) {
        if(is_local_config()) return;
        $redis = get_redis();
        $redis->set($key, $value);
    }
    // Sets an expirable key in redis db
    function redis_setex($key, $value, $time) {
        if(is_local_config()) return;
        $redis = get_redis();
        $redis->setex($key, $time, $value);
    }
    // Gets a key from redis db
    function redis_get($key) {
        if(is_local_config()) return false;
        $redis = get_redis();
        return $redis->get($key);
    }
    // Deletes a key from redis db
    function redis_del($key) {
        if(is_local_config()) return;
        $redis = get_redis();
        $redis->del($key);
    }