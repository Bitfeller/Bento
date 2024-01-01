<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bento! | Maintenance</title>
    <?php require_once "globalreqs.php"?>
    <link rel="stylesheet" href="/css/index.css"/>
</head>
<body>
    <header>
        <div class="left-header">
            <img id="logo" alt="Bento! Logo" src="/img/bento logo white.svg" height="40px">
        </div>
    </header>
    <div class="quick-container">
        <div class="status">hello there!<div class="status-bar">||||||</div></div>
        <div class="status">hello there!</div>
    </div>
    <!--<section id="404-content"> 
        <h2>Uh oh! Looks like the site is under maintenance. Please check back later!</h2>
    </section>
    <img id="a">-->
    <script>
        let date = new Date("2024-12-20T22:00:00");
        
        const timeText = document.getElementById("time");

        function updateTime() {
            let now = Date.now();
            let diff = date.getTime() - now;
            let days = Math.floor(diff / (1000 * 60 * 60 * 24));
            let hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            let minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            timeText.innerHTML = `in ${days > 0 ? days + "d " : ""}${hours > 0 ? hours + "h " : ""}${minutes > 0 ? minutes + "m" : ""}`;
            if(minutes <= 0) timeText.innerHTML = `within the next few moments.`;
        }

        const interval = window.setInterval(updateTime, 1000);

        updateTime();
    </script>
</body>
</html>