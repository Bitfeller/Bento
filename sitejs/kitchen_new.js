import { UserGateway } from "../server/client-gateway/user-gateway.js";
import { DeckGateway } from "../server/client-gateway/deck-gateway.js";

// User, decks
let user;
let loaded = -1;

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


async function box(id, name, author) {
    let b = document.createElement('div');
    b.className = "ingredient-box";
    b.setAttribute("data-id", id);
    b.style.backgroundImage = "../../img/defaultdeckpic.png";
    b.innerHTML = `
        <div>
            <h2>${name}</h2>
            <div class='deck-bottom-row'>
                <p>by: <span class='username'><u>${author}</u></span></p>
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
    ownedDecks.appendChild(b);
    let tags = b.getElementsByClassName('deck-tags')[0];
    let data = await query(id);
    b.style.backgroundImage = `url(${data.deckpic && data.deckpic.length > 0 ? data.deckpic : "../../img/defaultdeckpic.png"})`;
    
    b.getElementsByClassName('preview-button')[0].addEventListener('click', e => preview(e.currentTarget));
    b.getElementsByClassName('add-button')[0].addEventListener('click', e => reviews_update(e.currentTarget));
    return b;
}

ownedDecks.innerHTML += "<br>";
box(7, "Test Deck", "Test Author");
box(7, "Test Deck", "Test Author");
box(7, "Test Deck", "Test Author");
box(7, "Test Deck", "Test Author");
window.LOADED();