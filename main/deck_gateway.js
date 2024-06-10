function err(func) {
    console.log("backend: " + func + "() received an improper response.");
}
class DeckGateway {
    static async getall(offset, searchTerms) {
        var success, data;
        await fetch("../main/deck/deck_getall.php", {
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
                for(var i = 0; i < data.length; i++) {
                    data[i].data = JSON.parse(data[i].data);
                }
            }
        }).catch(function(err) {
            if(err == "none") {return;}
            console.log("backend: " + err);
        });
        return [success, data];
    }
    static async add(name, data, isPublic) {
        if(!name || !data || isPublic === undefined || isPublic === null || name.length === 0) {
            return [false, "invalid params"];
        }
        var success, reason;
        await fetch("../main/deck/deck_add.php", {
            method: 'post',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: name,
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
    static async get(id) {
        if(!id) {
            return [false, "invalid params"];
        }
        var success, data;
        await fetch("../main/deck/deck_open.php", {
            method: 'post',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id: id
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
                data.data = JSON.parse(data.data);
            }
        }).catch(function(err) {
            if(err == "none") {return;}
            console.log("backend: " + err);
        });
        return [success, data];
    }
    static async modify(id, setting, val) {
        if(!id || !setting || !val || setting.length === 0) {
            return [false, "invalid params"];
        }
        var success, reason;
        await fetch("../main/deck/deck_modify.php", {
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
}

export {DeckGateway};