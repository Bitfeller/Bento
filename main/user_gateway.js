class UserGateway {
    static async getuser() {
        var data;
        await fetch("../main/user/user_get.php", {
            method: "get"
        }).then(function(res) {
            if(!res.ok) {
                console.log("backend: getuser() received an improper response when fetching user information.");
                throw new Error("none");
            }
            return res.json();
        }).then(function(res) {
            if(res.length === 0) {return;}
            data = res;
            data.reviews = JSON.parse(data.reviews);
        }).catch(function(err) {
            if(err === "Error: none") {
                return;
            }
            console.log("backend: " + err);
        });
        return data;
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
                console.log("backend: login() received an improper response when verifying user credentials.");
                throw new Error("none");
            }
            return res.json();
        }).then(function(res) {
            success = (res.status == "success");
            if(!success) reason = res.reason;
        }).catch(function(err) {
            if(err === "Error: none") {
                return;
            }
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
                console.log("backend: signup() received an improper response when adding new user.");
                throw new Error("none");
            }
            return res.json();
        }).then(function(res) {
            success = (res.status == "success");
            if(!success) reason = res.reason;
        }).catch(function(err) {
            if(err === "Error: none") {
                return;
            }
            console.log("backend: " + err);
        });
        return [success, reason];
    }
    static async editUser(setting, val, pwd) {
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
                console.log("backend: signup() received an improper response when editing new user.");
                throw new Error("none");
            }
            return res.json();
        }).then(function(res) {
            success = (res.status == "success");
            if(!success) reason = res.reason;
        }).catch(function(err) {
            if(err === "Error: none") {
                return;
            }
            console.log("backend: " + err);
        });
        return [success, reason];
    }
    static async signout() {
        await fetch("../main/user/user_logout.php", {
            method: 'post'
        });
        return true;
    }
    constructor() {
        console.log("backend: invalid call of class.");
        throw new Error("backend");
    }
}

export {UserGateway};