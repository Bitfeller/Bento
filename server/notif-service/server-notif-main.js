
// Libraries
const express = require('express');
const webpush = require('web-push');
const schedule = require('node-schedule');
const fs = require('fs');
const { unserialize } = require('php-unserialize');
const cookieParser = require("cookie-parser");
const mysql = require('mysql');

// Subsave file
const subsave = require('./sub-save.json');

// Init app + port conf + sess path
const app = express();
const port = 3000;
const sess_path = "/var/lib/php/sessions"

// Init subList
const subList = subsave || {};

// Set vapid details + init MySQL server
webpush.setVapidDetails(
    'https://bento.valleynas.uk/report',
    'BK2goia_RGT26Nq5Blmc9yrejx_Cq4GpuWUcwZ9sn5DsaT8HfFqyql6Ss1D5K3T1W9Tow2JIVzigsVI4g-UyQBE', // public key
    'rGqFP5802HeRpJDa2KrCrEqBBVHPPbWZRk9rYAouVJQ' // private key
);
const conn = mysql.createConnection({
    host: "10.10.10.210",
    user: "remote",
    password: "*7ED54C88139248C900757D5540148B5AA2DBF4F2",
    database: "bento"
})
conn.connect((err) => {
    if(err) throw err;
    console.log("connected to db.");
});

// middleware
app.use(express.json());
app.use(cookieParser());
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'POST');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.header('Access-Control-Allow-Credentials', true);
    return next();
});

// post req.
app.post('/notify', async (req, res) => {
    const ip = req.ip;
    const cookies = req.cookies;
    // resolve/refuse functions
    let resolve = (code, info) => res.status(code).json({status: "success", info});
    let refuse = (code, reason) => res.status(code).json({reason});
    // Verify request (require ip + body)
    if(!ip) return refuse(401, "invalid authentication.");
    if(!req.body || req.headers['content-type'] !== "application/json") return refuse(400, "invalid body.");
    if(!cookies) return refuse(400, "invalid cookies.");
    // Require session
    if(!cookies.PHPSESSID || typeof cookies.PHPSESSID == "undefined") return refuse(400, "invalid PHPSESSID.");
    // Check for existing subscription
    if(subList[sessionId]) {
        // Check if the user wants to unsubscribe
        if(req.body.unsubscribe) {
            delete subList[sessionId];
            return resolve(200, "subscription destroyed");
        }
        return resolve(208, "subscription exists");
    }
    // Find session
    let sessionId = cookies.PHPSESSID;
    let session;
    try {
        session = fs.readFileSync(sess_path + "sess_" + sessionId, {encoding: 'utf-8'});
        session = unserialize(session);
    } catch(e) {
        return refuse(503, "failed to get session.");
    }
    // Check for subscription object
    if(!req.body.subscription) return refuse(400, "invalid body");
    const sub = req.body.subscription;
    if(!sub.keys) return refuse(400, "invalid body.");
    if(!sub.keys.auth || !sub.keys.p256dh) return refuse(400, "invalid body.")
    // Add subscription to list
    subList[sessionId] = {
        sub,
        uid: session.uid
    };
    fs.writeFileSync('./server/notif-service/sub-save.json', JSON.stringify(subList));
    res.status(201).json({status: "success"});
});
app.listen(port, () => {
    console.log("server-notif-main.js is actively listening for /notify on port " + port + ".");
});

const getDeck = (d_id) => {
    return new Promise((res, rej) => {
        conn.query("SELECT * FROM decks WHERE id = " + d_id, (err, res, fields) => {
            if(err) throw err;
            if(res.length > 1) console.warn("Found more than one deck for a specific deck id; dump:\n\n" + res);
            let deck = res[0];
            res(deck);
        })
    })
}
const calculateNTR = (box, lastSeen) => {
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
const elapsedDays = {};
const job = schedule.scheduleJob("0 0 12 * * *", () => {
    const keys = Object.keys(subList);
    for(let i = 0; i < keys.length; i++) {
        let obj = subList[keys[i]];
        let sub = obj.sub;
        let uid = obj.uid;
        // Fetch details
        conn.query("SELECT * FROM users WHERE id = " + uid, async (err, res, fields) => {
            if(err) throw err;
            if(res.length > 1) console.warn("Found more than one user for a specific ID; dump:\n\n" + res);
            let user = res[0];
            user.reviews = JSON.parse(user.reviews);

            let deckcount = 0;
            let reviews = user.reviews;
            let r_keys = Object.keys(reviews);
            for(let i = 0; i < r_keys.length; i++) {
                let deck = await getDeck(parseInt(r_keys[i]));
                let count = 0;
                let c_keys = Object.keys(reviews[r_keys[i]]);
                for(let j = 0; j < c_keys.length; j++) {
                    let term = reviews[r_keys[i]][c_keys[j]];
                    if(calculateNTR(term.box, term.last)) count++;
                }
                count += Object.keys(deck.data.contnt).length - c_keys.length;
                if(count > 0) deckcount++;
            }
            
            if(!elapsedDays[keys[i]]) elapsedDays[keys[i]] = 0;
            elapsedDays[keys[i]] += 1;
            if(deckcount == 0) return;
            switch(user.notifsub) {
                case "0":
                    delete subList[keys[i]];
                    delete elapsedDays[keys[i]];
                    i -= 1;
                    fs.writeFileSync('./server/notif-service/sub-save.json', JSON.stringify(subList));
                    webpush.sendNotification(subList[keys[i]], JSON.stringify({
                        type: "unsubscribe"
                    }))
                    return;
                case "2":
                    if(elapsedDays % 3 != 0) return;
                break;
                case "3":
                    if(elapsedDays % 7 != 0) return;
                break;
            }
            webpush.sendNotification(subList[keys[i]], JSON.stringify({
                type: "reviewnotifcheck",
                deckcount
            }));
        })
    }
});