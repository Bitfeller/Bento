
const express = require('express');
const webpush = require('web-push');
const schedule = require('node-schedule');

const app = express();
const port = 3000;

const subList = {};

webpush.setVapidDetails(
    'https://bento.valleynas.uk/report',
    'BK2goia_RGT26Nq5Blmc9yrejx_Cq4GpuWUcwZ9sn5DsaT8HfFqyql6Ss1D5K3T1W9Tow2JIVzigsVI4g-UyQBE', // public key
    'rGqFP5802HeRpJDa2KrCrEqBBVHPPbWZRk9rYAouVJQ' // private key
)


app.use(express.json());
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'POST');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.header('Access-Control-Allow-Credentials', true);
    return next();
});

app.post('/notify', async (req, res) => {
    console.log("RECEIVED!");
    const ip = req.ip;
    // Verify request
    if(!ip) {
        res.status(401).json({reason: "invalid authentication."});
        return res;
    }
    if(!req.body || req.headers['content-type'] !== "application/json") {
        res.status(400).json({reason: "invalid body."});
        return res;
    }
    if(subList[ip]) {
        // Check if the user actually wants to unsubscribe
        if(req.body.unsubscribe) {
            delete subList[ip];
            res.status(200).json({status: "success", info: "subscription destroyed."});
            return res;
        }
        res.status(208).json({reason: "subscription exists."});
        return res;
    }
    if(!req.body.subscription) {
        res.status(400).json({reason: "invalid body."});
        return res;
    }
    const sub = req.body.subscription;
    if(!sub.keys) {
        res.status(400).json({reason: "invalid body."});
        return res;
    }
    if(!sub.keys.auth || !sub.keys.p256dh) {
        res.status(400).json({reason: "invalid body."});
        return res;
    }
    // Add subscription to list
    subList[ip] = sub;
    res.status(201).json({status: "success"});
});
app.listen(port, () => {
    console.log("server-notif-main.js is actively listening for /notify on port " + port + ".");
});

const job = schedule.scheduleJob("0 0 12 * * *", () => {
    for(let i = 0; i < subList.length; i++) {
        webpush.sendNotification(subList[i], JSON.stringify({
            type: "reviewnotifcheck"
        }))
    }
});