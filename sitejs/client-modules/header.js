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
    const verify_email = document.getElementById('header:verify-email-alert');
    const verify_dialog = document.getElementById('header:verify_email');
    const resend_email = document.getElementById('header:resend_verif_email');
    const resend_success = document.getElementById('header:resend_success');

    const uo = document.body.dataset.uo;

    const parser = document.createElement('span');

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
        "Found a bug? Let us know!",
        "You can find your profile in the top right corner.",
        "Started making a deck but didn't finish? Bento auto-saves your drafts, and you can find them on the right when cooking."
    ];

    function tip_changer(newtext, color) {
        return new Promise((res, _) => {
            tips.innerHTML = `<p class='prev-tip'>${tips.innerHTML}</p>`;
            window.setTimeout(() => {
                if(color) tips.style.color = color;
                tips.innerHTML = `<p class='new-tip'>${newtext}</p>`;
                if(color) tips.getElementsByClassName('new-tip')[0].style.color = color;
                window.setTimeout(() => {
                    tips.innerHTML = newtext;
                    res();
                }, 500);
            }, 500);
        });
    }

    window.LOADED = () => {
        if(load_failed) return;
        clearInterval(tipper);
        loader.remove();
    };
    window.LOAD_ERROR = (err) => {
        load_failed = true;
        clearInterval(tipper);
        tip_changer(err, "rgb(175, 100, 100)");
    };
    window.lib = {};
    window.lib.decode = (str) => {
        parser.innerHTML = str;
        return parser.textContent;
    };
    window.lib.recur_decode = (obj) => {
        if(typeof obj == "string")
            return window.lib.decode(obj);
        else if(Array.isArray(obj))
            return obj.map(window.lib.recur_decode);
        else if(typeof obj == "object" && obj != null)
            return Object.fromEntries(Object.entries(obj).map(([k, v]) => [window.lib.recur_decode(k), window.lib.recur_decode(v)]));
        else if(typeof obj == "number" || typeof obj == "boolean" || typeof obj == "bigint" || typeof obj == "undefined" || obj == null)
            return obj;
        else console.error('header.js: could not decode obj of following:', typeof obj);
    };
    window.lib.dpwrapper = (dp, obj) => {
        if(typeof obj == "string")
            return dp.sanitize(obj);
        else if(Array.isArray(obj))
            return obj.map(val => dp.sanitize(val));
        else if(typeof obj == "object" && obj != null)
            return Object.fromEntries(Object.entries(obj).map(([k, v]) => [dp.sanitize(k), dp.sanitize(v)]));
        else console.error('header.js: could not sanitize obj of following:', typeof obj);
    }

    tips.innerHTML = tipslist[Math.floor(Math.random() * (tipslist.length - 1) + 0.5)];
    let tip_fn = async () => await tip_changer(tipslist[Math.floor(Math.random() * (tipslist.length - 1) + 0.5)]);
    let tipper = setInterval(tip_fn, 3000);

    let [success, data] = await UserGateway.getuser(true, false, false, false);
    if(!success && data == "no session") {
        logout.remove();
        pfp.remove();
        feedback.remove();
        feedback_dialog.remove();
        if(uo == "true") return void (window.location.href = "/login?s=" + window.location.pathname.slice(1));
    } else {
        // update pfp
        if(data.pfp && data.pfp.length > 0) pfp.src = data.pfp;
        // update verify_email_alert
        if(data.verified == 0) {
            verify_email.style.display = "inline-block";
            verify_email.addEventListener('mousedown', () => verify_dialog.showModal());
        }
    }
    // Initialize service-worker for notifications if allowed
    if(Notification.permission == "granted" && data.notifsub != "0") {
        try {
            navigator.serviceWorker.register(location.origin + "/sitejs/client-modules/service-worker.js", {
                type: "module"
            });
        } catch(e) {
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
    resend_email.addEventListener('mousedown', async () => {
        resend_success.innerHTML = "";
        let [success, data] = await UserGateway.editUser('resend-verif-email', '');
        if(success) resend_success.innerHTML = "We sent you another verification email.";
        if(data == 'verified') location.reload();
    });
    window.addEventListener('mousedown', (e) => {
        if(e.target == verify_dialog) verify_dialog.close();
    });
})();