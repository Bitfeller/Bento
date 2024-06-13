// Essential script for loading user data
import { UserGateway } from "../main/user_gateway.js";

const logout = document.getElementById("header:logout");
const uo = document.body.dataset.uo;

const loader = document.createElement("div");
loader.className = "loader";
loader.innerHTML = "<div class='load-rot'></div>";
document.body.appendChild(loader);

(async () => {
    let [success, reason] = await UserGateway.getuser();
    if(!success && reason == "no session") {
        logout.remove();
        if(uo == "true") window.location.href = "/login";
    }
    loader.remove();
})();

logout.addEventListener("mousedown", async () => {
    await UserGateway.signout();
    window.location.href = "";
});