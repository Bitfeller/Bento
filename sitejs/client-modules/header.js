// Essential script for loading user data + initializing page
import { UserGateway } from "../../server/client-gateway/user-gateway.js";

const icons = document.getElementsByClassName("right-header-ico");
const logout = document.getElementById("header:logout");
const pfp = document.getElementById("header:pfp");
const uo = document.body.dataset.uo;
/*const hover = document.createElement("div");
hover.style = "background-color: rgb(150, 150, 150); position: absolute; width: auto; padding: 7px; height: auto;";*/

const loader = document.getElementsByClassName("loader")[0];

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
    loader.remove();
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