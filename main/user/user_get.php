<?php
    session_start();
    if(!isset($_SESSION['uid']) || !isset($_SESSION['username'])) {
        echo json_encode([]);
    } else {
        echo json_encode(
            array("uid"=>$_SESSION['uid'], "username"=>$_SESSION['username'], "email"=>$_SESSION['email'], "reviews"=>$_SESSION['reviews'], "decks"=>$_SESSION['decks'], "verified"=>$_SESSION['verified'])
        );
    }