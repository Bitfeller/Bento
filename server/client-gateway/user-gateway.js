const moduleurl = new URL(import.meta.url);
const spath = moduleurl.pathname + "/../..";

function err(func) {
    console.log("backend: " + func + "() received an improper response.");
}
class UserGateway {
    static async getuser() {
        var success, data;
        await fetch(spath + "/php-db/user/user_get.php", {
            method: "get",
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(function(res) {
            if(!res.ok) {
                err("getuser");
                success = false;
                data = 'fetch-err';
                throw "none";
            }
            return res.json();
        }).then(function(res) {
            success = (res.status == "success");
            if(!success) {
                data = res.reason;
            } else {
                data = res.data;
                data.userdata = JSON.parse(data.userdata);
            }
        }).catch(function(err) {
            if(err == "none") {return;}
            console.log("backend: " + err);
        });
        return [success, data];
    }
    static async login(username, pwd) {
        if(!username || !pwd || username.length === 0 || pwd.length === 0) {
            return [false, "invalid params"];
        }
        var success, reason;
        await fetch(spath + "/php-db/user/user_login.php", {
            method: "post",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: username,
                pwd: pwd
            })
        }).then(function(res) {
            if(!res.ok) {
                err("login");
                success = false;
                reason = 'fetch-err';
                throw "none";
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
    static async signup(username, pwd, email) {
        if(!username || !pwd || !email || username.length === 0 || pwd.length === 0 || email.length === 0) {
            return [false, "invalid params"];
        }
        if(pwd.length < 8) {
            return [false, "bad pwd"];
        }
        var success, reason;
        await fetch(spath + "/php-db/user/user_new.php", {
            method: 'post',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: username,
                pwd: pwd,
                email: email
            })
        }).then(function(res) {
            if(!res.ok) {
                err("signup");
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
    static async editUser(setting, val, pwd) {
        if(typeof(setting) !== "string" || typeof(val) !== "string" || setting.length === 0) {
            return [false, "invalid params"];
        }
        var success, reason;
        await fetch(spath + "/php-db/user/user_edit.php", {
            method: 'post',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                setting: setting,
                val: val,
                verifpwd: pwd || ""
            })
        }).then(function(res) {
            if(!res.ok) {
                err("editUser");
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
    static async signout() {
        await fetch(spath + "/php-db/user/user_logout.php", {
            method: 'post',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        return [true, undefined];
    }
    static async giveFeedback(feedback) {
        if(typeof(feedback) !== "string" || (feedback.length ?? 0) < 1) {
            return [false, "invalid params"];
        }
        var success, reason;
        await fetch(spath + "/php-db/feedback/feedback_new.php", {
            method: 'post',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                feedback
            })
        }).then(function(res) {
            if(!res.ok) {
                err("giveFeedback");
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
    static calculateNTR(box, lastSeen) {
        let tick = Date.now();
        let dist = tick - lastSeen;
        let days = (((dist / 1000) / 60) / 60) / 24;
        switch(box) {
            case 1:
                return days >= 1;
            case 2:
                return days >= 3;
            case 3:
                return days >= 5;
            case 4:
                return days >= 7;
            case 5:
                return days >= 10;
            case 6:
                return days >= 14;
            default:
                return true;
        }
    }
    // Recovery and verification methods
    static async userdir(mode, uid, verif, newPwd) {
        if(typeof(mode) !== "string" || typeof(verif) !== "string" || typeof(uid) !== "number") {
            return [false, "invalid params"];
        }
        var success, reason;
        await fetch(spath + "/php-db/user/user_direct.php", {
            method: 'post',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                mode,
                uid,
                verif,
                newPwd: newPwd ?? ""
            })
        }).then(function(res) {
            if(!res.ok) {
                err("userdir");
                success = false;
                reason = 'fetch-err';
                throw 'none';
            }
            return res.json();
        }).then(function(res) {
            success = (res.status == "success");
            if(!success) reason = res.reason;
        }).catch(function(err) {
            if(err == "none") return;
            console.log("backend: " + err);
        });
        return [success, reason];
    }
    static async resetPwd(email) {
        if(typeof(email) !== "string") {
            return [false, "invalid params"];
        }
        var success, reason;
        await fetch(spath + "/php-db/user/user_resetpwd.php", {
            method: 'post',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email
            })
        }).then(function(res) {
            if(!res.ok) {
                err("resetPwd");
                success = false;
                reason = 'fetch-err';
                throw 'none';
            }
            return res.json();
        }).then(function(res) {
            success = (res.status == "success");
            if(!success) reason = res.reason;
        }).catch(function(err) {
            if(err == "none") return;
            console.log("backend: " + err);
        });
        return [success, reason];
    }
    constructor() {
        console.log("backend: invalid call of class.");
        throw new Error("backend");
    }
}

export {UserGateway};