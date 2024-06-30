import { UserGateway } from "../server/client-gateway/user-gateway.js";
import { DeckGateway } from "../server/client-gateway/deck-gateway.js";

const deckReminders = document.getElementById("deck-reminders");
const notifText = document.getElementById("text");

(async () => {
    let [success, data] = await UserGateway.getuser();
    if(!success) return;
    deckReminders.innerHTML = "";
    let reviews = data.reviews;
    for(let i = 0; i < reviews.length; i++) {
        let [success, deck] = await DeckGateway.get(reviews[i].deckid);
        if(!success) continue;
        let count = 0;
        for(let j = 0; j < reviews[i].cards.length; j++) {
            let term = reviews[i].cards[j];
            if(UserGateway.calculateNTR(term.box, term.lastSeen)) count++;
        }
        count += deck.data.deckData.length - reviews[i].cards.length;
        if(count > 0) {
            deckReminders.innerHTML += `
                <div class="dr-deck">
                    <span class="dr-dname">${deck.name}</span><span class="dr-dterms">${count} terms</span>
                </div>
            `;
        }
    }
    let curr = parseInt(data.notifsub);
    if(Notification.permission == "denied") {
        curr = 0;
        if(data.notifsub != "0") {
            await UserGateway.editUser("notifsub", "0");
        }
        notifText.innerHTML = `<span class='material-symbols-outlined'>notifications_off</span>You've turned off notifications. Bento can't show you notifications unless you agree to them.</span>`;
        return;
    }
    notifText.innerHTML = `<span class='material-symbols-outlined'>${data.notifsub == "0" ? "notifications_off" : "notifications_active"}</span>${data.notifsub == "0" ? "Don't notify me to review." : (data.notifsub == "1" ? "Remind me everyday when I have to review." : (data.notifsub == "2" ? "Remind me every 3 days when I have to review." : "Remind me every week when I have to review."))}</span>`;
    notifText.addEventListener("mousedown", async () => {
        curr++;
        if(curr > 3) curr = 0;
        if(curr > 0 && Notification.permission !== "granted") {
            await Notification.requestPermission();
        }
        if(curr > 0 && Notification.permission == "denied") {
            curr = 0;
            notifText.innerHTML = `<span class='material-symbols-outlined'>notifications_off</span>You've turned off notifications. Bento can't show you notifications unless you agree to them.</span>`;
            return;
        }
        await UserGateway.editUser("notifsub", String(curr));
        notifText.innerHTML = `<span class='material-symbols-outlined'>${curr == "0" ? "notifications_off" : "notifications_active"}</span>${curr == "0" ? "Don't notify me to review." : (curr == "1" ? "Remind me everyday when I have to review." : (curr == "2" ? "Remind me every 3 days when I have to review." : "Remind me every week when I have to review."))}</span>`;
    });
})();