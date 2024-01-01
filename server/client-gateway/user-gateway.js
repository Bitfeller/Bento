import { types, sameUser } from './gateway-mod.js';

const moduleurl = new URL(import.meta.url);
const spath = moduleurl.pathname + "/../..";

let pwdcache;

async function pwdfetch() {
    if(pwdcache) return pwdcache;
    try {
        const resp = await fetch(spath + "/conf/commonpwd.json");
        if(!resp.ok) throw "couldn't fetch!";
        const data = await resp.json();
        return pwdcache = data;
    } catch(e) {
        console.error('backend: Failed to fetch common passwords:', e);
        return [];
    }
}
async function isCommon(pwd) {
    let list = await pwdfetch();
    for(let i = 0; i < list.length; i++)
        if(pwd.includes(list[i])) return true;
    return false;
}
let UserGateway = {
    getuser: async (getpfp = false, getudata = false, getreviews = true, getdrafts = false) => {
        if(!types("bbbb", getpfp, getudata, getreviews, getdrafts)) return [false, "invalid params"];
        if(!await sameUser()) return [false, "invalid params"];
        let success = false, data = 'fetch-err';
        await fetch(spath + "/php-db/user/user_get.php", {
            method: "post",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                getpfp,
                getudata,
                getreviews,
                getdrafts
            })
        }).then(res => {
            if(!res.ok) throw "couldn't fetch! (bad response)";
            return res.json();
        }).then(res => {
            success = res.status == 'success';
            if(!success) data = res.reason;
            else {
                data = res.data;
                if(data.userdata) data.userdata = JSON.parse(data.userdata);
            }
        }).catch(e => console.log('backend:', e));
        return [success, data];
    },
    login: async (username, pwd) => {
        if(!types("SS", username, pwd)) return [false, "invalid params"];
        let success = false, reason = 'fetch-err';
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
            return res.json();
        }).then(res => {
            success = res.status == 'success', reason = '';
            if(!success) reason = res.reason;
        }).catch(e => console.log('backend:', e));
        return [success, reason];
    },
    signup: async (username, pwd, email) => {
        if(!types("SSS", username, pwd, email)) return [false, "invalid params"];
        if(pwd.length < 8) return [false, "bad pwd"];
        if(await isCommon(pwd)) return [false, "bad pwd"];
        let success = false, reason = 'fetch-err';
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
            return res.json();
        }).then(res => {
            success = res.status == 'success', reason = '';
            if(!success) reason = res.reason;
        }).catch(e => console.log('backend:', e));
        return [success, reason];
    },
    editUser: async (setting, val, pwd = "") => {
        if(!types("Sss", setting, val, pwd)) return [false, "invalid params"];
        if(!await sameUser()) return [false, "invalid params"];
        let success = false, reason = 'fetch-err';
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
            return res.json();
        }).then(res => {
            success = res.status == 'success', reason = '';
            if(!success) reason = res.reason;
        }).catch(e => console.log('backend:', e));
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
        if(!await sameUser()) return [false, "invalid params"];
        let success = false, data = 'fetch-err';
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
            return res.json();
        }).then(res => {
            success = res.status == 'success';
            if(!success) data = res.reason;
            else data = res.data;
        }).catch(e => console.log('backend:', e));
        return [success, data];
    },
    giveFeedback: async feedback => {
        if(!types("S", feedback)) return [false, "invalid params"];
        if(!await sameUser()) return [false, "invalid params"];
        let success = false, reason = 'fetch-err';
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
            return res.json();
        }).then(res => {
            success = res.status == 'success', reason = '';
            if(!success) reason = res.reason;
        }).catch(e => console.log('backend:', e));
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
        let success = false, reason = 'fetch-err';
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
            return res.json();
        }).then(res => {
            success = res.status == 'success', reason = '';
            if(!success) reason = res.reason;
        }).catch(e => console.log('backend:', e));
        return [success, reason];
    },
    resetPwd: async email => {
        if(!types("s", email)) return [false, "invalid params"];
        let success = false, reason = 'fetch-err';
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
            return res.json();
        }).then(res => {
            success = res.status == 'success', reason = '';
            if(!success) reason = res.reason;
        }).catch(e => console.log('backend:', e));
        return [success, reason];
    },
    showError: error => {
        const errorMessages = {
            "invalid params": "Invalid parameters"
        };
        const message = errorMessages[error] || error;

        const errorPopup = document.createElement("div");
        errorPopup.innerText = message;

        errorPopup.style.position = "fixed";
        errorPopup.style.top = "20px";
        errorPopup.style.left = "50%";
        errorPopup.style.transform = "translateX(-50%)";
        errorPopup.style.backgroundColor = "rgba(255, 0, 0, 0.8)";
        errorPopup.style.color = "white";
        errorPopup.style.padding = "10px 20px";
        errorPopup.style.borderRadius = "5px";
        errorPopup.style.zIndex = "1000";

        document.body.appendChild(errorPopup);
        setTimeout(() => errorPopup.remove(), 2500);
    }
}

export { UserGateway };