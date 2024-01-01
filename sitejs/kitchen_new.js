import { UserGateway } from "../server/client-gateway/user-gateway.js";
import { DeckGateway } from "../server/client-gateway/deck-gateway.js";

// User, decks
let user;
let loaded = -1;
let decks = {};

const sidebar = document.getElementsByClassName("sidebar")[0];

const deckContainer = document.getElementById("decks-container");
const ownedDecks = document.getElementsByClassName("owned-decks")[0];
const pubDTitle = document.getElementById("pub-d-title");
const pubDecks = document.getElementsByName("popular-decks")[0];

// ----------------- Image Query -----------------
let queries = [];
let handler;

async function query(id) {
    let q;
    if(handler) await handler;
    handler = await new Promise((res) => {
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
    b.style.backgroundImage = 'url("../../img/defaultdeckpic.png")';
    b.innerHTML = `
        <div>
            <h2 class='name'>.</h2>
            <div class='deck-bottom-row'>
                <p>by: <span class='username'>.</span></p>
                <div class='deck-tags'></div>
            </div>
        </div>
        <button class="preview-button">
            <div class="material-symbols-outlined">visibility</div>
        </button>
        <button class="add-button">
            <div class="material-symbols-outlined">add</div>
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
            b.getElementsByClassName('name')[0].style.color = 'var(--danger-red)';
            b.getElementsByClassName('name')[0].style.fontStyle = 'italic';
            b.getElementsByClassName('name')[0].innerHTML = "doesn't exist";
            b.getElementsByClassName('username')[0].parentNode.remove();
            b.style.backgroundImage = 'url("../../img/defaultdeckpic.png")';
            b.getElementsByClassName('preview-button')[0].remove();
            b.getElementsByClassName('add-button')[0].remove();
            return;
        }
        
        b.getElementsByClassName('name')[0].innerHTML = data.name;
        b.getElementsByClassName('username')[0].innerHTML = `<u>${data.owner}</u>`;
        b.style.backgroundImage = `url(${data.deckpic && data.deckpic.length > 0 ? data.deckpic : "../../img/defaultdeckpic.png"})`;
        if(data.data.tags) {
            for(let tag of data.data.tags)
                tags.innerHTML += `<div class='tag'><p>${tag}</p></div>`;
        }

        b.getElementsByClassName('preview-button')[0].addEventListener('click', e => preview(e.currentTarget));
        b.getElementsByClassName('add-button')[0].addEventListener('click', e => reviews_update(e.currentTarget));
    }
    _load();

    return b;
}
function removeBox(id) {
    let b = ownedDecks.querySelector(`.ingredient-box[data-id="${id}"]`);
    if(b) b.remove();
    b = pubDecks.querySelector(`.ingredient-box[data-id="${id}"]`);
    if(b) b.remove();
}

function update() {
    if(loaded >= decks.length - 1) return void (loaded = decks.length - 1);

    if(loaded == -1) {
        let keys = Object.keys(user.userdata.reviews);
        let update = false;
        for(let key of keys) {
            let id = parseInt(keys[i]);
        }
    }
}

ownedDecks.append(box(1, () => {}));
ownedDecks.append(box(7));
ownedDecks.append(box(7));
// ownedDecks.append(box(7, "Test Deck", "Test Author"));
window.LOADED();