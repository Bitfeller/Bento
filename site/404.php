<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bento - 404!</title>
    <?php require_once "globalReqs.php"?>
</head>
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
</style>
<body>
    <?php require_once "header.php" ?>
    <section id="404-content"> 
        <h2>Uh oh! Looks like you landed at a 404. (The page you tried accessing doesn't exist...)</h2>
        <a href="/home">Go Home</a>
    </section>
</body>
</html>