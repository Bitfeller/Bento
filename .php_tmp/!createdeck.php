<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bento | New Deck</title>
    <?php require_once "globalReqs.php"?>
    <script type="module" src="../js/createdeck.js" type="text/javascript"></script>
    <style>
        .mc-option-sel {
            background-color: rgb(0, 150, 255);
        }
        .selbtn-select {
            background-color: rgb(0, 150, 255);
        }
    </style>
</head>
<body>
    <?php require_once "header.php"?>
    <div id="main">
        <p>Create Deck</p>
        <input type="text" placeholder="Name" id="name"><br>
        Make public: <input type="checkbox" id="isPublic"><br>
        <input type="text" placeholder="Description" id="description"><br>
        <div id="cardcontain">
            
        </div>
        <button id="addcard">Add New Card</button>
        <button id="create">Create Deck!</button>
    </div>
</body>
</html>