<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Kitchen</title>
    <?php require_once "../globalreqs.php"?>
    <link rel="stylesheet" href="../../css/kitchen.css"/>
    <script src="../../sitejs/kitchen.js" type="module" data-loading="true"></script>
</head>
<body data-uo="true">
    <?php require_once "../header.php"?>
    <div class='container'>
        <div class="search-container">
            <input type="text" name="search" id="search" class="search-bar" placeholder="Search from the marketplace... 　(Enter)">
        </div>
        <h2 style="display: none;" id="searchText" class="left-text">Search Results</h2>
        <div style="display: none;" class="ingredients-container" id="searched_decks">
        </div>
        <div class="deck-divider"></div>
        <h2 style="display: inline;" class="left-text">Added Decks</h2>
        <div class="ingredients-container" id="added_decks">
            <p class="info-blank">You haven't added any decks to your reviews yet.</p>
        </div>
        <div class="deck-divider"></div>
        <h2 class="left-text">Marketplace</h2>
        <div class="ingredients-container" id="marketplace">
        </div>
        <section>
            <dialog id="previewDialog">
                <div class="title-bar">
                    <h2>Preview:</h2>
                    <button class="closeBtns" id="previewDialog_leave"><span class="material-symbols-outlined">close</span></button>
                </div>
                <div class="preview-container"></div>
            </dialog>
        </section>
        <button id="loadBtn">Load more decks...</button>
    </div>
</body>
</html>