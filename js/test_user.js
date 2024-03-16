import { UserGateway } from "../main/user_gateway.js";
var username = document.getElementById("username");
var pwd = document.getElementById("pwd");
var email = document.getElementById("email");
var signup = document.getElementById("signup");
var login = document.getElementById("login");
var signout = document.getElementById("signout");
var fetch = document.getElementById("fetch");
var setting = document.getElementById("setting");
var val = document.getElementById("val");
var edit = document.getElementById("edit");
signup.addEventListener("mousedown", async function() {
    var [success, reason] = await UserGateway.signup(username.value, pwd.value, email.value);
    console.log(success, reason);
});
login.addEventListener("mousedown", async function() {
    var [success, reason] = await UserGateway.login(username.value, pwd.value);
    console.log(success, reason);
});
signout.addEventListener("mousedown", async function() {
    await UserGateway.signout();
    console.log("hooray....i think");
});
fetch.addEventListener("mousedown", async function() {
    var data = await UserGateway.getuser();
    console.log(data);
});
edit.addEventListener("mousedown", async function() {
    var data = await UserGateway.editUser(setting.value, val.value, pwd.value);
    console.log(data);
});