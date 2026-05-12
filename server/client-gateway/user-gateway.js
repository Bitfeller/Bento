import { types, sameUser, senderror, gateway_fetch, cache, getCache } from './gateway-mod.js';

const moduleurl = new URL(import.meta.url);
const spath = moduleurl.pathname + "/../..";

async function isCommon(pwd) {
    let list = await gateway_fetch("/conf/commonpwd.json");
    for(let i = 0; i < list.length; i++)
        if(pwd.includes(list[i])) return true;
    return false;
}

let UserGateway = {
    getuser: async (getpfp = false, getudata = false, getreviews = true, getdrafts = false) => {
        if(!types("bbbb", getpfp, getudata, getreviews, getdrafts)) return [false, "invalid params"];
        if(!await sameUser()) return [false, "no session"];
        let success = false, data = 'fetch-err', fres;
        let pfpHash = getCache('pfp-hash') ?? "";
        await fetch(spath + "/php-db/user/user_get.php", {
            method: "post",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                getpfp,
                getudata,
                getreviews,
                getdrafts,
                pfpHash
            })
        }).then(async res => {
            if(!res.ok) throw "couldn't fetch! (bad response)";
            fres = res.clone();
            console.log('backend[user-gateway.js:getuser]: got response of ', await res.clone().text());
            return res.json();
        }).then(res => {
            success = res.status == 'success';
            if(!success) 
                data = res.reason;
            else {
                data = res.data;
                if(data.userdata) 
                    data.userdata = JSON.parse(data.userdata);
                if(data.pfp) {
                    // New pfp, update pfp + cache
                    cache('pfp-hash', data.pfphash);
                    cache('pfp', data.pfp);
                } else if(getpfp) {
                    // the hash we sent matches the server's; use the cached pfp
                    data.pfp = getCache('pfp') ?? "";
                }
            }
        }).catch(async e => {
            console.log('backend[user-gateway.js:getuser]:', e);
            senderror("user-gateway.js:getuser", await fres.text(), {
                plain: e,
                getpfp,
                getudata,
                getreviews,
                getdrafts
            });
        });
        return [success, data];
    },
    login: async (username, pwd) => {
        if(!types("SS", username, pwd)) return [false, "invalid params"];
        let success = false, reason = 'fetch-err', fres;
        await fetch(spath + "/php-db/user/user_login.php", {
            method: "post",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username,
                pwd
            })
        }).then(res => {
            if(!res.ok) throw "couldn't fetch! (bad response)";
            fres = res.clone();
            return res.json();
        }).then(res => {
            success = res.status == 'success', reason = '';
            if(!success) reason = res.reason;
        }).catch(async e => {
            console.log('backend[user-gateway.js:login]:', e);
            senderror("user-gateway.js:login", await fres.text(), {
                plain: e
            });
        });
        return [success, reason];
    },
    signup: async (username, pwd, email) => {
        if(!types("SSS", username, pwd, email)) return [false, "invalid params"];
        if(pwd.length < 8) return [false, "bad pwd"];
        if(await isCommon(pwd)) return [false, "bad pwd"];
        let success = false, reason = 'fetch-err', fres;
        await fetch(spath + "/php-db/user/user_new.php", {
            method: 'post',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username,
                pwd,
                email
            })
        }).then(res => {
            if(!res.ok) throw "couldn't fetch! (bad response)";
            fres = res.clone();
            return res.json();
        }).then(res => {
            success = res.status == 'success', reason = '';
            if(!success) reason = res.reason;
        }).catch(async e => {
            console.log('backend[user-gateway.js:signup]:', e);
            senderror("user-gateway.js:signup", await fres.text(), {
                plain: e
            });
        });
        return [success, reason];
    },
    editUser: async (setting, val, pwd = "") => {
        if(!types("Sss", setting, val, pwd)) return [false, "invalid params"];
        if(!await sameUser()) return [false, "no session"];
        let success = false, reason = 'fetch-err', fres;
        await fetch(spath + "/php-db/user/user_edit.php", {
            method: 'post',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                setting,
                val,
                verifpwd: pwd
            })
        }).then(res => {
            if(!res.ok) throw "couldn't fetch! (bad response)";
            fres = res.clone();
            return res.json();
        }).then(res => {
            success = res.status == 'success', reason = '';
            if(!success) reason = res.reason;
        }).catch(async e => {
            console.log('backend[user-gateway.js:editUser]:', e);
            senderror("user-gateway.js:editUser", await fres.text(), {
                plain: e,
                setting
            });
        });
        return [success, reason];
    },
    signout: async () => {
        await fetch(spath + "/php-db/user/user_logout.php", {
            method: 'post',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        return [true, null];
    },
    getDraftImage: async time => {
        if(!types("n", time)) return [false, "invalid params"];
        if(!await sameUser()) return [false, "no session"];
        let success = false, data = 'fetch-err', fres;
        await fetch(spath + "/php-db/user/user_draft_getpic.php", {
            method: 'post',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                time
            })
        }).then(res => {
            if(!res.ok) throw "couldn't fetch! (bad response)";
            fres = res.clone();
            return res.json();
        }).then(res => {
            success = res.status == 'success';
            if(!success) data = res.reason;
            else data = res.data;
        }).catch(async e => {
            console.log('backend[user-gateway.js:getDraftImage]:', e);
            senderror("user-gateway.js:getDraftImage", await fres.text(), {
                plain: e,
                time
            });
        });
        return [success, data];
    },
    giveFeedback: async feedback => {
        if(!types("S", feedback)) return [false, "invalid params"];
        if(!await sameUser()) return [false, "no session"];
        let success = false, reason = 'fetch-err', fres;
        await fetch(spath + "/php-db/feedback/feedback_new.php", {
            method: 'post',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                feedback
            })
        }).then(res => {
            if(!res.ok) throw "couldn't fetch! (bad response)";
            fres = res.clone();
            return res.json();
        }).then(res => {
            success = res.status == 'success', reason = '';
            if(!success) reason = res.reason;
        }).catch(async e => {
            console.log('backend[user-gateway.js:giveFeedback]:', e);
            senderror("user-gateway.js:giveFeedback", await fres.text(), {
                plain: e,
                feedback
            });
        });
        return [success, reason];
    },
    calculateDays: (box) => {
        if(!types("nn", box)) return -1;
        let boxassoc = [1, 3, 5, 7, 10, 14]; // b1 = 1d, b2 = 3d, etc.
        return boxassoc[box - 1] ?? -1
    },
    calculateNextReview: (box, lastSeen) => {
        if(!types("nn", box, lastSeen)) return -1;
        let tick = Date.now(), dist = tick - lastSeen, days = (((dist / 1000) / 60) / 60) / 24;
        return Math.round(UserGateway.calculateDays(box) - days);
    },
    calculateNTR: (box, lastSeen) => {
        if(!types("nn", box, lastSeen)) return true;
        let tick = Date.now(), dist = tick - lastSeen, days = (((dist / 1000) / 60) / 60) / 24;
        return days >= UserGateway.calculateDays(box, lastSeen);
    },
    // Recovery and verification methods
    userdir: async (mode, uid, verif, newPwd = "") => {
        if(!types("Sns", mode, uid, verif)) return [false, "invalid params"];
        let success = false, reason = 'fetch-err', fres;
        await fetch(spath + "/php-db/user/user_direct.php", {
            method: 'post',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                mode,
                uid,
                verif,
                newPwd
            })
        }).then(res => {
            if(!res.ok) throw "couldn't fetch! (bad response)";
            fres = res.clone();
            return res.json();
        }).then(res => {
            success = res.status == 'success', reason = '';
            if(!success) reason = res.reason;
        }).catch(async e => {
            console.log('backend[user-gateway.js:userdir]:', e);
            senderror("user-gateway.js:userdir", await fres.text(), {
                plain: e,
                mode
            });
        });
        return [success, reason];
    },
    resetPwd: async email => {
        if(!types("s", email)) return [false, "invalid params"];
        let success = false, reason = 'fetch-err', fres;
        await fetch(spath + "/php-db/user/user_resetpwd.php", {
            method: 'post',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email
            })
        }).then(res => {
            if(!res.ok) throw "couldn't fetch! (bad response)";
            fres = res.clone();
            return res.json();
        }).then(res => {
            success = res.status == 'success', reason = '';
            if(!success) reason = res.reason;
        }).catch(async e => {
            console.log('backend[user-gateway.js:resetPwd]:', e);
            senderror("user-gateway.js:resetPwd", await fres.text(), {
                plain: e
            });
        });
        return [success, reason];
    }
}

export { UserGateway };