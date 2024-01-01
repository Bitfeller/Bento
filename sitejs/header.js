import { UserGateway } from "../main/user_gateway.js";

const logout = document.getElementById("header:logout");
const uo = document.body.dataset.uo;

(async () => {
    let [success, reason] = await UserGateway.getuser();
    if(!success && reason == "no session") {
        logout.remove();
        if(uo == "true") window.location.href = "/login";
    }
})();

logout.addEventListener("mousedown", async () => {
    await UserGateway.signout();
    window.location.href = "";
});