<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bento - 404!</title>
    <?php require_once "globalreqs.php"?>
    <!-- Quick CSS syntax here; this is put here just in case /css can't be accessed during maintenance/server shutdown -->
    <style>
        section {
            display: flex;
            position: absolute;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 90vh;
            width: 100vw;
            left: 0;
            top: 30px;
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
</head>
<body>
    <?php require_once "header.php" ?>
    <section id="404-content"> 
        <h2>Uh oh! Looks like you landed at a <b>404</b>. (The page you tried accessing doesn't exist...)</h2>
        <a href="/home">Go Home</a>
    </section>
</body>
</html>