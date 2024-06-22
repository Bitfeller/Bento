<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Kitchen</title>
    <?php require_once "../globalreqs.php"?>
    <link rel="stylesheet" href="../../css/kitchen.css"/>
    <script src="../../sitejs/kitchen.js" type="module"></script>
</head>
<body data-uo="true">
    <?php require_once "../header.php"?>
    <div class='container'>
        <div class="search-container">
            <input type="text" name="search" id="search" class="search-bar" placeholder="Search from the marketplace... 　(Enter)">
        </div>
        <h2 style="display: none;" id="searchText" class="left-text">Search Results</h2>
        <div style="display: none;" class="ingredients-container" id="searched_decks">
            <!-- searched terms here -->
        </div>
        <div class="deck-divider"></div>
        <h2 style="display: inline;" class="left-text">Added Decks</h2> 
        <div class="ingredients-container" id="added_decks">
            <!--<div class="ingredient-box">
                <div>
                    <img src="https://upload.wikimedia.org/wikipedia/en/thumb/f/f3/Flag_of_Russia.svg/2560px-Flag_of_Russia.svg.png" alt="Russian Flag">
                    <div>
                        <h2>
                            Eastern Civilizations - Russia
                        </h2>
                    </div>
                </div>
                <div>
                    <button class="previewBtns" onclick="previewDialog.showModal()">View</button>
                    <button class="addBtns" onclick="addDialog.showModal()">Remove</button>
                </div>
            </div>-->
        </div>
        <div class="deck-divider"></div>
        <h2 class="left-text">Marketplace</h2>
        <div class="ingredients-container" id="marketplace">
            <!--<div class="ingredient-box">
                <div>
                    <img src="https://upload.wikimedia.org/wikipedia/en/thumb/f/f3/Flag_of_Russia.svg/2560px-Flag_of_Russia.svg.png" alt="Russian Flag">
                    <div>
                        <h2>
                            Eastern Civilizations - Russia
                        </h2>
                    </div>
                </div>
                <div>
                    <button class="previewBtns" onclick="previewDialog.showModal()">View</button>
                    <button class="addBtns" onclick="addDialog.showModal()">Add</button>
                </div>
            </div>-->
        </div>
        <section>
            <dialog id="previewDialog">
                <div class="title-bar">
                    <h2>Preview:</h2>
                    <button class="closeBtns" id="previewDialog_leave">x</button>
                </div>
                <div class="preview-container"></div>
            </dialog>
            <dialog id="reviews_updateDialog">
                <button class="closeBtns" id="ruDialog_leave">x</button>
                <br>
                <h2>This set will now appear in your reviews</h2>
                <br>
                <h2>So get ready...</h2>
            </dialog>
        </section>
        <button id="loadBtn">Load more decks...</button>
    </div>
</body>
</html>