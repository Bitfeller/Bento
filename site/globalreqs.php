<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&icon_names=add,add_a_photo,arrow_back_ios,arrow_forward_ios,bolt,box,check,check_box,check_box_outline_blank,check_indeterminate_small,chevron_right,close,delete,delete_forever,download,edit,feedback,file_copy,groups,indeterminate_check_box,info,keyboard_arrow_down,keyboard_double_arrow_left,lan,logout,menu,notifications_off,refresh,remove,resume,rocket_launch,save,sentiment_very_satisfied,tune,visibility&display=block" />
<link rel="stylesheet" href="/css/global.css"/>
<link rel="icon" type="image/x-icon" href="/img/favicon.ico">
<script type="module" src="/sitejs/client-modules/header.js"></script>
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
                echo "<link rel='stylesheet' href='../css/themes/grayscale.css'>";
            break;
        }
    }
?>