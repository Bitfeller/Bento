import { UserGateway } from '../server/client-gateway/user-gateway.js';

(async () => {
    const params = new URLSearchParams(window.location.search);
    if(!params.get("hash") || !params.get("v") || !params.get("user")) {
        window.LOAD_ERROR("Looks like that URL is invalid. Did you come here from an email?");
        return;
    }
    let hash = params.get("hash");
    let mode = params.get("v") == 0 ? "emailverif" : "pwdrecover";
    let user = params.get("user");
    if(hash.length !== 128) {
        window.LOAD_ERROR("Looks like that URL is invalid. Did you come here from an email?");
        return;
    }
    // let [success, data] = await UserGateway.userdir(mode, user, hash);
    
})();