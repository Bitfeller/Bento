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
                data.reviews = JSON.parse(data.reviews);
                data.draftdecks = JSON.parse(data.draftdecks);
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
    constructor() {
        console.log("backend: invalid call of class.");
        throw new Error("backend");
    }
}

export {UserGateway};