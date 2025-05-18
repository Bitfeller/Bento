<?php $_X_UO = true; ?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Kitchen</title>
    <?php require_once "../globalreqs.php"?>
    <link rel="stylesheet" href="../../css/kitchen.css"/>
    <script src="../../sitejs/kitchen.js" type="module" data-loading="true"></script>
    <link rel="preload" href="../../img/loading.gif" as="image">
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
    <div class='container'>
        <div class="search-container">
            <input type="text" name="search" id="search" class="search-bar" placeholder="Search the marketplace... 　(Enter)">
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

        
    </div>
    <footer>
            <button id="loadBtn"><h3>Load more decks...</h3></button>
    </footer>
</body>
</html>