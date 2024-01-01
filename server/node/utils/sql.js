const { get_config } = require('./config.js');
const mysql = require('mysql');

const conf = get_config();

const sql = (() => {
    let conn;
    let logger = false;

    function log(b) {
        logger = b;
    }
    function connect(db = conf.mysql.db) {
        return new Promise((res, rej) => {
            conn = mysql.createConnection({
                host: conf.mysql.host,
                user: conf.mysql.user,
                password: conf.mysql.password,
                database: db
            });
            conn.connect(e => {
                if(e) {
                    rej(e);
                    if(logger) console.error(e);
                    return;
                }
                if(logger) console.log("Connected to MySQL server.");
                res(conn);
            });
        });
    }
    function state(c = conn) {
        return c.state;
    }
    function query(str, c = conn) {
        return new Promise((res, rej) => {
            c.query(str, (e, r) => {
                if(e) {
                    rej(e);
                    if(logger) console.error(e);
                    return;
                }
                res(r);
            })
        });
    }
    function alive(c = conn) {
        return new Promise((res, rej) => {
            c.ping(e => {
                if(e) {
                    rej(e);
                    if(logger) console.error(e);
                    return;
                }
                res(true);
            });
        });
    }
    function end(c = conn) {
        c.end();
        if(logger) console.log("Disconnected from MySQL server.");
        if(c == conn) conn = null;
    }

    return {
        log,
        connect,
        state,
        query,
        alive,
        end
    }
})();

module.exports = sql;