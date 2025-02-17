// bento-service-worker; works passively and shows notifications to the user when it's time to review
import { UserGateway } from "../../server/client-gateway/user-gateway.js";

let sub;
let rand_identifier;

async function init() {
    const regis = self.registration;
    let [success, _user] = await UserGateway.getuser(false, false, false, false);
    if(!success && _user == "no session") {
        await regis.unregister();
        return;
    }
    // // Check if the user has blocked notifications; if so, exit.
    // if(Notification.permission != "granted") {
    //     await regis.unregister();
    //     return;
    // }    
    // regis.pushManager.subscribe({
    //     userVisibleOnly: true,
    //     applicationServerKey: 'BK2goia_RGT26Nq5Blmc9yrejx_Cq4GpuWUcwZ9sn5DsaT8HfFqyql6Ss1D5K3T1W9Tow2JIVzigsVI4g-UyQBE'
    // }).then(_sub => {
    //     sub = _sub;
    //     rand_identifier = Math.floor(Math.random() * 1000000 + 0.5);
    //     fetch("https://bentoapi.valleynas.uk:443/notify", {
    //         method: 'POST',
    //         headers: {
    //             'Content-Type': 'application/json'
    //         },
    //         body: JSON.stringify({
    //             subscription: sub,
    //             rand_identifier
    //         })
    //     }).catch(async e => {
    //         console.error("failed to subscribe to push notifs; reason:", e);
    //         await regis.unregister();
    //     });
    // })

    const notif = regis.showNotification("Bento | Time to review.", {
        body: `You currently have ${13} deck${"s"} to review.`,
        tag: 'reviewnotif-' + Date.now()
    });
    notif.onclick = () => open("https://bento-api.uk/home");
}
self.addEventListener("activate", init);
self.addEventListener("push", async e => {
    const data = await e.data.json();
    const regis = self.registration;
    if(data.type == "reviewnotifcheck") {
        // Check if the user has blocked notifications; if so, exit.
        if(Notification.permission != "granted") {
            sub.unsubscribe();
            fetch("https://bento-api.uk:443/notify", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    unsubscribe: true,
                    auth: sub.keys.auth,
                    rand_identifier
                })
            }).catch(async e => {
                console.error("failed to unsubscribe to push notifs; reason:", e);
            });
            await regis.unregister();
            return;
        }
        const notif = regis.showNotification("Bento | Time to review.", {
            body: `You currently have ${data.deckcount} deck${data.deckcount == 1 ? "" : "s"} to review.`,
            tag: 'reviewnotif-' + Date.now()
        });
        notif.onclick = () => open("https://bento.valleynas.uk/home");
    } else if(data.type == "unsubscribe") {
        sub.unsubscribe();
        await regis.unregister();
    }
});