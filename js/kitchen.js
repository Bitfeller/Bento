import { UserGateway } from "../main/user_gateway.js";
import { DeckGateway } from "../main/deck_gateway.js";
// User + decks
let user;
let decks = [];
let reviewDecks = [];
let loaded = 0;
// Container
const addedDecksContainer = document.getElementById("added_decks");
const marketplace = document.getElementById("marketplace");
// Dialogs
const previewDialog = document.getElementById("previewDialog");
const reviews_updateDialog = document.getElementById("reviews_updateDialog");
// Load btn
const loadBtn = document.getElementById("loadBtn");

async function update() {
    if(loaded >= decks.length - 1) {
        loaded = decks.length - 1;
        return;
    }
    // Update decks in the user's review list
    if(reviewDecks.length == 0) {
        for(let i = 0; i < user.reviews.length; i++) {
            let deckid = user.reviews[i].deckid;
            let [success, deck] = await DeckGateway.get(deckid);
            if(!success) continue;
            reviewDecks.push(deck);
            let newBox = document.createElement("div");
            newBox.className = "ingredient-box";
            newBox.setAttribute("data-idx", reviewDecks.length - 1);
            newBox.innerHTML = `
                <div>   
                    <img src="https://upload.wikimedia.org/wikipedia/en/thumb/f/f3/Flag_of_Russia.svg/2560px-Flag_of_Russia.svg.png" alt="Russian Flag">
                    <div>
                        <h2>${deck.name}</h2>
                    </div>
                </div>
                <div>
                    <button class="previewBtns" data-idx="${reviewDecks.length - 1}">View</button>
                    <button class="userReviewsUpdateBtns" data-idx="${reviewDecks.length - 1}">Remove</button>
                </div>
            `;
            addedDecksContainer.appendChild(newBox);
            newBox.getElementsByClassName("previewBtns")[0].addEventListener("mousedown", (e) => {preview(e.currentTarget, true);});
            newBox.getElementsByClassName("userReviewsUpdateBtns")[0].addEventListener("mousedown", (e) => {reviews_update(e.currentTarget, true);});
        }
    }
    // Update marketplace
    for(let i = loaded + 1; i < decks.length; i++) {
        // In reviews?
        let inReviews = false;
        for(let j = 0; j < user.reviews.length; j++) {
            if(user.reviews[j].deckid == decks[i].id) {
                inReviews = true;
                break;
            }
        }
        // Create new container item and display deck
        let newBox = document.createElement("div");
        newBox.className = "ingredient-box";
        newBox.innerHTML = `
            <div>   
                <img src="https://upload.wikimedia.org/wikipedia/en/thumb/f/f3/Flag_of_Russia.svg/2560px-Flag_of_Russia.svg.png" alt="Russian Flag">
                <div>
                    <h2>${decks[i].name}</h2>
                </div>
            </div>
            <div>
                <button class="previewBtns" data-idx="${i}">View</button>
                <button class="userReviewsUpdateBtns" data-idx="${i}">${inReviews ? "Remove" : "Add"}</button>
            </div>
        `;
        marketplace.appendChild(newBox);
        newBox.getElementsByClassName("previewBtns")[0].addEventListener("mousedown", (e) => {preview(e.currentTarget);});
        newBox.getElementsByClassName("userReviewsUpdateBtns")[0].addEventListener("mousedown", (e) => {reviews_update(e.currentTarget);});
    }
    loaded = decks.length - 1;
}
async function init() {
    let [success, data] = await UserGateway.getuser();
    if(!success && data == "no session") {
        marketplace.remove();
        addedDecksContainer.remove();
        document.body.innerHTML += "You must be signed in to view decks!";
        return;
    }
    user = data;
    // For deck fetching, the system lazy loads primary deck info and actually fetches the deck when accessed/viewed
    [success, data] = await DeckGateway.getall(0);
    if(!success) return;
    if(data.length == 0) {
        // no decks...?
        // do something here ig
        return;
    }
    decks.push(...data);
    await update();
    loadBtn.addEventListener("mousedown", async () => {
        loadBtn.innerHTML = "Loading more decks...";
        let [success, data] = await DeckGateway.getall(decks.length);
        if(!success) return;
        if(data.length == 0) {
            loadBtn.innerHTML = "No more decks to load...";
            return;
        }
        decks.push(...data);
        await update();
        loadBtn.innerHTML = "[[ LOAD MORE DECKS ]]";
    });
}
init();
function preview(_this, isAdded) {
    previewDialog.showModal();
    let deck = isAdded ? reviewDecks[_this.dataset.idx] : decks[_this.dataset.idx];
    let list = "";
    console.log(deck);
    if(!deck.data.deckData) {
        list = "Interesting... this deck seems to be corrupt. If you could, please contact a developer of Bento about this. (include the name of the deck, please!)";
    } else {
        for(let i = 0; i < deck.data.deckData.length; i++) {
            list += "<p>Q: " + deck.data.deckData[i].question + "</p><p>A:" + (deck.data.deckData[i].correctAnswer || "[this is a ranking question]") + "</p>";
        }
    }
    previewDialog.innerHTML = `
        <div class='title-bar'>
            <h2>Preview:</h2>
            <button class="closeBtns" id="previewDialog_leave">x</button>
        </div>
        <div class='preview-container'>
            ${list}
        </div>
    `;
}
async function reviews_update(_this, isAdded) {
    console.log(_this);
    reviews_updateDialog.showModal();
    let deck = isAdded ? reviewDecks[_this.dataset.idx] : decks[_this.dataset.idx];
    let inReviews = false;
    let info = "This deck has now been added to your list of reviews.";
    for(let i = 0; i < user.reviews.length; i++) {
        if(user.reviews[i].deckid == deck.id) {
            inReviews = true;
            info = "This deck has now been removed from your list of reviews.";
            // update reviews
            user.reviews.splice(i, 1);
            // find in list of reviewDecks
            for(let j = 0; j < reviewDecks.length; j++) {
                if(reviewDecks[j].id == deck.id) {
                    reviewDecks.splice(j, 1);
                    break;
                }
            }
            // find div in added decks container
            console.log(addedDecksContainer.children);
            for(let j = 0; j < addedDecksContainer.children.length; j++) {
                if(addedDecksContainer.children[j].dataset.idx == i) {
                    addedDecksContainer.children[j].remove();
                }
            }
            _this.innerHTML = "Add";
            break;
        }
    }
    if(!inReviews) {
        user.reviews.push({
            deckid: deck.id,
            cards: []
        });
        // Add to list of reviewDecks
        reviewDecks.push(deck);
        let newBox = document.createElement("div");
        newBox.className = "ingredient-box";
        newBox.setAttribute("data-idx", reviewDecks.length - 1);
        newBox.innerHTML = `
            <div>   
                <img src="https://upload.wikimedia.org/wikipedia/en/thumb/f/f3/Flag_of_Russia.svg/2560px-Flag_of_Russia.svg.png" alt="Russian Flag">
                <div>
                    <h2>${deck.name}</h2>
                </div>
            </div>
            <div>
                <button class="previewBtns" data-idx="${reviewDecks.length - 1}">View</button>
                <button class="userReviewsUpdateBtns" data-idx="${reviewDecks.length - 1}">Remove</button>
            </div>
        `;
        addedDecksContainer.appendChild(newBox);
        newBox.getElementsByClassName("previewBtns")[0].addEventListener("mousedown", (e) => {preview(e.currentTarget, true);});
        newBox.getElementsByClassName("userReviewsUpdateBtns")[0].addEventListener("mousedown", (e) => {reviews_update(e.currentTarget, true);});
        _this.innerHTML = "Remove";
    }
    let json = JSON.stringify(user.reviews);
    await UserGateway.editUser("reviews", json);
    reviews_updateDialog.innerHTML = `
        <button class='closeBtns' id='ruDialog_leave'>x</button>
        <br>
        <h2>${info}</h2>
    `;
}

/*  DEPRECATED CODE:
// Buttons
const previewBtns = document.getElementsByClassName("previewBtns");
const addBtns = document.getElementsByClassName("addBtns");
const closeBtns = document.getElementsByClassName("closeBtns");
*/

// Close dialogs when user presses outside dialog
window.onclick = function(event) {
    if (event.target === previewDialog || event.target === reviews_updateDialog) {
        previewDialog.close();
        reviews_updateDialog.close();
    }
}