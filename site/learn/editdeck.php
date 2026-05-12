<?php $_X_UO = true; ?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bento | Edit Deck</title>
    <?php require_once "../globalreqs.php"?>
    <link rel="stylesheet" href="../../css/createDeck.css"/>
    <script type="module" src="../../sitejs/editdeck.js" data-loading="true"></script>
    <!-- MathJax -->
    <script>
        window.MathJax = {
            tex: {
                inlineMath: [['$', '$'], ['\\(', '\\)']],
                displayMath: []
            },
            svg: {
                fontCache: 'global',
                scale: 1,
            },
            startup: {}
        };
    </script>
    <script type="text/javascript" async src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-svg.js"></script>
</head>
<body>
    <?php require_once "../header.php"?>
    <div class="container">
        <div class="create-container">
            <h1>Edit Deck</h1>
            <button id="flush">Flush Deck</button>
            <input type="text" placeholder="Name" id="name">
            <input type="text" placeholder="Description" id="description">
            <p>Deck picture:</p>
            <div class="deck-pick-container">
                <img src="../../img/defaultdeckpic.png" class="deck-pic" id="deckpic">
                
                <span class="material-symbols-outlined" id="picAddBtn">add_a_photo<input class='file-selector' accept="image/png,image/jpeg" id="fileselecttrigger" type="file"></span>
                <span class="material-symbols-outlined" id="picReset">refresh</span>    
            </div>
            <div id="tagsContainer">
                <p>Tags:</p>
                <input type="text" id="tagInput" list="tag-suggestions" placeholder="New Tag...">
                <datalist id="tag-suggestions"></datalist>
                <div id="tags"></div>
                <p id="tag-ok"></p>
            </div>
            <div>
                <input type="checkbox" id="isPublic" checked>
                <span>| Public Deck</span>
            </div>
            <div id="cardcontain"></div>
            <button id="addcard">Add New Card</button>
            <button id="create">Update Deck!</button>
        </div>
        <div class="options-container">
            <p>Import Options</p>
            <button id="quizlet-import-btn">Import from Quizlet</button>
            <button id="gimkit-import-btn">Import from Gimkit</button>
            <button id="bento-import-btn">Import a Bento Deck</button>
            <p class="info-blank">Note importing <i>appends</i> to the list of cards, not replaces.</p><br><br>
        </div>
    </div>
    <div class="import-modal" id="quizlet-import-modal">
        <div class="modal-content">
            <h1>Import from Quizlet</h1>
            <h3>To Export from Quizlet:</h3>
            <p>#1 - go to a Quizlet deck you own and click on Export.</p>
            <p>#2 - for the characters between the term and definition, choose <b>Custom</b> and use <code>></code>; between rows, use the custom character <code>^</code>.</p>
            <p>#3 - copy the text and paste it here.</p>
            <textarea type="text" placeholder="Paste Quizlet Export Here" id="QI-importText"></textarea>
            <label class="switch">
                <input type="checkbox" id="QI-reverse">
                <span class="slider"></span>
            </label> | Reverse terms and definitions<br>
            <button id="QI-createBtn">Import</button> 
            <p class="info-error" id="QI-err"></p>
        </div>
    </div>
    <div class="import-modal" id="gimkit-import-modal">
        <div class="modal-content">
            <h1>Import from Gimkit</h1>
            <h3>To Export from Gimkit:</h3>
            <p>#1 - While viewing the deck, click on "Export" on the left menu.</p>
            <p>#2 - Copy the text and paste it here. (Make sure to keep it in Question/Answer format)</p>
            <textarea type="text" placeholder="Paste Gimkit Export Here" id="GK-importText"></textarea>
            <button id="GK-createBtn">Import</button>
            <p class="info-error" id="GK-err"></p>
        </div>
    </div>
    <div class="import-modal" id="bento-import-modal">
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
            Import your deck (.json): <input type="file" id="BI-file" accept="application/json"><br>
            <button id="BI-createBtn" disabled="true">Import</button>
            <p>Or, you can paste in a raw JSON.</p>
            <textarea type="text" placeholder="Paste JSON Here" id="BI-pasteImportText"></textarea>
            <button id="BI-pasteCreateBtn">Import</button>
        </div>
    </div>
    <!-- Importing modal to show all questions about to be imported. TO BE IMPLEMENTED -->
    <div class="import-modal" id="importing-modal">
        <div class="modal-content">
            <h1>Importing:</h1>
            <p>Below is every question about to be imported. Uncheck any you don't want.</p>
            <button id="i-import">Continue >>></button>
            <button id="i-cancel">Cancel</button><br>
            <span class="material-symbols-outlined" id="qSelectAll">check_box_outline_blank</span>
            <div id="importing-questions">
                <!-- <div class="importing-question">
                    <p class="q">What is the capital of France?</p>
                    <p class="a">Paris</p>
                    <input type="checkbox" checked>
                </div> -->
            </div>
        </div>
    </div>
</body>
</html>