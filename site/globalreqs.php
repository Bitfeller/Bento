<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" />
<link href="https://fonts.googleapis.com/css2?family=Kadwa:wght@400;700&family=Karla:wght@200..800&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/css/global.css"/>
<link rel="icon" type="image/x-icon" href="/img/favicon.ico">
<script type="module" src="../sitejs/client-modules/header.js"></script>
<?php
    // Load themes
    session_start();
    if(isset($_SESSION['uid'])) {
        $contnt = json_decode($_SESSION['userdata'], true);
        switch($contnt["theme"]) {
            case 1:
                echo "<link rel='stylesheet' href='../css/themes/coffee-midnight.css'>";
            break;
            case 2:
                echo "<link rel='stylesheet' href='../css/themes/catppuccin.css'>";
            break;
            case 3:
                echo "<link rel='stylesheet' href='../css/themes/classic.css'>";
            break;
        }
    }
?>