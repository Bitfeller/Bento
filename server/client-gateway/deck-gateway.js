const moduleurl = new URL(import.meta.url);
const spath = moduleurl.pathname + "/../..";

function err(func) {
    console.log("backend: " + func + "() received an improper response.");
}
function similar(s1, s2) {
    if(s1 == s2) return 0;
    const a = s1.length;
    const b  = s2.length;
    let prev = new Array(b + 1).fill(0);
    let curr = new Array(b + 1).fill(0);
    for(let j = 0; j <= b; j++) {prev[j] = j;}
    for(let i = 1; i <= a; i++) {
        curr[0] = i;
        for(let j = 1; j <= b; j++) {
            if(s1[i - 1] == s2[j - 1]) {
                curr[j] = prev[j - 1];
            } else {
                curr[j] = 1 + Math.min(curr[j - 1], prev[j], prev[j - 1]); // insert, remove, replace
            }
        }
        prev = [...curr];
    }
    return curr[b];
}
class DeckGateway {
    static async getall(offset, searchTerms) {
        var success, data;
        await fetch(spath + "/php-db/deck/deck_getall.php", {
            method: 'post',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                offset: offset,
                searchTerms: searchTerms || []
            })
        }).then(function(res) {
            if(!res.ok) {
                err("getall");
                success = false;
                data = 'fetch-err';
                throw 'none';
            }
            return res.json();
        }).then(function(res) {
            success = (res.status == "success");
            if(!success) {
                data = res.reason;
            } else {
                data = JSON.parse(res.data);
                // Sort results
                if(searchTerms) {
                    let scores = new Array(data.length).fill(0);
                    scores = scores.map((_, idx) => {
                        let n_t = 0;
                        let o_t = 0;
                        let s = data[idx].name.split(" ");
                        for(let i = 0; i < searchTerms.length; i++) {
                            let min = similar(searchTerms[i], s[0]);
                            for(let j = 1; j < s.length; j++) {
                                min = Math.min(
                                    similar(searchTerms[i], s[j]),
                                    min
                                );
                            }
                            n_t += min;
                            o_t += similar(searchTerms[i], data[idx].owner);
                        }
                        return Math.min(n_t, o_t);
                    });
                    data = data.sort((a, b) => {
                        let aIdx = data.indexOf(a);
                        let bIdx = data.indexOf(b);
                        return scores[aIdx] - scores[bIdx];
                    });
                }
            }
        }).catch(function(err) {
            if(err == "none") {return;}
            console.log("backend: " + err);
        });
        return [success, data];
    }
    static async add(name, deckpic, data, isPublic) {
        if(typeof(name) !== "string" || typeof(data) !== "string" || typeof(deckpic) !== "string" || typeof(isPublic) !== "boolean" || data.length == 0) {
            return [false, "invalid params"];
        }
        var success, reason;
        await fetch(spath + "/php-db/deck/deck_new.php", {
            method: 'post',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: name,
                deckpic: deckpic,
                data: data,
                public: (false ? 0 : 1)
            })
        }).then(function(res) {
            if(!res.ok) {
                err('add');
                success = false;
                reason = 'fetch-err';
                throw 'none';
            }
            return res.json();
        }).then(function(res) {
            success = (res.status == "success");
            if(!success) reason = res.reason;
        }).catch(function(err) {
            if(err == "none") {return;}
            console.log("backend: " + err);
        });
        return [success, reason];
    }
    static async get(id, load_data, load_pic, load_contnt_len) {
        if(!id) {
            return [false, "invalid params"];
        }
        var success, data;
        await fetch(spath + "/php-db/deck/deck_get.php", {
            method: 'post',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id: id,
                load_pic: load_pic ?? false,
                load_data: load_data ?? true,
                load_contnt_len: load_contnt_len ?? false
            })
        }).then(function(res) {
            if(!res.ok) {
                err("get");
                success = false;
                data = 'fetch-err';
                throw 'none';
            }
            return res.json();
        }).then(function(res) {
            success = (res.status == "success");
            if(!success) {
                data = res.reason;
            } else {
                data = JSON.parse(res.data);
                if(data.data) data.data = JSON.parse(data.data);
                if(data.deckpic) data.deckpic = JSON.parse(data.deckpic);
            }
        }).catch(function(err) {
            if(err == "none") {return;}
            console.log("backend: " + err);
        });
        return [success, data];
    }
    static async modify(id, setting, val) {
        if(!id || !setting || val == undefined || typeof(val) !== "string" || setting.length === 0) {
            return [false, "invalid params"];
        }
        var success, reason;
        await fetch(spath + "/php-db/deck/deck_edit.php", {
            method: 'post',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                d_id: id,
                setting: setting,
                val: val
            })
        }).then(function(res) {
            if(!res.ok) {
                err("modify");
                success = false;
                reason = 'fetch-err';
                throw 'none';
            }
            return res.json();
        }).then(function(res) {
            success = (res.status == "success");
            if(!success) reason = res.reason;
        }).catch(function(err) {
            if(err == "none") {return;}
            console.log("backend: " + err);
        })
        return [success, reason];
    }
    constructor() {
        console.log("backend: invalid call of class.");
        throw new Error("backend");
    }
}

export {DeckGateway};