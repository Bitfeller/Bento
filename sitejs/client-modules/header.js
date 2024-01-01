// Essential script for loading user data + initializing page
import { UserGateway } from "../../server/client-gateway/user-gateway.js";

(async () => {
    if(document.getElementById('header') == null) return;

    const logout = document.getElementById("header:logout");
    const pfp = document.getElementById("header:pfp");
    const feedback = document.getElementById("header:feedback");
    const feedback_dialog = document.getElementById("header:feedback_dialog");
    const feedback_content = document.getElementById("header:feedback_content");
    const feedback_submit = document.getElementById("header:feedback_submit");
    const version = document.getElementById('header:version');
    const version_info = document.getElementById('header:version_info')
    const uo = document.body.dataset.uo;

    const loader = document.getElementsByClassName("loader")[0];
    const tips = document.getElementsByClassName("tips")[0];
    
    let load_failed = false;

    let loadingScripts = false;
    // Search for loading scripts
    const scripts = document.getElementsByTagName('script');
    for(let i = 0; i < scripts.length; i++) {
        if(scripts[i].dataset.loading == "true") {
            loadingScripts = true;
            break;
        }
    }

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

    function tip_changer(newtext, color) {
        return new Promise((res, rej) => {
            tips.innerHTML = `<p class='prev-tip'>${tips.innerHTML}</p>`;
            window.setTimeout(() => {
                if(color) tips.style.color = color;
                tips.innerHTML = `<p class='new-tip'>${newtext}</p>`;
                if(color) tips.getElementsByClassName('new-tip')[0].style.color = color;
                window.setTimeout(() => {
                    tips.innerHTML = newtext;
                    if(color) {}
                    res();
                }, 500);
            }, 500);
        });
    }

    window.LOADED = () => {
        clearInterval(tipper);
        loader.remove();
    };
    window.LOAD_ERROR = (err) => {
        load_failed = true;
        clearInterval(tipper);
        tip_changer(err, "rgb(175, 100, 100)");
    };

    tips.innerHTML = tipslist[Math.floor(Math.random() * (tipslist.length - 1) + 0.5)];
    let tipper = setInterval(async () => await tip_changer(tipslist[Math.floor(Math.random() * (tipslist.length - 1) + 0.5)]), 5000);

    let [success, data] = await UserGateway.getuser();
    if(!success && data == "no session") {
        logout.remove();
        pfp.remove();
        feedback.remove();
        feedback_dialog.remove();
        if(uo == "true") {
            window.location.href = "/login?s=" + window.location.pathname.slice(1);
            return;
        }
    } else {
        // update pfp
        if(data.pfp && data.pfp.length > 0) {
            pfp.src = data.pfp;
        }
        // Load theme
        let theme = data.userdata.theme;
        // Reference:
        // 0 = Nord
        // 1 = Coffee-Midnight
        // 2 - Catppuccin
        // 3 - Classic
        // We don't check for Nord as it's already loaded in global.css; we simply load overrides if we need to for other themes
        switch(theme) {
            case 1:
                document.head.innerHTML += `<link rel='stylesheet' href='../css/themes/coffee-midnight.css'>`;
            break;
            case 2:
                document.head.innerHTML += `<link rel='stylesheet' href='../css/themes/catppuccin.css'>`;
            break;
            case 3:
                document.head.innerHTML += `<link rel='stylesheet' href='../css/themes/classic.css'>`;
            break;
        }
    }
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
    
    if(!loadingScripts) {
        if(document.readyState == "complete" && !load_failed) {
            clearInterval(tipper);
            loader.remove();
        } else {
            window.addEventListener("load", () => {
                if(load_failed) return;
                clearInterval(tipper);
                loader.remove();
            })
        }
    }

    logout.addEventListener("mousedown", async () => {
        await UserGateway.signout();
        window.location.href = "";
    });
    pfp.addEventListener("mousedown", () => {
        window.location.href = "/user/profile";
    });
    feedback.addEventListener("mousedown", () => {
        feedback_dialog.showModal();
    });
    feedback_submit.addEventListener("mousedown", async () => {
        let content = feedback_content.value;
        await UserGateway.giveFeedback(content);
        feedback_dialog.close();
    });
    version.addEventListener('mousedown', () => {
        version_info.showModal();
    });
    window.addEventListener('mousedown', (e) => {
        if(e.target == feedback_dialog || e.target == version_info) {
            feedback_dialog.close();
            version_info.close()
        }
    });
})();