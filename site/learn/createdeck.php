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
    <div class="container">
        <div class="create-container">
            <h1>Create a Deck</h1>
            <input type="text" placeholder="Name" id="name">
            <input type="text" placeholder="Description" id="description">
            <p>Deck picture:</p>
            <div class="deck-pick-container">
                <img src="../../img/defaultdeckpic.png" class="deck-pic" id="deckpic">
                <input class='file-selector' accept="image/png,image/jpeg" id="fileselecttrigger" type="file">
                <span class="material-symbols-outlined" id="picAddBtn">add_a_photo</span>
                <span class="material-symbols-outlined" id="picReset">refresh</span>    
            </div>
            <div>
                <input type="checkbox" id="isPublic">
                <span>| Public Deck</span>
            </div>
            <div id="cardcontain"></div>
            <button id="addcard">Add New Card</button>
            <button id="create">Create Deck!</button>
            <p class="info-error" id="create-err"></p>
        </div>
        <div class="options-container">
            <p>Import Options</p>
            <button id="quizlet-import-btn">Import from Quizlet</button>
            <button id="bento-import-btn">Import a Bento Deck</button><br><br>
            
            <p>Edit a Draft Deck</p>
            <div id="draftdecks-history">
                    <!-- <div id='draftdeck'>
                        <p>Yesterday</p>
                        <button id='show'><span class="material-symbols-outlined">save</span></button>
                        <button id='del'><span class="material-symbols-outlined">delete</span></button>
                    </div> -->
                <p>None</p>
            </div>
        </div>
    </div>
    <div class="importModal" id="quizlet-import-modal">
        <div class="modal-content">
            <h1>Import from Quizlet</h1>
            <h3>To Export from Quizlet:</h3>
            <p>#1 - go to a Quizlet deck you own and click on Export.</p>
            <p>#2 - for the characters between the term and definition, choose <b>Custom</b> and use <code>></code>; between rows, use the custom character <code>^</code>.</p>
            <p>#3 - copy the text and paste it here.</p>
            <textarea type="text" placeholder="Paste Quizlet Export Here" id="QI-importText"></textarea>
            <button id="QI-createBtn">Import</button> 
        </div>
    </div>
    <div class="importModal" id="bento-import-modal">
        <div class="modal-content">
            <h1>Import from Bento</h1>
            <label class="switch">
                <input type="checkbox" id="BI-replace-name">
                <span class="slider"></span>
            </label> | Use this imported deck's <b>name</b> in this deck<br>
            <label class="switch">
                <input type="checkbox" id="BI-replace-desc">
                <span class="slider"></span>
            </label> | Use this imported deck's <b>description</b> in this deck<br>
            Import your deck: <input type="file" id="BI-file" accept="text/plain"><br>
            <button id="BI-createBtn">Import</button>
        </div>
    </div>
</body>
</html>