import { DeckGateway } from "../main/deck_gateway.js";
async function main() {
    console.log(await DeckGateway.getall());
}
main();