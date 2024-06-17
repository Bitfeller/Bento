// Essential script for loading user data
import { UserGateway } from "../main/user_gateway.js";

const icons = document.getElementsByClassName("right-header-ico");
const logout = document.getElementById("header:logout");
const uo = document.body.dataset.uo;
/*const hover = document.createElement("div");
hover.style = "background-color: rgb(150, 150, 150); position: absolute; width: auto; padding: 7px; height: auto;";*/

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