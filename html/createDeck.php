<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bento | New Deck</title>
    <?php require_once "globalReqs.php"?>
    <link rel="stylesheet" href="/css/createDeck.css"/>
    <script type="module" src="../js/createdeck.js"></script>
</head>
<body>
    <?php require_once "header.php"?>
    <div class="create-container">
        <h1>Create a Deck</h1>
        <input type="text" placeholder="Name" id="name">
        <input type="text" placeholder="Description" id="description">
        <div>
            <input type="checkbox" id="isPublic">
            <span>| Make public</span>
        </div>
        <div id="cardcontain">
            
        </div>
        <button id="addcard">Add New Card</button>
        <button id="create">Create Deck!</button>
    </div>
</body>
</html>