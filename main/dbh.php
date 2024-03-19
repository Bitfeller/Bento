<?php
    require_once 'funcs.php';
    $conn = mysqli_connect("localhost", "remote", "", "bento");
    if(!$conn) {
        fail("conn: ". mysqli_connect_error());
    }