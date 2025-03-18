import { UserGateway } from "../server/client-gateway/user-gateway.js";
import { DeckGateway } from "../server/client-gateway/deck-gateway.js";

// User, decks
let user;
let loaded = -1, loadedReviews = false;
let decks = [];
let saveDecks = [];

const sidebar = document.getElementsByClassName("sidebar")[0];

const searchBar = document.getElementById('searchBar');
const regex = document.getElementsByName('regex')[0];
const caseSensitive = document.getElementsByName('case-sensitive')[0];
const sortOptions = document.getElementById('sortOptions');

const hasMc = document.getElementById('mcCheckbox');
const hasTxt = document.getElementById('textCheckbox');
const hasRank = document.getElementById('rankCheckbox');
const hasMtch = document.getElementById('matchingCheckbox');

const ownedDecks = document.getElementsByClassName("owned-decks")[0];
const pubDTitle = document.getElementById("pub-d-title");
const pubDecks = document.getElementsByClassName("popular-decks")[0];
const previewDialog = document.getElementById("preview-dialog");

// ----------------- Image Query -----------------
let queries = [];
let handler;

async function query(id) {
    let q;
    if(handler) await handler;
    handler = await new Promise((res, _) => {
        for(let curr of queries) {
            if(curr.id == id) {
                q = curr;
                return res();
            }
        }
        q = {
            id: id,
            req: DeckGateway.get(id, true, true, false)
        };
        queries.push(q);
        res();
    });
    return await q.req;
}

// ----------------- Typeset -----------------
async function typeset(node) {
    if(Object.keys(MathJax.startup) == 0)
        await new Promise((res) => {
            MathJax.startup.ready = res;
        });
    MathJax.startup.promise = MathJax.startup.promise.then(() => MathJax.typesetPromise([node])).catch(e => console.warn("math formatting failed; reason:", e.message));
    return MathJax.startup.promise;
}


function box(id, killfn = (box) => box.remove()) {
    let b = document.createElement('div');
    b.className = "ingredient-box";
    b.setAttribute("data-id", id);
    b.style.backgroundImage = 'url("../../img/loading.gif")';
    b.innerHTML = `
        <div>
            <h2 class='name'>.</h2>
            <div class='deck-bottom-row'>
                <p>by: <span class='username'>.</span></p>
                <div class='deck-tags'></div>
            </div>
        </div>
        <button class="preview-button" data-id='${id}'>
            <div class="material-symbols-outlined">visibility</div>
        </button>
        <button class="add-button" data-id='${id}'>
            <div class="material-symbols-outlined">${user.userdata.reviews[id] ? "remove" : "add"}</div>
        </button>
    `;

    let name = b.getElementsByClassName('name')[0];
    let username = b.getElementsByClassName('username')[0];
    let frameCount = 0;
    let int = window.setInterval(() => {
        frameCount++;
        name.innerHTML = '.'.repeat(frameCount % 3 + 1);
        username.innerHTML = '.'.repeat(frameCount % 3 + 1);
    }, 500);
    
    async function _load() {
        let tags = b.getElementsByClassName('deck-tags')[0];
        let [success, data] = await query(id);
        window.clearInterval(int);
        if(!success) {
            killfn(b);
            name.style.color = 'var(--danger-red)';
            name.style.fontStyle = 'italic';
            if(data == 'no deck')
                name.innerHTML = "doesn't exist";
            else
            name.innerHTML = "couldn't fetch";
            username.parentNode.remove();
            b.style.backgroundImage = 'url("../../img/defaultdeckpic.png")';
            b.getElementsByClassName('preview-button')[0].remove();
            b.getElementsByClassName('add-button')[0].remove();
            return;
        }
        
        name.innerHTML = data.name;
        username.innerHTML = `<u>${data.owner}</u>`;
        b.style.backgroundImage = `url(${data.deckpic && data.deckpic.length > 0 ? data.deckpic : "../../img/defaultdeckpic.png"})`;
        if(data.data.tags) {
            for(let tag of data.data.tags)
                tags.innerHTML += `<div class='tag'><p>${tag}</p></div>`;
        }

        b.getElementsByClassName('preview-button')[0].addEventListener('click', e => preview(e.currentTarget));
        b.getElementsByClassName('add-button')[0].addEventListener('click', e => updateReviews(e.currentTarget));
    }

    return {
        box: b,
        loader: _load()
    };
}
function removeBox(id) {
    let b = ownedDecks.querySelector(`.ingredient-box[data-id="${id}"]`);
    if(b) b.remove();
    if(ownedDecks.children.length == 0)
        ownedDecks.innerHTML = `<p class='info-blank'>You haven't added any decks to your reviews yet.</p>`;
    b = pubDecks.querySelector(`.ingredient-box[data-id="${id}"]`);
    if(b) b.remove();
}

async function update() {
    if(loaded >= decks.length - 1) return void (loaded = decks.length - 1);

    let reviews_heap = [];
    let updateReviews = false;

    if(!loadedReviews) {
        for(let key in user.userdata.reviews) {
            let id = parseInt(key);
            let review = box(id, (node) => {
                node.remove();
                delete user.userdata.reviews[id];
                updateReviews = true;
            });
            reviews_heap.push(review.loader);
            ownedDecks.append(review.box);
        }
    }

    for(let i = loaded + 1; i < decks.length; i++)
        pubDecks.append(box(decks[i].id).box);

    // Await reviews pile
    if(!loadedReviews) {
        loadedReviews = true;
        await Promise.all(reviews_heap);
        reviews_heap = [];
        if(updateReviews) {
            let json = JSON.stringify(window.lib.recur_decode(user.userdata.reviews));
            await UserGateway.editUser('reviews', json);
        }
    }

    loaded = decks.length - 1;
}
async function preview(_this) {
    previewDialog.showModal();
    previewDialog.innerHTML = `
        <div class='title-bar'>
            <h2>...</h2>
        </div>
    `;
    let id = parseInt(_this.dataset.id), deck = await query(id);
    if(!deck[0]) {
        previewDialog.innerHTML = `
            <div class='title-bar'>
                <h2>Hmm.</h2>
                <button id='preview-dialog-leave'><span class='material-symbols-outlined'>close</span></button>
            </div>
            <div class='preview-container'>
                <div class='preview-container-part id='overview'>
                    <p>We couldn't load this deck.</p>
                </div>
            </div>
        `;
        document.getElementById('preview-dialog-leave').addEventListener('click', () => previewDialog.close());
        return;
    }
    deck = deck[1];

    await UserGateway.editUser("view", String(id));
    
    let answer_list = "";
    if(!deck.data.contnt) answer_list = `<p class='info-blank'>This deck appears to be corrupt.</p>`;
    else {
        let contnt = deck.data.contnt;
        for(let q in contnt) {
            answer_list += `
                <div class='question-box'>
                    <p><b class='mathJax'>Q: ${q}</b></p>
                    ${
                        contnt[q].type == 'mc'
                            ? `<p>O | ${contnt[q].op
                                .map(x => `<span class='mathJax'>${x}</span>`)
                                .join(' | ')}</p>`
                            : ``    
                    }
                    <p class='mathJax'>A | 
                    ${(
                        contnt[q].type == 'mc'
                            ? contnt[q].ans
                                .map(x => contnt[q].op[x])
                            : contnt[q].ans
                    ).join(" | ")}
                </div>
            `;
        }
    }
    previewDialog.innerHTML = `
        <div class='title-bar'>
            <h2>Preview</h2>
            <button id='preview-dialog-leave'><span class='material-symbols-outlined'>close</span></button>
        </div>
        <div class='preview-container'>
            <div class='preview-container-part' id='overview'>
                <h2>${deck.name}</h2>
                <p>by: <span class='username'><u>${deck.owner}</u></span>${deck.public == 0 ? `<span class='private-deck>private</span>` : ''}</p>
                <div class='line-up-icons view-container'><span class='views'>${deck.views ?? 0}</span> <span class="material-symbols-outlined views-icon">visibility</span></div>
                ${user.username == deck.owner
                    ? ` <div class='preview-btns'>
                            <button class='preview-btn' id='preview-export-btn'>
                                <div class='line-up-icons'>
                                    <span class='preview-ico material-symbols-outlined'>download</span> Export
                                </div>
                            </button>
                            <button class='preview-btn' id='preview-edit-btn'>
                                <div class='line-up-icons'>
                                    <span class='preview-ico material-symbols-outlined'>edit</span> Edit
                                </div>
                            </button>
                            <button class='preview-btn' id='preview-delete-btn'>
                                <div class='line-up-icons'>
                                    <span class='preview-ico material-symbols-outlined'>delete</span> Delete
                                </div>
                            </button>
                        </div>`
                    : ""
                }
            </div>
            ${deck.data.desc
                ?  `<div class='preview-container-part' id='description'
                        <p>${deck.data.desc}</p>
                    </div>`
                : ""
            }
            <div class='preview-container-part' id='cards'>
                ${answer_list}
            </div>
        </div>
    `;
    Array(previewDialog.getElementsByClassName('mathJax')).map(x => typeset(x));
    document.getElementById('preview-dialog-leave').addEventListener('click', () => previewDialog.close());
    if(user.username == deck.owner) {
        let warned = false;
        document.getElementById('preview-export-btn').addEventListener('click', () => {
            const deckExport = {
                name: window.lib.decode(deck.name),
                desc: window.lib.decode(deck.data.desc),
                contnt: window.lib.recur_decode(deck.data.contnt)
            };
            const json = JSON.stringify(deckExport);
            const file = new File([json], d.name+'.json', { type: 'text/plain' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(file);
            link.href = url;
            link.download = file.name;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        });
        document.getElementById('preview-edit-btn').addEventListener('click', () => window.location.href = '/learn/editdeck?d=' + id);
        
        let deleteBtn = document.getElementById('preview-delete-btn');
        deleteBtn.addEventListener('click', async () => {
            if(!warned) {
                deleteBtn.innerHTML = `
                    <div class='line-up-icons'>
                        <span class='preview-ico material-symbols-outlined'>delete_forever</span> Are you sure?
                    </div>
                `;
                warned = true;
                return;
            }
            previewDialog.innerHTML = `
                <div class='title-bar'>
                    <h2>... deleting this deck ...</h2>
                </div>
            `;
            await DeckGateway.modify(id, 'delete', '');
            previewDialog.close();
            removeBox(id);
        });
    }
}
async function updateReviews(_this) {
    let id = _this.dataset.id;
    if(user.userdata.reviews[id]) {
        delete user.userdata.reviews[id];
        removeBox(id);
    } else {
        user.userdata.reviews[id] = {};
        let [success, _] = await DeckGateway.get(id, false, false, false);
        if(!success) {
            previewDialog.showModal();
            previewDialog.innerHTML = `
                <div class='title-bar'>
                    <h2>Hmm.</h2>
                    <button id='preview-dialog-leave'><span class='material-symbols-outlined'>close</span></button> 
                </div>
                <div class='preview-container'>
                    <div class='preview-container-part' id='overview'>
                        <p>This deck was deleted by its owner, or there's an issue on our side.</p>
                    </div>
                </div>
            `;
            document.getElementById('preview-dialog-leave').addEventListener('click', () => previewDialog.close());
            removeBox(id);
            return;
        }
        if(ownedDecks.children.length == 1 && ownedDecks.children[0].className == "info-blank")
            ownedDecks.innerHTML = ``;
        ownedDecks.append(box(id).box);
        _this.innerHTML = `<div class='material-symbols-outlined'>remove</div>`;
    }
    let json = JSON.stringify(window.lib.recur_decode(user.userdata.reviews));
    await UserGateway.editUser('reviews', json);
}
function getSortFilter() {
    switch(sortOptions.value) {
        case "alphabet": return 1;
        case "reverse-alphabet": return 2;
        case "time": return 3;
        case "reverse-time": return 4;
    }
}

(async () => {
    let [success, data] = await UserGateway.getuser(false, true, true, false);
    if(!success && data == 'no session') return window.LOAD_ERROR("Please sign in.");
    if(!success) return window.LOAD_ERROR("Failed to fetch your user data.");
    user = data;
    [success, data] = await DeckGateway.getall(0);
    if(!success) return;
    if(data.length == 0) return window.LOAD_ERROR("There aren't any decks...? Odd.");
    decks.push(...data);
    await update();
    window.LOADED();
})();

searchBar.addEventListener('keyup', async e => {
    if(e.key != 'Enter') return;
    let query = searchBar.value;
    if(query.length == 0 && saveDecks.length != 0) {
        // Reset to default
        pubDTitle.innerHTML = "Public Decks:";
        loaded = -1;
        decks = saveDecks;
        saveDecks = [];
        pubDecks.innerHTML = "";
        update();
        return;
    }
    if(query.length == 0) return;
    saveDecks = decks;
    pubDTitle.innerHTML = "Search Results:";
    let [success, data] = await DeckGateway.getall(0, query.split(" "), regex.checked, caseSensitive.checked, [], getSortFilter(), false, hasMc.checked, hasTxt.checked, hasRank.checked, hasMtch.checked);
    if(!success) return;
    decks = data;
    loaded = -1;
    pubDecks.innerHTML = "";
    await update();
});

window.addEventListener('mousedown', e => {
    if(e.target == previewDialog)
        previewDialog.close();
});