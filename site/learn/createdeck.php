<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bento | New Deck</title>
    <?php require_once "../globalreqs.php"?>
    <link rel="stylesheet" href="../../css/createDeck.css"/>
    <script type="module" src="../../sitejs/createdeck.js"></script>
</head>
<body data-uo="true">
    <?php require_once "../header.php"?>
    <div class="create-container">
        <h1>Create a Deck</h1>
        <input type="text" placeholder="Name" id="name">
        <input type="text" placeholder="Description" id="description">
        <div>
            <input type="checkbox" id="isPublic">
            <span>| Public Deck</span> <button id="importBtn">Import from Quizlet</button>
        </div>
        <div id="cardcontain">
            
        </div>
        <button id="addcard">Add New Card</button>
        <button id="create">Create Deck!</button>
    </div>
    <div id="importModal">
            <div id="modal-content">
                <h1>Import from Quizlet</h1>
                <div id="import-checkbox-container">
                    <input type="checkbox" id="importPublicCheckbox">
                    <span>| Public Deck</span>
                </div>
                <input type="text" placeholder="Name" id="importName">
                <input type="text" placeholder="Description" id="importDescription">
                <p>To Export from Quizlet for between term and definition use the custom character > and for between rows use the custom character ^</p>
                <textarea type="text" placeholder="Paste Quizlet Export Here" id="importText"></textarea>
                <button id="importCreateBtn">Import</button> 
            </div>
    </div>
</body>
</html>