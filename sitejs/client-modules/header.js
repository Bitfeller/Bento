// Essential script for loading user data + initializing page
import { UserGateway } from "../../server/client-gateway/user-gateway.js";

const icons = document.getElementsByClassName("right-header-ico");
const logout = document.getElementById("header:logout");
const pfp = document.getElementById("header:pfp");
const uo = document.body.dataset.uo;
/*const hover = document.createElement("div");
hover.style = "background-color: rgb(150, 150, 150); position: absolute; width: auto; padding: 7px; height: auto;";*/

const loader = document.getElementsByClassName("loader")[0];
const tips = document.getElementsByClassName("tips")[0];

const tipslist = [
    "When making ranking questions, you can drag answers...",
    "If you own a Bento deck, you can export it when viewing it in the Kitchen...",
    "Have feedback? Let us know!",
    "You can edit the decks you own in the Kitchen.",
    "Decks can be deleted by going to the Kitchen.",
    "You can find the decks you've made in the Kitchen.",
    "You can enable notifications on the home screen, and you'll get notified when you have to review.",
    "You can import sets from Quizlet into Bento when making a deck.",
    "This won't take long to load.",
    "Taking too long to load? Consider letting us know.",
    "Found a bug? Let us know!"
];

function tip_changer(newtext) {
    return new Promise((res, rej) => {
        tips.innerHTML = `<p class='prev-tip'>${tips.innerHTML}</p>`;
        window.setTimeout(() => {
            tips.innerHTML = `<p class='new-tip'>${newtext}</p>`;
            window.setTimeout(() => {
                tips.innerHTML = newtext;
                res();
            }, 500);
        }, 500);
    });
}

(async () => {
    let [success, data] = await UserGateway.getuser();
    if(!success && data == "no session") {
        logout.remove();
        pfp.remove();
        if(uo == "true") {
            window.location.href = "/login?s=" + window.location.pathname.slice(1);
            return;
        }
    } else {
        // update pfp
        if(data.pfp && data.pfp.length > 0) {
            pfp.src = data.pfp;
        }
    }
    // loader.remove();
    // Initialize service-worker for notifications if allowed
    if(Notification.permission == "granted" && data.notifsub != "0") {
        try {
            navigator.serviceWorker.register(location.origin + "/sitejs/client-modules/service-worker.js", {
                type: "module"
            });
        } catch (e) {
            console.log("serviceworker_err:", e);
        }
    }
    tips.innerHTML = tipslist[Math.floor(Math.random() * (tipslist.length - 1) + 0.5)];
    let tipper = setInterval(async () => {
        await tip_changer(tipslist[Math.floor(Math.random() * (tipslist.length - 1) + 0.5)])
    }, 5000);
    if(document.readyState == "complete") {
        clearInterval(tipper);
        loader.remove();
        return;
    }
    window.addEventListener("load", () => {
        clearInterval(tipper);
        loader.remove();
    })
})();


/*for(let i = 0; i < icons.length; i++) {
    icons[i].addEventListener("mouseover", () => {
        let ico = icons[i];
        let rect = ico.getBoundingClientRect();
        let [x, y] = [(rect.left + rect.right) / 2 + scrollX, (rect.top + rect.bottom) / 2 + scrollY];
    });
}*/

logout.addEventListener("mousedown", async () => {
    await UserGateway.signout();
    window.location.href = "";
});
pfp.addEventListener("mousedown", () => {
    window.location.href = "/user/profile";
});