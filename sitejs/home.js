import { UserGateway } from "../server/client-gateway/user-gateway.js";
import { DeckGateway } from "../server/client-gateway/deck-gateway.js";

const deckReminders = document.getElementById("deck-reminders");
const notifText = document.getElementById("text");
const tutorialDialog = document.getElementById("tutorial-background");
const tutorialBoxHolder = document.getElementById("tutorial-box-holder");
const t_dialogmain = tutorialBoxHolder.getElementsByClassName("dialog-main")[0];

const svgHolder = document.getElementsByClassName("bento-svg")[0];
const blankSvg = document.getElementById("blanksvg");
const leftSushi = document.getElementById("Leftest_Sushi");
const bottomSushi = document.getElementById("Bottom_Sushi");
const rightSushi = document.getElementById("Right_Sushi");

(async () => {
    let [success, data] = await UserGateway.getuser();
    if(!success) return;
    deckReminders.innerHTML = "";
    let reviews = data.userdata.reviews;
    let r_keys = Object.keys(reviews);
    for(let i = 0; i < r_keys.length; i++) {
        let [success, deck] = await DeckGateway.get(parseInt(r_keys[i]));
        if(!success) continue;
        let count = 0;
        let c_keys = Object.keys(reviews[r_keys[i]]);
        for(let j = 0; j < c_keys.length; j++) {
            let term = reviews[r_keys[i]][c_keys[j]];
            if(UserGateway.calculateNTR(term.box, term.last)) count++;
        }
        count += Object.keys(deck.data.contnt).length - c_keys.length;
        if(count > 0) {
            deckReminders.innerHTML += `
                <div class="dr-deck">
                    <span class="dr-dname">${deck.name}</span><span class="dr-dterms">${count}</div></span>
                </div>
            `;
        }
    }
    if(deckReminders.innerHTML == "") deckReminders.innerHTML = "<p class='info-blank'>-- There aren't any decks to review. --</p>";
    let curr = parseInt(data.notifsub);
    if(Notification.permission == "denied") {
        curr = 0;
        if(data.notifsub != "0") {
            await UserGateway.editUser("notifsub", "0");
        }
        notifText.innerHTML = `<span class='material-symbols-outlined'>notifications_off</span>You've turned off notifications. Bento can't show you notifications unless you agree to them.</span>`;
        return;
    }
    notifText.innerHTML = `<span class='material-symbols-outlined'>${data.notifsub == "0" ? "notifications_off" : "notifications_active"}</span>${data.notifsub == "0" ? "<p>Don't notify me to review.</p>" : (data.notifsub == "1" ? "<p>Remind me everyday when I have to review.</p>" : (data.notifsub == "2" ? "<p>Remind me every 3 days when I have to review.</p>" : "<p>Remind me every week when I have to review.</p>"))}</span>`;
    notifText.addEventListener("mousedown", async () => {
        curr++;
        if(curr > 3) curr = 0;
        if(curr > 0 && Notification.permission !== "granted") {
            await Notification.requestPermission();
            try {
                navigator.serviceWorker.register(location.origin + "/sitejs/client-modules/service-worker.js", {
                    type: "module"
                });
            } catch (e) {
                console.log("serviceworker_err:", e);
            }
        }
        if(curr > 0 && Notification.permission == "denied") {
            curr = 0;
            notifText.innerHTML = `<span class='material-symbols-outlined'>notifications_off</span>You've turned off notifications. Bento can't show you notifications unless you agree to them.</span>`;
            return;
        }
        await UserGateway.editUser("notifsub", String(curr));
        notifText.innerHTML = `<span class='material-symbols-outlined'>${curr == "0" ? "notifications_off" : "notifications_active"}</span>${curr == "0" ? "Don't notify me to review." : (curr == "1" ? "Remind me everyday when I have to review." : (curr == "2" ? "Remind me every 3 days when I have to review." : "Remind me every week when I have to review."))}</span>`;
    });
    const paramList = new URLSearchParams(window.location.search);
    if(paramList.get("new") == "1") {
        // replace URL so that user doesn't accidentally re-activate tutorial later
        history.replaceState(null, "", "home"); // /home?new=1  ==>  /home
        // tutorial feature
        tutorialDialog.style.display = "block";
        tutorialBoxHolder.style.display = "block";
        // function to make things easier
        function next(text, btns) {
            t_dialogmain.innerHTML = text;
            let keys = Object.keys(btns);
            for(let i = 0; i < keys.length; i++) {
                let btnname = keys[i];
                let list = t_dialogmain.getElementsByClassName(btnname);
                if(list.length > 0) {
                    let realbtn = list[0];
                    realbtn.addEventListener('mousedown', btns[keys[i]]);
                }
            }
        }
        // Create individual SVGs
        const leftsvg = blankSvg.cloneNode(true)
        const bottomsvg = blankSvg.cloneNode(true)
        const rightsvg = blankSvg.cloneNode(true)
        leftsvg.appendChild(leftSushi.cloneNode(true))
        bottomsvg.appendChild(bottomSushi.cloneNode(true))
        rightsvg.appendChild(rightSushi.cloneNode(true))
        leftsvg.style.zIndex = 9
        bottomsvg.style.zIndex = 9
        rightsvg.style.zIndex = 9
        blankSvg.style.zIndex = 10
        svgHolder.appendChild(leftsvg)
        svgHolder.appendChild(bottomsvg)
        svgHolder.appendChild(rightsvg)
        next(`
                <p>We're about to take you on the tutorial so that you can learn Bento better.</p>
                <p>However, if you'd like to, you can skip this tutorial.</p>
                <p><i>(You can always activate it again later in your profile's settings.)</i></p>
                <button class='continuebtn'>Continue</button>    
                <button class='skipbtn' style='background-color: rgb(255, 175, 175);'>Skip</button>
                `, {
            continuebtn: () => {
                next(`
                        <p>Right. Let's start by defining some terms:<br>\tA <b>deck</b> is a collection of <b>cards</b>, which are anything with a question and some answer.<br>\t<b>Cards</b> can be several types, including <b>input</b> cards (you type in the answer), <b>multiple choice</b> cards (with one correct and several wrong answers), and <b>ranking</b> cards (you rank the options). More types will come soon.</p>
                        <button class='continuebtn'>continue...</button>
                    `, {
                        continuebtn: () => {
                            next(`
                                    <p>Bento uses an advanced learning system called <b>Spaced repetition</b>, an algorithm that <b>shows you content</b> at <b>spaced times</b> so that your brain gets enough time to absorb it and understand it.</p>
                                    <p>Bento also uses other minor algorithms to help boost your learning.</p>
                                    <button class='continuebtn'>continue...</button>
                                `, {
                                    continuebtn: () => {
                                        document.getElementsByTagName("header")[0].style.zIndex = "initial";
                                        document.getElementById("header:pfp").className = "pfp right-header-ico lit-up";
                                        document.getElementById("header:logout").className = "header-nav material-symbols-outlined right-header-ico lit-up";
                                        next(`
                                                <p>You're currently on your home screen. Here, you can see, at the top right corner, two buttons: one leads to your profile settings, and the other signs you out.</p>
                                                <button class='continuebtn'>continue...</button>
                                            `, {
                                                continuebtn: () => {
                                                    document.getElementsByTagName("header")[0].style.zIndex = 10;
                                                    document.getElementById("header:pfp").className = "pfp right-header-ico";
                                                    document.getElementById("header:logout").className = "header-nav material-symbols-outlined right-header-ico";
                                                    rightsvg.setAttribute("class", "lit-up");
                                                    document.getElementById("tutorial").style.top = "70%";
                                                    document.getElementById("tutorial").style.animation = "move-tutorial-box-down 1s ease";
                                                    next(`
                                                            <p>Here, on your home screen, there are also three main buttons; one of these leads to the <b>Kitchen</b>, the community space where you can find decks made by the community with content you can learn. You'll go there to add decks to your <b>reviews</b>, which are the decks you'd like to learn.</p>
                                                            <p>There, you can also see the decks that are in your reviews and that you are actively learning, and <b>you can also see the decks that you made and be able to edit them.</b></p>
                                                            <button class='continuebtn'>continue...</button>
                                                        `, {
                                                            continuebtn: () => {
                                                                rightsvg.setAttribute("class", "");
                                                                leftsvg.setAttribute("class", "lit-up");
                                                                document.getElementsByClassName("deck-reminders-holder")[0].className = "deck-reminders-holder home-side-div lit-up";
                                                                next(`
                                                                        <p>On your home screen, there is also a <b>Review</b> button; this leads you to a learning mode where you get to actually learn the decks you've put in your reviews. Here, you can edit your settings, such as how quickly you'd like to go through them and how the content should be shown to you. <b>You can also select specific decks and the decks that you need to review.</b></p>
                                                                        <p>Whenever you have something to review, you'll see it on the right side of your home screen. You can then click on "Review", select that you'd only like to review the decks you have to review, and then complete those decks accordingly.</p>
                                                                        <button class='continuebtn'>continue...</button>                                                                    
                                                                    `, {
                                                                        continuebtn: () => {
                                                                            leftsvg.setAttribute("class", "");
                                                                            document.getElementsByClassName("deck-reminders-holder")[0].className = "deck-reminders-holder home-side-div";
                                                                            bottomsvg.setAttribute("class", "lit-up");
                                                                            document.getElementById("tutorial").style.top = "20%";
                                                                            document.getElementById("tutorial").style.animation = "move-tutorial-box-up 1s ease";
                                                                            next(`
                                                                                    <p>Finally, you have the <b>Cook</b> button; there, you can make your own decks with your own content or import a deck from <b>Quizlet</b> or <b>Bento</b>.</p>
                                                                                    <button class='continuebtn'>continue...</button>
                                                                                `, {
                                                                                    continuebtn: () => {
                                                                                        bottomsvg.setAttribute("class", "");
                                                                                        document.getElementsByClassName("notifications-holder")[0].className = "notifications-holder home-side-div lit-up";
                                                                                        next(`
                                                                                                <p>Here, on the right side of your home screen, and under your decks to review, you can see a little section where you can toggle if you'd like notifications when you need to review.</p>
                                                                                                <button class='continuebtn'>continue...</button>
                                                                                            `, {
                                                                                                continuebtn: () => {
                                                                                                    document.getElementsByClassName("notifications-holder")[0].className = "notifications-holder home-side-div";
                                                                                                    document.getElementById("tutorial").style.top = "50%";
                                                                                                    document.getElementById("tutorial").style.animation = "move-tutorial-box-init 1s ease";
                                                                                                    next(`
                                                                                                            <p>That's it! Have fun learning!</p>
                                                                                                            <button class='continuebtn'>Close</button>
                                                                                                        `, {
                                                                                                            continuebtn: () => {
                                                                                                                tutorialDialog.style.display = "none";
                                                                                                                tutorialBoxHolder.style.display = "none";
                                                                                                                leftsvg.remove()
                                                                                                                rightsvg.remove()
                                                                                                                bottomsvg.remove()
                                                                                                                blankSvg.style.zIndex = "initial";
                                                                                                            }
                                                                                                        })
                                                                                                }
                                                                                            }
                                                                                        )
                                                                                    }
                                                                                })
                                                                        }
                                                                    })
                                                            }
                                                        })
                                                }
                                            })
                                    }
                                })
                        }
                    })
            },
            skipbtn: () => {
                tutorialDialog.style.display = "none";
                tutorialBoxHolder.style.display = "none";
                leftsvg.remove()
                rightsvg.remove()
                bottomsvg.remove()
                blankSvg.style.zIndex = "initial";
            }
        })
    }
})();
