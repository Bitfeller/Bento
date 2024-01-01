import { UserGateway } from "../main/user_gateway.js";

const logout = document.getElementById("logout");

(async () => {
    let [success, reason] = await UserGateway.getuser();
    if(!success && reason == "no session") logout.remove();
})();

logout.addEventListener("mousedown", async () => {
    await UserGateway.signout();
    window.location.href = "/index";
});