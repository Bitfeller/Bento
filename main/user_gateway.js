function err(func) {
    console.log("backend: " + func + "() received an improper response.");
}
class UserGateway {
    static async getuser() {
        var success, data;
        await fetch("../main/user/user_get.php", {
            method: "search",
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
        await fetch("../main/user/user_login.php", {
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
        await fetch("../main/user/user_new.php", {
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
        if(!setting || !val || setting.length === 0) {
            return [false, "invalid params"];
        }
        var success, reason;
        await fetch("../main/user/user_edit.php", {
            method: 'post',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                setting: setting,
                val: val,
                verifpwd: pwd
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
        await fetch("../main/user/user_logout.php", {
            method: 'post',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        return [true, undefined];
    }
    constructor() {
        console.log("backend: invalid call of class.");
        throw new Error("backend");
    }
}

export {UserGateway};