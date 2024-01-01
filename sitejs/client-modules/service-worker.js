// bento-service-worker; works passively and shows notifications to the user when it's time to review
import { UserGateway } from "../../server/client-gateway/user-gateway.js";
import { DeckGateway } from "../../server/client-gateway/deck-gateway.js";

let user;
let elapsedDays = 0;
let sub;

async function init() {
    const regis = self.registration;
    let [success, _user] = await UserGateway.getuser();
    if(!success && _user == "no session") {
        await regis.unregister();
        return;
    }
    user = _user;
    // Check if the user has blocked notifications; if so, exit.
    if(Notification.permission != "granted") {
        await regis.unregister();
        return;
    }    
    regis.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: 'BK2goia_RGT26Nq5Blmc9yrejx_Cq4GpuWUcwZ9sn5DsaT8HfFqyql6Ss1D5K3T1W9Tow2JIVzigsVI4g-UyQBE'
    }).then(_sub => {
        sub = _sub;
        fetch("http://" + location.hostname + ":3000/notify", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                subscription: sub
            })
        }).catch(err => {
            console.error("failed to subscribe to push notifs; reason:", err);
        });
    })
}
self.addEventListener("activate", init);
self.addEventListener("push", async (e) => {
    const data = await e.data.json();
    const regis = self.registration;
    if(data.type == "reviewnotifcheck" && user) {
        // Check if the user has blocked notifications; if so, exit.
        if(Notification.permission != "granted") {
            sub.unsubscribe();
            fetch("http://" + location.hostname + ":3000/notify", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    unsubscribe: true
                })
            }).catch(err => {
                console.error("failed to unsubscribe to push notifs; reason:", err);
            });
            await regis.unregister();
            return;
        }
        // Update user's info
        let [success, _user] = await UserGateway.getuser();
        if(!success) return;
        user = _user;
        let deckcount = 0;
        let reviews = user.reviews;
        for(let i = 0; i < reviews.length; i++) {
            let [success, deck] = await DeckGateway.get(reviews[i].deckid);
            if(!success) continue;
            let count = 0;
            for(let j = 0; j < reviews[i].cards.length; j++) {
                let term = reviews[i].cards[j];
                if(UserGateway.calculateNTR(term.box, term.lastSeen)) count++;
            }
            count += deck.data.deckData.length - reviews[i].cards.length;
            if(count > 0) deckcount++;
        }
        elapsedDays += 1;
        if(deckcount == 0) return;
        switch(user.notifsub) {
            case "0":
                sub.unsubscribe();
                fetch("http://" + location.hostname + ":3000/notify", {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        unsubscribe: true
                    })
                }).catch(err => {
                    console.error("failed to unsubscribe to push notifs; reason:", err);
                });
                await regis.unregister();
                return;
            case "2":
                if(elapsedDays % 3 != 0) return;
            break;
            case "3":
                if(elapsedDays % 7 != 0) return;
            break;
        }
        const notif = regis.showNotification("Bento | Time to review.", {
            body: `You currently have ${deckcount} deck${deckcount == 1 ? "" : "s"} to review.`,
            tag: 'reviewnotif-' + Date.now()
        });
        notif.onclick = () => {
            open("https://bento.valleynas.uk/home");
        };
    }
});