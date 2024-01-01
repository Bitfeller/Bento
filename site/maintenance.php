<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bento! | Maintenance</title>
    <?php require_once "globalreqs.php"?>
    <style>
    section {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 90vh;
    }
    a {
        font-size: 24pt;
        margin-top: 1%;
        padding: 0.5%;
        border-radius: 10px;
        background-color: #cadda0;
        color:#1e1e1e;
    }
    #a {
        position: absolute;
        height: 540px;
        left: calc(50% - 340px);
        bottom: 50%;
        content:url("/img/menhera-sad.gif");
        animation: ability-to-use 600s;
    }
        @keyframes ability-to-use {
        0% {opacity: 0;}
        10% {opacity: 0;}
        100% {opacity: 1;}
    }
    </style>
</head>
<body>
    <?php require_once "header.php" ?>
    <section id="404-content"> 
        <h2>Uh oh! Looks like the site is under maintenance. Please check back later!</h2>
    </section>
    <img id="a">
</body>
</html>