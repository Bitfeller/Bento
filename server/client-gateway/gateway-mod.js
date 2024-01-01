const moduleurl = new URL(import.meta.url);
const spath = moduleurl.pathname + "/../..";

let lastUser;

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
async function sameUser() {
    let same = false;
    await fetch(spath + "/php-db/user/user_id.php", {
        method: "post",
        headers: {
            'Content-Type': 'application/json'
        }
    }).then(res => {
        if(!res.ok) throw "couldn't fetch! (bad response)";
        return res.json();
    }).then(res => {
        if(res.status == 'success') {
            if(!lastUser) same = true;
            else same = parseInt(res.data) == lastUser;
            lastUser = res.data;
        }
    }).catch(e => console.log('backend:', e));
    return same;
}
async function senderror(name, error, relatedData) {
    if(relatedData.plain)
        relatedData.plain = relatedData.plain?.toString() ?? relatedData.plain;
    await fetch("https://bentoapi.valleynas.uk:443/error", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            name,
            error,
            relatedData
        })
    }).catch(e => {
        console.error("[CRITICAL] backend: couldn't send errror log to server:", e);
    })
}

export { types, sameUser, senderror };