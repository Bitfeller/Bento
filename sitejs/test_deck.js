import { DeckGateway } from "../server/client-gateway/deck-gateway.js";
function g(el) {return document.getElementById(el);}
var name = g('name');
var data = g('data');
var publicVal = g('public');
var idVal = g('id');
var setting = g('setting');
var val = g('val');
var add = g('add');
var getall = g('getall');
var modify = g('modify');
var open = g('open');
add.addEventListener("mousedown", async function() {
    var [success, reason] = await DeckGateway.add(name.value, data.value, publicVal.value);
    console.log("add:", success, reason);
});
getall.addEventListener("mousedown", async function() {
    var [success, data] = await DeckGateway.getall(0);
    console.log("getall:", success, data);
});
modify.addEventListener("mousedown", async function() {
    var [success, reason] = await DeckGateway.modify(parseInt(idVal.value), setting.value, val.value);
    console.log('modify:', success, reason);
});
open.addEventListener("mousedown", async function() {
    var [success, data] = await DeckGateway.get(parseInt(idVal.value));
    console.log("open:", success, data);
});