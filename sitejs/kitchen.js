import { UserGateway } from "../server/client-gateway/user-gateway.js";
import { DeckGateway } from "../server/client-gateway/deck-gateway.js";
// User + decks
let user;
let decks = [], cache_decks = {}, reviewDecks = [];
let loaded = -1;
// Containers
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
    a.style.backgroundImage = `url(${deckpic && deckpic.length > 0 ? deckpic : "../../img/defaultdeckpic.png"})`;
    a.innerHTML = `
        <div>
            <h2>${deckName}</h2>
            <p>by <span class='username'>${author}</p>
        </div>
        <button class="previewBtns" data-idx="${idx}"><div class='material-symbols-outlined'>visibility</div></button>
        <button class="userReviewsUpdateBtns" data-idx="${idx}">${inReviews ? "<div class='material-symbols-outlined'>remove</div>" : "<div class='material-symbols-outlined'>add</div>"}</button>
    `;
    a.getElementsByClassName("previewBtns")[0].addEventListener("mousedown", (e) => {preview(e.currentTarget, ofAddedDecks);});
    a.getElementsByClassName("userReviewsUpdateBtns")[0].addEventListener("mousedown", (e) => {reviews_update(e.currentTarget, ofAddedDecks);});
    return a;
}

function end_phony_loading(deck) {
    for(let i = 0; i < addedDecksContainer.children.length; i++) {
        if(addedDecksContainer.children[i].dataset.idx == deck.id) {
            addedDecksContainer.children[i].style.backgroundImage = `url(${deck.deckpic && deck.deckpic.length > 0 ? deck.deckpic : "../../img/defaultdeckpic.png"})`;
            reviewDecks[i].deckpic = deck.deckpic;
            break;
        }
    }
}
async function update() {
    if(loaded >= decks.length - 1) return void (loaded = decks.length - 1);

    // Update user's reviews
    if(reviewDecks.length == 0) {
        // Update decks in the user's review list
        let keys = Object.keys(user.userdata.reviews);
        let update = false;
        if(keys.length > 0) addedDecksContainer.innerHTML = "";
        for(let i = 0; i < keys.length; i++) {
            let deckid = parseInt(keys[i]);
            let success = true, deck;
            for(let i = 0; i < decks.length; i++) if(decks[i].id == deckid) deck = decks[i];
            let awaitLoad = true;
            if(!deck) {
                awaitLoad = false;
                [success, deck] = await DeckGateway.get(deckid, false, true, false);
            }
            if(!success) {
                // Check if the deck doesn't exist. If it doesn't, remove it from the user's reviews and require update.
                if(deck == "no deck") {
                    delete user.userdata.reviews[deckid];
                    update = true;
                }
                continue; // Ignore other causes like failed to load.
            }
            reviewDecks.push(deck);
            // Add phony loader
            let newBox = box(deck.id, true, deck.name, awaitLoad ? "../../img/defaultdeckpic.png" : deck.deckpic, deck.owner, true);
            addedDecksContainer.appendChild(newBox);
        }
        if(update) {
            let json = JSON.stringify(window.lib.recur_decode(user.userdata.reviews));
            await UserGateway.editUser("reviews", json);
        }
    }

    // Update marketplace
    for(let i = loaded + 1; i < decks.length; i++) {
        // In reviews?
        let inReviews = user.userdata.reviews[decks[i].id] ? true : false;
        // Load deckpic
        (async () => {
            let newBox = box(decks[i].id, inReviews, decks[i].name, "../../img/loading.png", decks[i].owner, false);
            // Create new container item and display deck
            marketplace.appendChild(newBox);
            let [success, img] = await DeckGateway.get(decks[i].id, false, true, false);
            if(!success) return;
            newBox.style.backgroundImage = `url(${img.deckpic && img.deckpic.length > 0 ? img.deckpic : "../../img/defaultdeckpic.png"})`;
            decks[i].deckpic = img.deckpic;
            end_phony_loading(decks[i]);
        })();
    }

    loaded = decks.length - 1;
}
(async () => {
    let [success, data] = await UserGateway.getuser(false, true, true, false);
    if(!success && data == "no session") return window.LOAD_ERROR("You must be signed in to view decks!");
    user = data;
    // For deck fetching, the system lazy loads primary deck info and actually fetches the deck when accessed/viewed
    [success, data] = await DeckGateway.getall(0);
    if(!success) return;
    if(data.length == 0) return window.LOAD_ERROR("There aren't any decks...? Odd.");
    decks.push(...data);
    await update();
    window.LOADED();
    loadBtn.addEventListener("mousedown", async () => {
        loadBtn.innerHTML = "Loading more decks...";
        let [success, data] = await DeckGateway.getall(decks.length);
        if(!success) return;
        if(data.length == 0) return void (loadBtn.innerHTML = "No more decks to load...");
        decks.push(...data);
        await update();
        loadBtn.innerHTML = "<h3>Load more decks...</h3>";
    });
    search.addEventListener("keyup", async (e) => {
        if(e.key !== "Enter") return;
        searchText.style.display = searchedDecksContainer.style.display = "none";
        if(search.value == "" || search.value == " ") return;
        let orig = search.value.split(" ");
        let [success, data] = await DeckGateway.getall(0, orig);
        searchText.style.display = "block";
        searchedDecksContainer.innerHTML = "<p class=\"info-blank\">There weren't any decks that matched your search results.</p>";
        searchedDecksContainer.style.display = "flex";
        if(!success || data.length == 0) return;
        searchedDecksContainer.innerHTML = "";

        for(let i = 0; i < data.length; i++) {
            let deck = data[i];
            let inReviews = user.userdata.reviews[deck.id] ? true : false;
            let newBox = box(deck.id, inReviews, deck.name, deck.deckpic, deck.owner, false);
            searchedDecksContainer.appendChild(newBox);
        }

        let loaded = data.length;
        function btnize() {
            let s_loadBtn = document.createElement("button");
            s_loadBtn.id = "search_loadBtn";
            s_loadBtn.innerHTML = "<h3>Load more decks...</h3>";
            s_loadBtn.addEventListener("mousedown", async () => {
                let [success, data] = await DeckGateway.getall(loaded, orig);
                if(!success || data.length == 0) return void (s_loadBtn.innerHTML = "No more decks to load...");
                s_loadBtn.remove();
                for(let i = 0; i < data.length; i++) {
                    let deck = data[i];
                    let inReviews = user.userdata.reviews[deck.id] ? true : false;
                    let newBox = box(deck.id, inReviews, deck.name, deck.deckpic, deck.owner, false);
                    searchedDecksContainer.appendChild(newBox);
                }
                loaded += data.length;
                btnize();
            });
            searchedDecksContainer.appendChild(s_loadBtn);
        }
        btnize();
    });
})();
async function preview(_this, isAdded) {
    previewDialog.showModal();
    let id = parseInt(_this.dataset.idx), data = cache_decks[id];
    previewDialog.innerHTML = `
        <div class='title-bar'>
            <h2>... fetching your deck ...</h2>
        </div>
    `;
    if(!data) {
        let [success, deck] = await DeckGateway.get(id, true, false);
        if(!success) {
            previewDialog.innerHTML = `
                <div class='title-bar'>
                    <h2>Hmm.</h2>
                    <button class="closeBtns" id="previewDialog_leave"><span class="material-symbols-outlined">close</span></button>
                </div>
                <div class='preview-container'>
                    <div class='preview-container-part' id='overview'>
                        <h2>no info</h2>
                        <p>We couldn't load this deck.</p>
                    </div>
                </div>
            `;
            previewDialog.getElementsByClassName("closeBtns")[0].addEventListener("mousedown", () => previewDialog.close());
            return;
        }
        data = deck.data;
        cache_decks[id] = data;
    }
    let deck;
    let target = isAdded ? reviewDecks : decks;
    for(let i = 0; i < target.length; i++)
        if(target[i].id == _this.dataset.idx) deck = target[i];
    await UserGateway.editUser("view", String(deck.id));
    let answer_list = "";
    if(!data.contnt) answer_list = "[This deck appears to be corrupt...]";
    else {
        let contnt = data.contnt;
        let keys = Object.keys(contnt);
        for(let i = 0; i < keys.length; i++) answer_list += `<p><b>Q |  ${keys[i]}</b></p>${contnt[keys[i]].type == "mc" ? "<p>" + contnt[keys[i]].op.join(", ") + "</p>" : ""}<p>A | ${(contnt[keys[i]].type == "mc" ? contnt[keys[i]].ans.map(x => contnt[keys[i]].op[x]) : contnt[keys[i]].ans).join(", ")}</p><div class='deck-divider' style='margin: 7px 3px; background-color: rgb(230, 230, 230); height: 2px;'></div>`;
    }
    previewDialog.innerHTML = `
        <div class='title-bar'>
            <h2>Preview:</h2>
            <button class="closeBtns" id="previewDialog_leave"><span class="material-symbols-outlined">close</span></button>
        </div>
        <div class='preview-container'>
            <div class='preview-container-part' id='overview'>
                <h2>${deck.name}</h2>
                <p>By: <span class='username'>${deck.owner}</span>${deck.public == 0 ? "<span class='private-deck'>Private</span>" : ""}</p>
                <div class="line-up-icons view-container"><span class='views'>${deck.views ?? 0}</span> <span class="material-symbols-outlined views-icon">visibility</span></div>
                ${user.username == deck.owner ? "<div class='deck-buttons'><button class='export-btn' style='padding: 3px;'><div class='line-up-icons'><span class='material-symbols-outlined' style='font-size: 15px; color: black;'>download</span> Export</div></button> <button class='edit-btn' style='padding: 3px;'><div class='line-up-icons'><span class='material-symbols-outlined' style='font-size: 15px; color: black;'>edit</span> Edit</div></button> <button class='delete-btn' style='padding: 3px;'><div class='line-up-icons'><span class='material-symbols-outlined' style='font-size: 15px; color: black;'>delete</span> Delete</div></button></div>" : ""}
            </div>
            ${data.desc ? `<div class='preview-container-part' id='description'>
                <p>${data.desc}</p>
            </div>` : ""}
            <div class='preview-container-part' id='cards'>
                ${answer_list}
            </div>
        </div>
    `;
    previewDialog.getElementsByClassName("closeBtns")[0].addEventListener("mousedown", () => previewDialog.close());
    if(user.username == deck.owner) {    
        previewDialog.getElementsByClassName("export-btn")[0].addEventListener("mousedown", () => {
            const d = {
                name: window.lib.decode(deck.name),
                desc: window.lib.decode(data.desc),
                contnt: window.lib.recur_decode(data.contnt)
            };
            const json = JSON.stringify(d);
            const file = new File([json], d.name+'.json', {type: "text/plain"});
            const link = document.createElement("a");
            const url = URL.createObjectURL(file);
            link.href = url;
            link.download = file.name;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url); 
        });
        previewDialog.getElementsByClassName("edit-btn")[0].addEventListener("mousedown", () => window.location.href = "/learn/editdeck?d=" + deck.id);
        let confirmed = false;
        previewDialog.getElementsByClassName("delete-btn")[0].addEventListener("mousedown", async () => {
            if(!confirmed) {
                previewDialog.getElementsByClassName("delete-btn")[0].innerHTML = "<div class='line-up-icons'><span class='material-symbols-outlined' style='font-size: 15px; color: black;'>delete_forever</span> Are you sure?</div>";
                confirmed = true;
                return;
            }
            previewDialog.innerHTML = `
                 <div class='title-bar'>
                    <h2>... deleting this deck ...</h2>
                </div>
            `;
            await DeckGateway.modify(deck.id, "delete", "");
            previewDialog.close();
            // find div in added decks container
            for(let j = 0; j < addedDecksContainer.children.length; j++)
                if(addedDecksContainer.children[j].dataset.idx == deck.id) {
                    addedDecksContainer.children[j].remove();
                    if(addedDecksContainer.innerHTML.length == 0) addedDecksContainer.innerHTML = "<p class=\"info-blank\">You haven't added any decks to your reviews yet.</p>";
                    break;
                }
            // update div in marketplace
            let divs = document.getElementsByClassName("ingredient-box");
            for(let j = 0; j < divs.length; j++)
                if(divs[j].dataset.idx == deck.id) {
                    divs[j].remove();
                    break;
                }
        });
    }
}
async function reviews_update(_this, isAdded) {
    let deck;
    let target = isAdded ? reviewDecks : decks;
    for(let i = 0; i < target.length; i++) if(target[i].id == _this.dataset.idx) deck = target[i];
    if(user.userdata.reviews[deck.id]) {
        delete user.userdata.reviews[deck.id];
        // find in list of reviewDecks
        for(let j = 0; j < reviewDecks.length; j++)
            if(reviewDecks[j].id == deck.id) {
                reviewDecks.splice(j, 1);
                break;
            }
        // find div in added decks container
        for(let j = 0; j < addedDecksContainer.children.length; j++)
            if(addedDecksContainer.children[j].dataset.idx == deck.id) {
                addedDecksContainer.children[j].remove();
                if(addedDecksContainer.innerHTML.length == 0) addedDecksContainer.innerHTML = "<p class=\"info-blank\">You haven't added any decks to your reviews yet.</p>";
                break;
            }
        // update div in marketplace
        let divs = document.getElementsByClassName("ingredient-box");
        for(let j = 0; j < divs.length; j++)
            if(divs[j].dataset.idx == deck.id) {
                divs[j].getElementsByClassName("userReviewsUpdateBtns")[0].innerHTML = "<div class='material-symbols-outlined'>add</div>";
                break;
            }
    } else {
        user.userdata.reviews[deck.id] = {};
        // Make sure deck still exists
        let [success, _] = await DeckGateway.get(deck.id, false, false);
        if(!success) {
            previewDialog.showModal();
            previewDialog.innerHTML = `
                <div class='title-bar'>
                    <h2>Hmm.</h2>
                    <button class="closeBtns" id="previewDialog_leave"><span class="material-symbols-outlined">close</span></button>
                </div>
                <div class='preview-container'>
                    <div class='preview-container-part' id='overview'>
                        <h2>no info</h2>
                        <p>We weren't able to add this deck, or it was deleted by its owner.<br>You can close this prompt once you're done.</p>
                    </div>
                </div>
            `;
            previewDialog.getElementsByClassName("closeBtns")[0].addEventListener("mousedown", () => previewDialog.close());
            // find div in added decks container
            for(let j = 0; j < addedDecksContainer.children.length; j++)
                if(addedDecksContainer.children[j].dataset.idx == deck.id) {
                    addedDecksContainer.children[j].remove();
                    if(addedDecksContainer.innerHTML.length == 0) addedDecksContainer.innerHTML = "<p class=\"info-blank\">You haven't added any decks to your reviews yet.</p>";
                    break;
                }
            // update div in marketplace
            let divs = document.getElementsByClassName("ingredient-box");
            for(let j = 0; j < divs.length; j++)
                if(divs[j].dataset.idx == deck.id) {
                    divs[j].remove();
                    break;
                }
            return;
        }
        // Add to list of reviewDecks
        reviewDecks.push(deck);
        let newBox = box(deck.id, true, deck.name, deck.deckpic, deck.owner, true);
        if(addedDecksContainer.children.length == 1 && addedDecksContainer.children[0].className == "info-blank") addedDecksContainer.innerHTML = "";
        addedDecksContainer.appendChild(newBox);
        _this.innerHTML = "<div class='material-symbols-outlined'>remove</div>";
    }
    let json = JSON.stringify(window.lib.recur_decode(user.userdata.reviews));
    await UserGateway.editUser("reviews", json);
}

// Close dialogs when user presses outside dialog
window.addEventListener("mousedown", e => {
    if(e.target === previewDialog) previewDialog.close();
});