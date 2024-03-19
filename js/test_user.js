import { UserGateway } from "../main/user_gateway.js";
function g(el) {return document.getElementById(el);}
var username = g('username');
var pwd = g('pwd');
var email = g('email');
var signup = g('signup');
var login = g('login');
var signout = g('signout');
var fetch = g('fetch');
var setting = g('setting');
var val = g('val');
var edit = g('edit');
signup.addEventListener("mousedown", async function() {
    var [success, reason] = await UserGateway.signup(username.value, pwd.value, email.value);
    console.log("signup:", success, reason);
});
login.addEventListener("mousedown", async function() {
    var [success, reason] = await UserGateway.login(username.value, pwd.value);
    console.log("login:", success, reason);
});
signout.addEventListener("mousedown", async function() {
    var [success, reason] = await UserGateway.signout();
    console.log("signout:", success, reason);
});
fetch.addEventListener("mousedown", async function() {
    var [success, data] = await UserGateway.getuser();
    console.log("fetch:", success, data);
});
edit.addEventListener("mousedown", async function() {
    var [success, reason] = await UserGateway.editUser(setting.value, val.value, pwd.value);
    console.log("edit:", success, reason);
});