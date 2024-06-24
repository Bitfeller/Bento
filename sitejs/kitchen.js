import { UserGateway } from "../main/user_gateway.js";
import { DeckGateway } from "../main/deck_gateway.js";
// User + decks
let user;
let decks = [];
let reviewDecks = [];
let loaded = -1;
// Containers
const mainContainer = document.getElementsByClassName("container")[0];
const searchedDecksContainer = document.getElementById("searched_decks");
const addedDecksContainer = document.getElementById("added_decks");
const marketplace = document.getElementById("marketplace");
// Dialogs
const previewDialog = document.getElementById("previewDialog");
// Load btn
const loadBtn = document.getElementById("loadBtn");
// Search
const search = document.getElementById("search");
const searchText = document.getElementById("searchText");

function box(idx, inReviews = false, deckName, author, ofAddedDecks = false) {
    let a = document.createElement("div");
    a.className = "ingredient-box";
    a.setAttribute("data-idx", idx);
    a.innerHTML = `
        <div>
            <img src="https://upload.wikimedia.org/wikipedia/en/thumb/f/f3/Flag_of_Russia.svg/2560px-Flag_of_Russia.svg.png" alt="Russian Flag">
            <div>
                <h2>${deckName}</h2>
                <p>by <span class='username'>${author}</p>
            </div>
        </div>
        <div>
            <button class="previewBtns" data-idx="${idx}">View</button>
            <button class="userReviewsUpdateBtns" data-idx="${idx}">${inReviews ? "Remove" : "Add"}</button>
        </div>
    `;
    a.getElementsByClassName("previewBtns")[0].addEventListener("mousedown", (e) => {preview(e.currentTarget, ofAddedDecks);});
    a.getElementsByClassName("userReviewsUpdateBtns")[0].addEventListener("mousedown", (e) => {reviews_update(e.currentTarget, ofAddedDecks);});
    return a;
}

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
            let newBox = box(deck.id, true, deck.name, deck.owner, true);
            addedDecksContainer.appendChild(newBox);
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
        let newBox = box(decks[i].id, inReviews, decks[i].name, decks[i].owner, false);
        marketplace.appendChild(newBox);
    }
    loaded = decks.length - 1;
}
(async () => {
    let [success, data] = await UserGateway.getuser();
    if(!success && data == "no session") {
        mainContainer.remove();
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
        loadBtn.innerHTML = "Load more decks...";
    });
    search.addEventListener("keyup", async (e) => {
        if(e.key !== "Enter") return;
        searchedDecksContainer.innerHTML = "";
        searchText.style.display = "none";
        searchedDecksContainer.style.display = "none";
        if(search.value == "" || search.value == " ") return;
        let orig = search.value.split(" ");
        let [success, data] = await DeckGateway.getall(0, orig);
        searchText.style.display = "block";
        searchedDecksContainer.style.display = "flex";
        searchedDecksContainer.innerHTML = "There weren't any decks that matched your search results :(";
        if(!success) return;
        if(data.length == 0) return;
        searchText.style.display = "block";
        searchedDecksContainer.style.display = "flex";
        searchedDecksContainer.innerHTML = "";
        for(let i = 0; i < data.length; i++) {
            let deck = data[i];
            let inReviews = false;
            for(let j = 0; j < user.reviews.length; j++) {
                if(user.reviews[j].deckid == deck.id) {
                    inReviews = true;
                    break;
                }
            }
            let newBox = box(deck.id, inReviews, deck.name, deck.owner, false);
            searchedDecksContainer.appendChild(newBox);
        }
        let loaded = data.length;
        let s_loadBtn = document.createElement("button");
        s_loadBtn.id = "search_loadBtn";
        s_loadBtn.innerHTML = "Load more decks...";
        searchedDecksContainer.appendChild(s_loadBtn);
        s_loadBtn.addEventListener("mousedown", async () => {
            let [success, data] = await DeckGateway.getall(loaded, orig);
            if(!success) return;
            if(data.length == 0) {
                s_loadBtn.innerHTML = "No more decks to load...";
                return;
            }
            for(let i = 0; i < data.length; i++) {
                let deck = data[i];
                let inReviews = false;
                for(let j = 0; j < user.reviews.length; j++) {
                    if(user.reviews[j].deckid == deck.id) {
                        inReviews = true;
                        break;
                    }
                }
                let newBox = box(deck.id, inReviews, deck.name, deck.owner, false);
                searchedDecksContainer.appendChild(newBox);
            }
            loaded += data.length;
        });
    });
})();
async function preview(_this, isAdded) {
    previewDialog.showModal();
    let deck;
    let target = isAdded ? reviewDecks : decks;
    for(let i = 0; i < target.length; i++) {
        if(target[i].id == _this.dataset.idx) {
            deck = target[i];
        }
    }
    await UserGateway.editUser("view", String(deck.id));
    let answer_list = "";
    if(!deck.data.deckData) {
        answer_list = "[CORRUPT DECK]";
    } else {
        for(let i = 0; i < deck.data.deckData.length; i++) {
            answer_list += `<p><b>Q: ${deck.data.deckData[i].question}</b></p>${deck.data.deckData[i].type == "selection" ? "<p>All Answers: " + deck.data.deckData[i].answers.join(", ") + "</p>" : ""}<p>A: ${deck.data.deckData[i].correctAnswer || deck.data.deckData[i].answer.join(", ")}</p><div class='deck-divider' style='margin: 7px 3px; background-color: rgb(230, 230, 230); height: 2px;'></div>`;
        }
    }
    console.log(deck);
    previewDialog.innerHTML = `
        <div class='title-bar'>
            <h2>Preview:</h2>
            <button class="closeBtns" id="previewDialog_leave">x</button>
        </div>
        <div class='preview-container'>
            <div class='preview-container-part' id='overview'>
                <h2>${deck.name}</h2>
                <p>by <span class='username'>${deck.owner}</span></p>
                <p><span class='views'>${deck.viewdata.length}</span> view${deck.viewdata.length > 1 ? "s" : ""}</p>
            </div>
            <div class='preview-container-part' id='description'>
                <h3>Description:</h3>
                <p>${deck.data.description}</p>
            </div>
            <div class='preview-container-part' id='cards'>
                <h3>Cards</h3>
                ${answer_list}
            </div>
        </div>
    `;
    previewDialog.getElementsByClassName("closeBtns")[0].addEventListener("mousedown", () => {
        previewDialog.close();
    });
}
async function reviews_update(_this, isAdded) {
    let deck;
    let target = isAdded ? reviewDecks : decks;
    for(let i = 0; i < target.length; i++) {
        if(target[i].id == _this.dataset.idx) {
            deck = target[i];
        }
    }
    let inReviews = false;
    for(let i = 0; i < user.reviews.length; i++) {
        if(user.reviews[i].deckid == deck.id) {
            inReviews = true;
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
            for(let j = 0; j < addedDecksContainer.children.length; j++) {
                if(addedDecksContainer.children[j].dataset.idx == deck.id) {
                    addedDecksContainer.children[j].remove();
                    break;
                }
            }
            // update div in marketplace
            let divs = document.getElementsByClassName("ingredient-box");
            for(let j = 0; j < divs.length; j++) {
                if(divs[j].dataset.idx == deck.id) {
                    divs[j].getElementsByClassName("userReviewsUpdateBtns")[0].innerHTML = "Add";
                    break;
                }
            }
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
        let newBox = box(deck.id, true, deck.name, deck.owner, true);
        addedDecksContainer.appendChild(newBox);
        _this.innerHTML = "Remove";
    }
    let json = JSON.stringify(user.reviews);
    await UserGateway.editUser("reviews", json);
}

// Close dialogs when user presses outside dialog
window.onclick = function(event) {
    if (event.target === previewDialog) {
        previewDialog.close();
    }
}