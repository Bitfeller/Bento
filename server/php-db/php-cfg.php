<?php
    global $PHP_CONFIG;
    function GET_PHP_CONFIG() {
        $PHP_CONFIG = [
            'json_max_depth' => 512,
            'json_flags' => JSON_THROW_ON_ERROR
        ];
        return $PHP_CONFIG;
    }