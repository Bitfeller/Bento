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
            <img id="logo" alt="Bento! Logo" src="/img/bento logo white.svg" height="40px" onclick="location.href='/home'">
        </div>
    </header>
    <section id="hero">
        <div id="hero-elements">
            <h1>
                We're making Bento <b>better</b>.
            </h1>
            <h2>
                Bento's currently under maintenance, but we'll be back up shortly. Check again later.
            </h2>
            <p>We should be back up <b id="time">in 5 minutes.</b></p>
        </div>
    </section>
    <script>
        // Hard-coded date. Not the best idea...
        let date = new Date("2024-07-01T12:00:00");
        
        const timeText = document.getElementById("time");

        function updateTime() {
            let now = Date.now();
            let diff = date.getTime() - now;
            // Calculate day, hours, minutes
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