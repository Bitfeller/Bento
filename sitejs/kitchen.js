import { UserGateway } from "../server/client-gateway/user-gateway.js";
import { DeckGateway } from "../server/client-gateway/deck-gateway.js";

// User, decks
let user;
let loaded = -1, loadedReviews = false;
let decks = [];

let allowedTags = [];
let reviewsTags = {};

// Elements
const filteredTags = document.getElementsByClassName('filtered-tags')[0];
const predefinedTags = document.getElementsByClassName('predefined-tags')[0];
const tagSearch = document.getElementById('tagSearch');
const tagSuggestions = document.getElementById('tag-suggestions');

const checkboxBoxes = document.getElementsByClassName('checkbox-box');
const searchBar = document.getElementById('searchBar');
const regex = document.getElementsByName('regex')[0];
const caseSensitive = document.getElementsByName('case-sensitive')[0];
const sortOptions = document.getElementById('sortOptions');

const strictSlider = document.getElementById('strictMatchingSlider');
const hasMc = document.getElementById('mcCheckbox');
const hasTxt = document.getElementById('textCheckbox');
const hasRank = document.getElementById('rankCheckbox');
const hasMtch = document.getElementById('matchingCheckbox');

const ownedDecks = document.getElementsByClassName("owned-decks")[0];
const pubDTitle = document.getElementById("pub-d-title");
const pubDecks = document.getElementsByClassName("popular-decks")[0];
const previewDialog = document.getElementById("preview-dialog");

const loadMore = document.getElementById("loadMore");

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

// ----------------- Typeset + Tags -----------------
async function typeset(node) {
    if(Object.keys(MathJax.startup) == 0)
        await new Promise((res) => {
            MathJax.startup.ready = res;
        });
    MathJax.startup.promise = MathJax.startup.promise.then(() => MathJax.typesetPromise([node])).catch(e => console.warn("math formatting failed; reason:", e.message));
    return MathJax.startup.promise;
}
function tag_exists(tag) {
    return Array(...document.querySelectorAll('.remove-tag .tag-value')).map(x => x.textContent).filter(x => x == tag).length > 0;
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
                <p style='text-wrap: nowrap;'>by: <span class='username'>.</span></p>
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

        // Update reviews tags
        if(user.userdata.reviews[id] && data.data.tags) {
            for(let tag of data.data.tags)
                reviewsTags[tag] = (reviewsTags[tag] ?? 0) + 1;
        }
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
                <p style='text-wrap: nowrap;'>by: <span class='username'><u>${deck.owner}</u></span>${deck.public == 0 ? `<span class='private-deck>private</span>` : ''}</p>
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
                tags: window.lib.decode(deck.tags ?? []),
                contnt: window.lib.recur_decode(deck.data.contnt)
            };
            const json = JSON.stringify(deckExport);
            const file = new File([json], deckExport.name+'.json', { type: 'text/plain' });
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
    let id = parseInt(_this.dataset.id);
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
        case "new-time": return 1;
        case "old-time": return 2;
        case "alphabet": return 3;
        case "reverse-alphabet": return 4;
    }
}
async function fetchDecks(start = 0) {
    let query = searchBar.value.trim();
    let sort = getSortFilter();

    let [success, data] = await DeckGateway.getall(
        start,
        query.length != '' ? query.split(" ") : [],
        regex.checked,
        caseSensitive.checked,
        Array(...document.querySelectorAll('.remove-tag .tag-value')).map(x => x.textContent),
        sort,
        strictSlider.children[0].style.right == "" ? true : false,
        hasMc.checked,
        hasTxt.checked,
        hasRank.checked,
        hasMtch.checked
    );
    
    if(!success) return;

    if(start > 0) {
        decks.push(...data);
    } else {
        decks = data;
        loaded = -1;
        pubDecks.innerHTML = "";
    }

    await update();
}

// Color map
const map = [
    [20, [255, 191, 0]],    // Amber
    [100, [255, 0, 127]],   // Pink
    [60, [0, 127, 255]],    // Azure
    [0, [255, 0, 0]],       // Red
    [70, [0, 0, 255]],      // Blue
    [90, [255, 0, 255]],    // Magenta
    [40, [50, 205, 50]],    // Light Green
    [30, [0, 255, 0]],      // Green
    [10, [255, 127, 0]],    // Orange
    [80, [127, 0, 255]],    // Violet
    [50, [0, 255, 255]]     // Cyan
]
// A pure function that generates a color based on a name
function generateTagColor(n) {
    let bc = map.filter((c) => parseInt(n.charCodeAt(n.length - 1) / 10) % 10 * 10 == c[0])[0][1];
    const fh = map.filter((c) => 
        parseInt((n.substring(1)
            .substring(0, Math.floor(n.substring(1).length / 2))
            .split('')
            .reduce((a, c) => a + c.charCodeAt(0), 0) / n.substring(1)
            .substring(0, Math.floor(n.substring(1).length / 2)).length) / 10)
        % 10 * 10 == c[0])[0][1];
    const sh = map.filter((c) => 
        parseInt((n.substring(1)
            .substring(Math.floor(n.substring(1).length / 2))
            .split('')
            .reduce((a, c) => a + c.charCodeAt(0), 0) / n.substring(1)
            .substring(0, Math.floor(n.substring(1).length / 2)).length) / 10)
        % 10 * 10 == c[0])[0][1];
    return `rgb(${
        bc.map((c, i) => {
            let value = c + parseInt(fh[i] / 25) + parseInt(sh[i] / 25);
            while (value > 255) 
                Math.abs(n - 0) < Math.abs(n - 255) ? 
                    value = 255 : 
                    Math.abs(n - 255) < Math.abs(n - 0) ? value -= 255 : value = 255;
            return parseInt(value * 0.65);
        }).join(', ')
    })`;
}

async function appendTag(tag) {
    let tagDiv = document.createElement('div');
    tagDiv.className = 'tag remove-tag';
    tagDiv.innerHTML = `
        <div class='material-symbols-outlined'>remove</div>
        <p class='tag-value'>${tag}</p>
    `;
    tagDiv.style.backgroundColor = generateTagColor(tag);
    tagDiv.onclick = async () => {
        tagDiv.remove();
        await fetchDecks();
    };
    filteredTags.appendChild(tagDiv);

    let query = searchBar.value;
    if(query.length == 0)
        pubDTitle.innerHTML = "Public Decks:";
    await fetchDecks();
}

async function populateRecommended() {
    // Select top 3 from tags in the user's reviews
    const topTags = Object.keys(reviewsTags)
        .sort((a, b) => reviewsTags[b] - reviewsTags[a])
        .slice(0, 3);

    if(topTags.length < 3) {
        const tagCounts = {};
    
        for (const deck of decks) {
            if (deck.data && deck.data.tags) {
                for (const tag of deck.data.tags) {
                    tagCounts[tag] = (tagCounts[tag] || 0) + 1;
                }
            }
        }

        const bestTags = Object.keys(tagCounts)
            .sort((a, b) => tagCounts[b] - tagCounts[a])
            .slice(0, 3 - topTags.length);
        topTags.push(...bestTags);
    }
    // If no tags were found in decks, use 3 random tags from allowed tags
    if (topTags.length < 3 && allowedTags.length > 0) {
        const shuffled = [...allowedTags].sort(() => 0.5 - Math.random());
        topTags.push(...shuffled.slice(0, 3 - topTags.length));
    }
    
    // Add each top tag to the filteredTags container
    for (const tag of topTags) {
        // Skip if the tag is already in the filtered tags
        if (tag_exists(tag)) continue;
        
        let tagDiv = document.createElement('div');
        tagDiv.className = 'tag add-tag';
        tagDiv.innerHTML = `
            <div class='material-symbols-outlined'>add</div>
            <p class='tag-value'>${tag}</p>
        `;
        tagDiv.style.backgroundColor = generateTagColor(tag);
        tagDiv.onclick = async () => {
            tagDiv.remove();
            await appendTag(tag);
        };
        predefinedTags.appendChild(tagDiv);
    }
    
    // Refresh the deck list with these tags
    await fetchDecks();
}

(async () => {
    let [success, data] = await UserGateway.getuser(false, true, true, false);

    if(!success && data == 'no session') return window.LOAD_ERROR("Please sign in.");
    if(!success) return window.LOAD_ERROR("Failed to fetch your user data.");

    user = data;

    allowedTags = await DeckGateway.getAllowedTags();
    allowedTags.map(x => tagSuggestions.innerHTML += `<option value='${x}'>`);
    
    [success, data] = await DeckGateway.getall(0);
    if(!success) return;
    if(data.length == 0) return window.LOAD_ERROR("There aren't any decks...? Odd.");

    // Set strict slider
    strictSlider.children[0].style.right = "0";

    decks.push(...data);
    await update();

    window.LOADED();
    populateRecommended();
})();

searchBar.addEventListener('keyup', async e => {
    if(e.key != 'Enter') return;
    let query = searchBar.value;
    // Reset to defaults
    if(query.length == 0)
        pubDTitle.innerHTML = "Public Decks:";
    await fetchDecks();
});
tagSearch.addEventListener('keydown', async e => {
    let value = tagSearch.value.trim();
    if(e.key == 'Enter' && value != '' && allowedTags.indexOf(value) > -1) {
        e.preventDefault();

        if(tag_exists(value)) return;
        await appendTag(value);
        
        tagSearch.value = '';
        tagSearch.focus();
        tagSearch.style.color = "var(--light-text)";
    }
});
tagSearch.addEventListener('input', () => {
    let value = tagSearch.value.trim();
    if(value != '') {
        if(tag_exists(value)) {
            tagSearch.style.color = "var(--danger-red)";
        } else if(allowedTags.indexOf(value) > -1) {
            tagSearch.style.color = "#2a72dc";
        } else {
            tagSearch.style.color = "var(--danger-red)";
        }
    }
});

strictSlider.addEventListener('click', async () => {
    if(strictSlider.children[0].style.right == "")
        strictSlider.children[0].style.right = "0";
    else
        strictSlider.children[0].style.right = "";

    await fetchDecks();
});

for(let i = 0; i < checkboxBoxes.length; i++) {
    let box = checkboxBoxes[i];
    let checkbox = box.querySelectorAll('input[type="checkbox"]')[0];
    box.addEventListener("mousedown", async e => {
        e.preventDefault();
        e.stopPropagation();
        if (e.target != checkbox) 
            checkbox.checked = !checkbox.checked;
        
        await fetchDecks();
    });
}

[regex, caseSensitive, hasMc, hasTxt, hasRank, hasMtch, sortOptions].map(x => x.addEventListener('change', async () => {
    let query = searchBar.value;
    if(query.length == 0)
        pubDTitle.innerHTML = "Public Decks:";
    await fetchDecks();
}));

loadMore.addEventListener('click', async () => {
    let added = await fetchDecks(loaded + 1);
    if(added == 0) {
        loadMore.innerHTML = "No more decks to load.";
        loadMore.style.pointerEvents = "none";
        loadMore.style.opacity = "0.5";
    }
});

window.addEventListener('mousedown', e => {
    if(e.target == previewDialog)
        previewDialog.close();
});