import { UserGateway } from "../server/client-gateway/user-gateway.js";
import { DeckGateway } from "../server/client-gateway/deck-gateway.js";
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

function box(idx, inReviews = false, deckName, deckpic, author, ofAddedDecks = false) {
    let a = document.createElement("div");
    a.className = "ingredient-box";
    a.setAttribute("data-idx", idx);
    a.innerHTML = `
        <div>
            <img src="${deckpic && deckpic.length > 0 ? deckpic : "../../img/defaultdeckpic.png"}" alt="Deck image">
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
        let keys = Object.keys(user.reviews);
        if(keys.length > 0) addedDecksContainer.innerHTML = "";
        for(let i = 0; i < keys.length; i++) {
            let deckid = parseInt(keys[i]);
            let [success, deck] = await DeckGateway.get(deckid);
            if(!success) continue;
            reviewDecks.push(deck);
            let newBox = box(deck.id, true, deck.name, deck.deckpic, deck.owner, true);
            addedDecksContainer.appendChild(newBox);
        }
    }
    // Update marketplace
    for(let i = loaded + 1; i < decks.length; i++) {
        // In reviews?
        let inReviews = user.reviews[decks[i].id] ? true : false;
        // Create new container item and display deck
        let newBox = box(decks[i].id, inReviews, decks[i].name, decks[i].deckpic, decks[i].owner, false);
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
        searchedDecksContainer.innerHTML = "<p class=\"info-blank\">There weren't any decks that matched your search results.</p>";
        if(!success) return;
        if(data.length == 0) return;
        searchText.style.display = "block";
        searchedDecksContainer.style.display = "flex";
        searchedDecksContainer.innerHTML = "";
        for(let i = 0; i < data.length; i++) {
            let deck = data[i];
            let inReviews = user.reviews[deck.id] ? true : false;
            let newBox = box(deck.id, inReviews, deck.name, deck.deckpic, deck.owner, false);
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
                let inReviews = user.reviews[deck.id] ? true : false;
                let newBox = box(deck.id, inReviews, deck.name, deck.deckpic, deck.owner, false);
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
    if(deck.deleted == true) {
        previewDialog.innerHTML = `
            <div class='title-bar'>
                <h2>Preview:</h2>
                <button class="closeBtns" id="previewDialog_leave"><span class="material-symbols-outlined">close</span></button>
            </div>
            <div class='preview-container'>
                <div class='preview-container-part' id='overview'>
                    <h2>${deck.name}</h2>
                    <p>This deck was deleted.</p>
                </div>
            </div>
        `;
        previewDialog.getElementsByClassName("closeBtns")[0].addEventListener("mousedown", () => {
            previewDialog.close();
        });
        return;
    }
    await UserGateway.editUser("view", String(deck.id));
    let answer_list = "";
    if(!deck.data.contnt) {
        answer_list = "[CORRUPT DECK]";
    } else {
        let contnt = deck.data.contnt;
        let keys = Object.keys(contnt);
        for(let i = 0; i < keys.length; i++) {
            answer_list += `<p><b>Q |  ${keys[i]}</b></p>${contnt[keys[i]].type == "mc" ? "<p>" + contnt[keys[i]].op.join(", ") + "</p>" : ""}<p>A |  ${typeof(contnt[keys[i]].ans) == "string" ? contnt[keys[i]].ans : contnt[keys[i]].ans.join(", ")}</p><div class='deck-divider' style='margin: 7px 3px; background-color: rgb(230, 230, 230); height: 2px;'></div>`;
        }
    }
    previewDialog.innerHTML = `
        <div class='title-bar'>
            <h2>Preview:</h2>
            <button class="closeBtns" id="previewDialog_leave"><span class="material-symbols-outlined">close</span></button>
        </div>
        <div class='preview-container'>
            <div class='preview-container-part' id='overview'>
                <h2>${deck.name}</h2>
                <p>By: <span class='username'>${deck.owner}</span></p>
                <div class="line-up-icons view-container"><span class='views'>${deck.viewdata.length ?? 0}</span> <span class="material-symbols-outlined views-icon">visibility</span></div>
                ${user.username == deck.owner ? "<div class='deck-buttons'><button class='export-btn' style='padding: 3px;'><div class='line-up-icons'><span class='material-symbols-outlined' style='font-size: 15px; color: black;'>download</span> Export</div></button> <button class='edit-btn' style='padding: 3px;'><div class='line-up-icons'><span class='material-symbols-outlined' style='font-size: 15px; color: black;'>edit</span> Edit</div></button> <button class='delete-btn' style='padding: 3px;'><div class='line-up-icons'><span class='material-symbols-outlined' style='font-size: 15px; color: black;'>delete</span> Delete</div></button></div>" : ""}
            </div>
            ${deck.data.desc ? `<div class='preview-container-part' id='description'>
                <p>${deck.data.desc}</p>
            </div>` : ""}
            <div class='preview-container-part' id='cards'>
                ${answer_list}
            </div>
        </div>
    `;
    previewDialog.getElementsByClassName("closeBtns")[0].addEventListener("mousedown", () => {
        previewDialog.close();
    });
    if(user.username == deck.owner) {    
        previewDialog.getElementsByClassName("export-btn")[0].addEventListener("mousedown", () => {
            const data = {
                name: deck.name,
                desc: deck.data.desc,
                deckData: deck.data.contnt
            };
            const json = JSON.stringify(data);
            const file = new File([json], deck.name+'.txt', {type: "text/plain"});
            const link = document.createElement("a");
            const url = URL.createObjectURL(file);
            link.href = url;
            link.download = file.name;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url); 
        });
        previewDialog.getElementsByClassName("edit-btn")[0].addEventListener("mousedown", () => {
            window.location.href = "/learn/editdeck?d=" + deck.id; 
        });
        previewDialog.getElementsByClassName("delete-btn")[0].addEventListener("mousedown", async () => {
            await DeckGateway.modify(deck.id, "delete", "");
            previewDialog.close();
            for(let i = 0; i < target.length; i++) {
                if(target[i].id == deck.id) {
                    target[i] = {
                        id: deck.id,
                        deleted: true
                    }
                }
            }
        });
    }
}
async function reviews_update(_this, isAdded) {
    let deck;
    let target = isAdded ? reviewDecks : decks;
    for(let i = 0; i < target.length; i++) {
        if(target[i].id == _this.dataset.idx) {
            deck = target[i];
        }
    }
    if(user.reviews[deck.id]) {
        delete user.reviews[deck.id];
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
                if(addedDecksContainer.innerHTML.length == 0) addedDecksContainer.innerHTML = "<p class=\"info-blank\">You haven't added any decks to your reviews yet.</p>";
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
    } else {
        user.reviews[deck.id] = {};
        // Add to list of reviewDecks
        reviewDecks.push(deck);
        let newBox = box(deck.id, true, deck.name, deck.deckpic, deck.owner, true);
        if(addedDecksContainer.children.length == 1 && addedDecksContainer.children[0].className == "info-blank") addedDecksContainer.innerHTML = "";
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