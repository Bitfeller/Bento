// Essential script for loading user data + initializing page (loads everywhere)
import { UserGateway } from "../../server/client-gateway/user-gateway.js";

(async () => {
    // Exit if header doesn't exist
    if(document.getElementById('header') == null) return;

    // Elements
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

    // Page data
    const uo = document.body.dataset.uo;
    const current_page = window.location.pathname;
    
    // Load previous pages
    const previous_pages = JSON.parse(localStorage.getItem("previous_pages")) || [];
    
    // Decode parser
    const parser = document.createElement('span');

    // Loader UI elements 
    const loader = document.getElementsByClassName("loader")[0];
    const tips = document.getElementsByClassName("tips")[0];
    

    // Load state vars
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

    // Tip text array
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

    // Transitions between current tip and the next tip
    // Supports changes in color.
    function tip_changer(newtext, color) {
        return new Promise((res, _) => {
            // Wrap current tip into prev-tip
            tips.innerHTML = `<p class='prev-tip'>${tips.innerHTML}</p>`;
            // Wait for prev-tip to transition out
            window.setTimeout(() => {
                // Set new color
                if(color) tips.style.color = color;
                
                // Add new-tip and transition in
                tips.innerHTML = `<p class='new-tip'>${newtext}</p>`;
                if(color) tips.getElementsByClassName('new-tip')[0].style.color = color;

                // Finished transition; remove residue and set to new current tip
                window.setTimeout(() => {
                    tips.innerHTML = newtext;
                    res(); // Resolve
                }, 500);
            }, 500);
        });
    }


    // Removes header elements only for logged-in users only
    function remove_uo_elements() {
        back.remove();
        logout.remove();
        pfp.remove();
        feedback.remove();
        feedback_dialog.remove();
    }

    // Remove back button if no previous_pages exist
    if (previous_pages.length === 0) back.remove();

    // LOADED: ran by a loading script when the script has finished loading
    window.LOADED = () => {
        if(load_failed) return;
        clearInterval(tipper);
        loader.remove();
    };
    // LOAD_ERROR: ran by a loading script when the script failed to load, due to some error or timeout
    window.LOAD_ERROR = err => {
        load_failed = true;
        clearInterval(tipper);
        tip_changer(err, "rgb(175, 100, 100)");
    };
    
    // Library for XSS encode/decode and other functionality
    window.lib = {};
    // Decode plain string
    window.lib.decode = str => {
        parser.innerHTML = str;
        return parser.textContent;
    };
    // Supports decoding various types
    window.lib.recur_decode = obj => {
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
    // Supports encoding various types
    // Accepts a loaded DOMParser and sanitizes the obj.
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

    // Set current tips element to a random tip and transition in. 
    tips.innerHTML = tipslist[Math.floor(Math.random() * (tipslist.length - 1) + 0.5)];
    let tip_fn = async () => await tip_changer(tipslist[Math.floor(Math.random() * (tipslist.length - 1) + 0.5)]);
    // Generate a new tip every 3 seconds
    let tipper = setInterval(tip_fn, 3000);

    // Fetch user data
    let [success, data] = await UserGateway.getuser(true, false, false, false);
    // If user is not logged in:
    if (!success && data == "no session") {
        remove_uo_elements();
        // If webpage requires login, kick user to login screen
        if(uo == "true") return void (window.location.href = "/login?s=" + window.location.pathname.slice(1));
    } else { // user is logged in
        // Update user's pfp
        if(data.pfp && data.pfp.length > 0) pfp.src = data.pfp;
        // Update verify_email alert
        if(data.verified == 0) {
            verify_email.style.display = "inline-block";
            verify_email.addEventListener('mousedown', () => verify_dialog.showModal());
        }
    }
    
    // Initialize service-worker for notifications if allowed
    if(Notification.permission == "granted" && data.notifsub != "0") {
        try {
            // Deprecated
            navigator.serviceWorker.register(location.origin + "/sitejs/client-modules/service-worker.js", {
                type: "module"
            });
        } catch(e) {
            console.log("serviceworker_err:", e);
        }
    }
    
    // If loading normally and header.js does not have to wait for any loading scripts:
    if(!loadingScripts) {
        if(document.readyState == "complete" && !load_failed) {
            // Load successful, remove tips and throbber
            clearInterval(tipper);
            loader.remove();
        } else {
            // Load failed, website kills itself
            window.addEventListener("load", () => {
                if(load_failed) return;
                clearInterval(tipper);
                loader.remove();
            })
        }
    }

    // Listeners for back button/previous_pages functionality
    window.addEventListener("beforeunload", async () => {
        // Add to array of visited pages before leaving current page and save
        previous_pages.push(current_page); // Add current page to array
        localStorage.setItem("previous_pages", JSON.stringify(previous_pages));
    });
    back.addEventListener("mousedown", async () => {
        // Set this to the most recently visited page 
        window.location.href = previous_pages[previous_pages.length - 1];
        // Remove current page from array and save it
        previous_pages.pop();
        previous_pages.pop();
        localStorage.setItem("previous_pages", JSON.stringify(previous_pages));
    });

    // Logout functionality
    logout.addEventListener("mousedown", async () => {
        // Signout user and send to login page
        await UserGateway.signout();
        window.location.href = "";
    });
    pfp.addEventListener("mousedown", () => {
        // Go to user profile
        window.location.href = "/user/profile";
    });
    feedback.addEventListener("mousedown", () => {
        // Display feedback dialog
        feedback_dialog.showModal();
    });
    feedback_submit.addEventListener("mousedown", async () => {
        // Submit feedback 
        let content = feedback_content.value;
        await UserGateway.giveFeedback(content);
        // Close feedback dialog
        feedback_dialog.close();
    });
    resend_email.addEventListener('mousedown', async () => {
        resend_success.innerHTML = "";
        // Attempt sending another verification email
        let [success, data] = await UserGateway.editUser('resend-verif-email', '');
        if(success) resend_success.innerHTML = "We sent you another verification email.";
        // If the user happens to be already verified, reload the page
        if(data == 'verified') location.reload();
    });
    window.addEventListener('mousedown', () => {
        // Closes popups when user presses outside of them
        if(e.target == verify_dialog) verify_dialog.close();
        if(e.target == feedback_dialog) feedback_dialog.close();
    });
})();