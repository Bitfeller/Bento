<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Kitchen</title>
    <?php require_once "../globalreqs.php"?>
    <link rel="stylesheet" href="../../css/kitchen.css"/>
    <script src="../../sitejs/kitchen_new.js" type="module" data-loading="true"></script>
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
<body data-uo="true">
    <?php require_once "../header.php"?>
    <div class="main-container">
        <div class="sidebar">
            <div class="search-box">
                <input type="text" id="searchBar" placeholder="Search...">
                <div class="material-symbols-outlined search-menu">menu</div>
                <div class="checkbox-box">
                    <input type="checkbox" name="regex">
                    <p>Regex Search</p>
                </div>
                <div class="checkbox-box">
                    <input type="checkbox" name="case-sensitive">
                    <p>Case Sensitive</p>
                </div>
                <!-- <div class="checkbox-box">
                    <input type="checkbox" name="hide-owned-decks">
                    <p>Hide Owned Decks</p>
                </div> -->
            </div>
            <div class="tags-box">
                <p>Recommended Tags: </p>
                <div class="predefined-tags">
                    <div class="tag add-tag">
                        <div class="material-symbols-outlined">add</div>
                        <p>Tag 1</p>
                    </div>
                    <div class="tag add-tag">
                        <div class="material-symbols-outlined">add</div>
                        <p>Tag 2</p>
                    </div>
                </div>
                <div class="break-line"></div>
                <p>Other Tags:</p>
                <div class="user-tags">
                    <div class="tag add-tag">
                        <div class="material-symbols-outlined">add</div>
                        <p>Tag 1</p>
                    </div>
                    <div class="tag add-tag">
                        <div class="material-symbols-outlined">add</div>
                        <p>Tag 2</p>
                    </div>
                </div>
            </div>
            <div class="filters">
                <p>Filters:</p>
                <div class="filter-box">
                    <p>Sort</p>
                    <select name="sort-options" id="sortOptions">
                        <option value="alphabet">Alphabetically</option>
                        <option value="reverse-alphabet">Reverse Alphabetically</option>
                        <option value="time">Chronologically</option>
                        <option value="reverse-time">Reverse Chronologically</option>
                    </select>
                </div>
                <div class="filter-box">
                    <!-- <p>Number of Terms</p> -->
                    <!-- <input type="range" min="1" max="400" value="100"> -->
                    <!-- Make it 2-way -->
                </div>
            </div>
            <div class="question-type-filters">
                <div class="include-container">
                    <p>Include </p>
                    <div>
                        <div></div>
                        <span>Strictly</span> / <span>Loosely</span>
                    </div>
                </div>
                <div class="checkbox-box">
                    <input type="checkbox" name="mc-type" id="mcCheckbox" checked>
                    <p>Multiple Choice</p>
                </div>
                <div class="checkbox-box">
                    <input type="checkbox" name="text-type" id="textCheckbox" checked>
                    <p>Text</p>
                </div>
                <div class="checkbox-box">
                    <input type="checkbox" name="rank-type" id="rankCheckbox" checked>
                    <p>Ranking</p>
                </div>
                <div class="checkbox-box">
                    <input type="checkbox" name="match-type" id="matchingCheckbox" checked>
                    <p>Matching</p>
                </div>
            </div>
        </div>
        <div id="decks-container" class="decks-display">
            <h2>Owned Decks:</h2>
            <div class="owned-decks">
                <!-- <div class="ingredient-box" style="background-image: url(../../img/defaultdeckpic.png);">
                    <div>
                        <h2>Title</h2>
                        <div class="deck-bottom-row">
                            <p>by: <span class="username"><u>Username</u></span></p>
                            <div class="deck-tags">
                                <div class="tag">
                                    <p>Tag 1</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <button class="preview-button">
                        <div class="material-symbols-outlined">visibility</div>
                    </button>
                    <button class="add-button">
                        <div class="material-symbols-outlined">add</div>
                    </button>
                </div>
                <div class="ingredient-box" style="background-image: url(../../img/defaultdeckpic.png);">
                    <div>
                        <h2>Title</h2>
                        <div class="deck-bottom-row">
                            <p>by: <span class="username"><u>Username</u></span></p>
                            <div class="deck-tags">
                                <div class="tag">
                                    <p>Tag 1</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <button class="preview-button">
                        <div class="material-symbols-outlined">visibility</div>
                    </button>
                    <button class="add-button">
                        <div class="material-symbols-outlined">add</div>
                    </button>
                </div>
                <div class="ingredient-box" style="background-image: url(../../img/defaultdeckpic.png);">
                    <div>
                        <h2>Title</h2>
                        <div class="deck-bottom-row">
                            <p>by: <span class="username"><u>Username</u></span></p>
                            <div class="deck-tags">
                                <div class="tag">
                                    <p>Tag 1</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <button class="preview-button">
                        <div class="material-symbols-outlined">visibility</div>
                    </button>
                    <button class="add-button">
                        <div class="material-symbols-outlined">add</div>
                    </button>
                </div> -->
            </div>
            <h2 id="pub-d-title">Public Decks:</h2>
            <div class="popular-decks">

            </div>
        </div>
        <section>
            <dialog id="preview-dialog">
                <div class="title-bar">
                    <h2>Preview:</h2>
                    <button class="closeBtns" id="previewDialog_leave"><span class="material-symbols-outlined">close</span></button>
                </div>
                <div class="preview-container"></div>
            </dialog>
        </section>
    </div>
</body>
</html>