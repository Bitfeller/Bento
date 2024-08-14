<?php
    require_once 'funcs.php';
    $conf = get_server_config();
    $conn = mysqli_connect($conf['mysql']['host'], $conf['mysql']['user'], $conf['mysql']['password'], $conf['mysql']['db']);
    if(!$conn) {
        fail("conn: ". mysqli_connect_error());
    }