const moduleurl = new URL(import.meta.url);
const spath = moduleurl.pathname + "/../..";

function types(t, ...args) {
    return args.every((c, i) => {
        if(c === undefined) return false;
        switch(t[i]) {
            case "S": return typeof c === "string" && c.length > 0;
            case "s": return typeof c === "string";
            case "b": return typeof c === "boolean";
            case "N": return typeof c === "number" && !isNaN(c) && c >= 0;
            case "n": return typeof c === "number" && !isNaN(c);
            case "a": return Array.isArray(c);
        }
        return false;
    });
}
function similar(s1, s2) {
    if(s1 == s2) return 0;
    const a = s1.length;
    const b = s2.length;

    let curr, prev = (curr = new Array(b + 1).fill(0));

    for(let j = 0; j <= b; j++) prev[j] = j;
    for(let i = 1; i <= a; i++) {
        curr[0] = i;
        for(let j = 1; j <= b; j++) {
            if(s1[i - 1] == s2[j - 1]) curr[j] = prev[j - 1];
            else curr[j] = 1 + Math.min(curr[j - 1], prev[j], prev[j - 1]); // insert, remove, replace
        }
        prev = [...curr];
    }
    return curr[b];
}

let DeckGateway = {
    getall: async (offset = 0, searchTerms = []) => {
        if(!types("Na", offset, searchTerms)) return [false, "invalid params"];
        let success = false, data = 'fetch-err';
        await fetch(spath + "/php-db/deck/deck_getall.php", {
            method: 'post',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                offset,
                searchTerms
            })
        }).then((res) => {
            if(!res.ok) throw "couldn't fetch! (bad response)";
            return res.json();
        }).then((res) => {
            success = res.status == 'success';
            if(!success) data = res.reason;
            else {
                data = JSON.parse(res.data);
                // Sort results
                if(searchTerms && searchTerms.length > 0) {
                    let scores = new Array(data.length).fill(0);
                    scores = scores.map((_, i) => {
                        let n_t = 0, o_t = 0, s = data[i].name.split(" ");
                        for(let j = 0; j < searchTerms.length; j++) {
                            let min = similar(searchTerms[j], s[0]);
                            for(let k = 1; k < s.length; k++) min = Math.min( similar(searchTerms[j], s[k]), min );
                            n_t += min;
                            o_t += similar(searchTerms[j], data[i].owner);
                        }
                        return Math.min(n_t, o_t);
                    });
                    data = data.sort((a, b) => scores[data.indexOf(a)] - scores[data.indexOf(b)]);
                }
            }
        }).catch((e) => console.log('backend[deck-gateway.js:getall]:', e));
        return [success, data];
    },
    add: async (name, deckpic, data, isPublic) => {
        if(!types("SsSb", name, data, deckpic, isPublic)) return [false, "invalid params"];
        let success = false, reason = 'fetch-err';
        await fetch(spath + "/php-db/deck/deck_new.php", {
            method: 'post',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name,
                deckpic,
                data,
                public: false ? 0 : 1
            })
        }).then(res => {
            if(!res.ok) throw "couldn't fetch! (bad response)";
            return res.json();
        }).then(res => {
            success = res.status == 'success', reason = '';
            if(!success) reason = res.reason;
        }).catch(e => console.log('backend[deck-gateway.js:add]:', e));
        return [success, reason];
    },
    get: async (id, load_data = true, load_pic = false, load_contnt_len = false) => {
        if(!types("Nbbb", id, load_pic, load_data, load_contnt_len)) return [false, "invalid params"];
        let success = false, data = 'fetch-err';
        await fetch(spath + "/php-db/deck/deck_get.php", {
            method: 'post',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id,
                load_pic,
                load_data,
                load_contnt_len
            })
        }).then(res => {
            if(!res.ok) throw "couldn't fetch! (bad response)";
            return res.json();
        }).then(res => {
            success = res.status == 'success';
            if(!success) data = res.reason;
            else {
                data = JSON.parse(res.data);
                if(data.data) data.data = JSON.parse(data.data);
                if(data.deckpic) data.deckpic = JSON.parse(data.deckpic);
            }
        }).catch(e => console.log('backend[deck-gateway.js:get]:', e));
        return [success, data];
    },
    modify: async (d_id, setting, val) => {
        if(!types("NSs", d_id, setting, val)) return [false, "invalid params"];
        let success = false, reason = 'fetch-err';
        await fetch(spath + "/php-db/deck/deck_edit.php", {
            method: 'post',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                d_id,
                setting,
                val
            })
        }).then(res => {
            if(!res.ok) throw "couldn't fetch! (bad response)";
            return res.json();
        }).then(res => {
            success = res.status == 'success', reason = '';
            if(!success) reason = res.reason;
        }).catch(e => console.log('backend[deck-gateway.js:modify]:', e))
        return [success, reason];
    }
};

export { DeckGateway };