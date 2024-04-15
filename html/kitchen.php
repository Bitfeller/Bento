<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Kitchen</title>
    <?php require_once "globalReqs.php"?>
    <link rel="stylesheet" href="/css/kitchen.css"/>
</head>
<body>
    <?php require_once "header.php"?>
    <h2>Added Decks</h2>
    <div class="ingredients-container">
        <div class="ingredient-box">
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
        </div>
    </div>
    <div id="deck-divider" style=""></div>
    <h2>Marketplace</h2>
    <div class="ingredients-container">
        <div class="ingredient-box">
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
        </div>
    </div>

    <section>
        <dialog id="previewDialog">
            <div class="title-bar">
                <h2>Preview:</h2>
                <button>x</button>
            </div>
            <!-- First 3 questions of the set -->
            <div class="preview-container">
                <p>#1 Q (input): What were the peasants of Russia called?</p>
                <p>A: Serfs</p>
                <p>#1 Q (input): What were the peasants of Russia called?</p>
                <p>A: Serfs</p>
                <p>#1 Q (input): What were the peasants of Russia called?</p>
                <p>A: Serfs</p>
            </div>

        </dialog>
        <dialog id="addDialog">
            <button>x</button>
            <br>
            <h2>This set will now appear in your reviews</h2>
            <br>
            <h2>So get ready...</h2>
        </dialog>
    </section>
</body>
<script src="/js/kitchen.js"></script>
</html>