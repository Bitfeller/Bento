// Essential script for loading user data + initializing page (loads everywhere)
import { UserGateway } from "../../server/client-gateway/user-gateway.js";

(async () => {
    // return if no header
    if (document.getElementById('header') == null) return;

    // get all the elements
    const back = document.getElementById("header:back");
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

    // page data
    const uo = document.body.dataset.uo;
    const current_page = window.location.pathname;

    const parser = document.createElement('span');

    // ui elements for loading state 
    const loader = document.getElementsByClassName("loader")[0];
    const tips = document.getElementsByClassName("tips")[0];
    
    const previous_pages = JSON.parse(localStorage.getItem("previous_pages")) || [];

    // loading variables
    let load_failed = false;

    let loadingScripts = false;
    // Search for loading scripts
    const scripts = document.getElementsByTagName('script');
    for (let i = 0; i < scripts.length; i++) {
        if (scripts[i].dataset.loading == "true") {
            loadingScripts = true;
            break;
        }
    }

    // array of tip texts
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

    // transition between tips
    function tip_changer(newtext, color, transition_time = 500) {
        return new Promise((res, _) => {
            // sets current text to prev text
            tips.innerHTML = `<p class='prev-tip'>${tips.innerHTML}</p>`;
            window.setTimeout(() => {
                // set old tip colour
                if (color) tips.style.color = color;
                // start transition
                tips.innerHTML = `<p class='new-tip'>${newtext}</p>`;
                // set new tip colour 
                if (color) tips.getElementsByClassName('new-tip')[0].style.color = color;
                // overwrite residue
                window.setTimeout(() => {
                    tips.innerHTML = newtext;
                    res();
                }, transition_time);
            }, transition_time);
        });
    }


    // remove all elements from header
    function remove_header() {
        back.remove();
        logout.remove();
        pfp.remove();
        feedback.remove();
        feedback_dialog.remove();
    }

    // no back button if no previous pages
    if (previous_pages.length === 0) back.remove();

    // update window when loaded
    window.LOADED = () => {
        if(load_failed) return;
        clearInterval(tipper);
        loader.remove();
    };

    // handle loading error
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
            return obj.map(val => window.lib.dpwrapper(dp, val));
        else if(typeof obj == "object" && obj != null)
            return Object.fromEntries(Object.entries(obj).map(([k, v]) => [window.lib.dpwrapper(dp, k), window.lib.dpwrapper(dp, v)]));
        else if(typeof obj == "number" || typeof obj == "boolean" || typeof obj == "bigint" || typeof obj == "undefined" || obj == null)
            return obj;
        else console.error('header.js: could not sanitize obj of following:', typeof obj);
    }

    // displays random tip under the throbber
    tips.innerHTML = tipslist[Math.floor(Math.random() * (tipslist.length - 1) + 0.5)];
    let tip_fn = async () => await tip_changer(tipslist[Math.floor(Math.random() * (tipslist.length - 1) + 0.5)]);
    // new tip every 3 seconds
    let tipper = setInterval(tip_fn, 3000);

    // get pfp and user data
    let [success, data] = await UserGateway.getuser(true, false, false, false);
    // if user is not logged in:
    if (!success && data == "no session") {
        remove_header();
        // if webpage requires login, kick user to login screen
        if (uo == "true") return void (window.location.href = "/login?s=" + window.location.pathname.slice(1));
    } else { // user is logged in
        // update pfp
        if(data.pfp && data.pfp.length > 0) pfp.src = data.pfp;
        // update verify_email_alert
        if(data.verified == 0) {
            verify_email.style.display = "inline-block";
            verify_email.addEventListener('mousedown', () => verify_dialog.showModal());
        }
    }
    // Initialize service-worker for notifications if allowed
    if (Notification.permission == "granted" && data.notifsub != "0") {
        try {
            // half broken notification thing (basically deprecated)
            navigator.serviceWorker.register(location.origin + "/sitejs/client-modules/service-worker.js", {
                type: "module"
            });
        } catch(e) {
            console.log("serviceworker_err:", e);
        }
    }
    
    // page load handler when scripts finish loading
    if (!loadingScripts) {
        if (document.readyState == "complete" && !load_failed) {
            // load successful, remove tips and throbber
            clearInterval(tipper);
            loader.remove();
        } else {
            // load failed, website kills itself
            window.addEventListener("load", () => {
                if(load_failed) return;
                clearInterval(tipper);
                loader.remove();
            })
        }
    }

    // listeners for events on pages
    window.addEventListener("beforeunload", async () => {
        // Add to array of visited pages before leaving current page and save
        previous_pages.push(current_page);  // add current page to array
        localStorage.setItem("previous_pages", JSON.stringify(previous_pages));
    });
    back.addEventListener("mousedown", async () => {
        // set this to the most recently visited page 
        window.location.href = previous_pages[previous_pages.length - 1];
        // remove current page from array and save it
        previous_pages.pop();
        previous_pages.pop();
        localStorage.setItem("previous_pages", JSON.stringify(previous_pages));
    });
    logout.addEventListener("mousedown", async () => {
        // listen to logout event
        await UserGateway.signout();
        window.location.href = "";
    });
    pfp.addEventListener("mousedown", () => {
        // go to user profile
        window.location.href = "/user/profile";
    });
    feedback.addEventListener("mousedown", () => {
        // display feedback dialog
        feedback_dialog.showModal();
    });
    feedback_submit.addEventListener("mousedown", async () => {
        // submit feedback 
        let content = feedback_content.value;
        await UserGateway.giveFeedback(content);
        // remove feedback dialog
        feedback_dialog.close();
    });
    resend_email.addEventListener('mousedown', async () => {
        resend_success.innerHTML = "";
        // attempt sending another verification email
        let [success, data] = await UserGateway.editUser('resend-verif-email', '');
        if (success) resend_success.innerHTML = "We sent you another verification email.";
        if (data == 'verified') location.reload();
    });
    window.addEventListener('mousedown', (e) => {
        // click outside of popup: close the popup
        if (e.target == verify_dialog) verify_dialog.close();
        if (e.target == feedback_dialog) feedback_dialog.close();
    });
})();