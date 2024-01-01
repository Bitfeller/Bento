<?php
    require_once 'funcs.php';
    $conn = mysqli_connect("localhost", "remote", "", "bento");
    # $conn = mysqli_connect("10.10.10.210", "remote", "*7ED54C88139248C900757D5540148B5AA2DBF4F2", "bento");
    if(!$conn) {
        fail("conn: ". mysqli_connect_error());
    }