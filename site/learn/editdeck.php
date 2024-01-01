<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bento | Edit Deck</title>
    <?php require_once "../globalreqs.php"?>
    <link rel="stylesheet" href="../../css/createDeck.css"/>
    <script type="module" src="../../sitejs/editdeck.js"></script>
</head>
<body data-uo="true">
    <?php require_once "../header.php"?>
    <div class="create-container">
        <h1>Edit deck</h1>
        <input type="text" placeholder="Name" id="name">
        <input type="text" placeholder="Description" id="description">
        <p>Deck picture:</p>
        <div>
            <img src="../../img/defaultdeckpic.png" class="deck-pic" id="deckpic">
            <input class='file-selector' accept="image/png,image/jpeg" id="fileselecttrigger" type="file">
            <span class="material-symbols-outlined" id="picAddBtn">add_a_photo</span>
            <span class="material-symbols-outlined" id="picReset">refresh</span>    
        </div>
        <div>
            <input type="checkbox" id="isPublic">
            <span>| Make public</span>
        </div>
        <div id="cardcontain">
            
        </div>
        <button id="addcard">Add New Card</button>
        <button id="create">Update Deck!</button>
        <p class="info-error" id="edit-err"></p>
    </div>
</body>
</html>