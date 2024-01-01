const fs = require('fs');
const Logger = require('../utils/logger.js');
const express = require('express');
const cookieParser = require('cookie-parser');
const { get_config } = require('../utils/config.js');
const { unserialize } = require('php-unserialize');

const conf = get_config();
const log = new Logger('error.js', '../logs', '[{script}, {timestamp}] - ');

const app = express();
const port = 3000;

app.use(express.json());
app.use(cookieParser());
app.use((req, res, next) => {
    if(conf.allowed_hosts == '*') {
        res.header('Access-Control-Allow-Origin', '*');
    } else {
        let origin = req.get('Origin').replaceAll(/http[s]*:\/\//, "").replaceAll(/:[0-9]+/, "");
        if(conf.allowed_hosts.includes(origin))
            res.header('Access-Control-Allow-Origin', origin);
    }
    res.header('Access-Control-Allow-Methods', 'POST');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');
    return next();
});

app.post('/error', async (req, res) => {
    const cookies = req.cookies;
    
    // Resolve/refuse
    let resolve = (code, info) => res.status(code).json({status: "success", info});
    let refuse = (code, reason) => res.status(code).json({status: "error", reason});
    
    if(!req.body || req.headers['content-type'] !== 'application/json')
        return refuse(400, "invalid body");
    if(!cookies) return refuse(401, "invalid cookies");

    let sessionId = cookies.PHPSESSID;
    let session;
    try {
        session = fs.readFileSync(conf.session_path + "sess_" + sessionId, 'utf8');
        session = unserialize(session);
    } catch(_) {
        return refuse(503, "failed to get session");
    }
    
    let error = req.body.error;
    log.log('error.log', 'Error log:\n' + error);

    resolve(200, "logged");
});

app.listen(port, () => log.log('error.log', 'Server started on port ' + port));