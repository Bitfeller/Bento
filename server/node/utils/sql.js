const { get_config } = require('./config.js');
const { Logger } = require('./logger.js');
const mysql = require('mysql');

const conf = get_config();

const sql = (() => {
    let conn;
    let logger = new Logger("sql.js", "../logs", "[{script}, {timestamp}, {level}] - ");
    let verbose = false;

    // Set up logger
    function setVerbose(v) {
        verbose = v;
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
                    logger.log("sql.log", `Couldn't establish connection to ${db}: ${e}`, { level: "ERROR" });
                    return;
                }
                if(verbose) logger.log("sql.log", `Connected to MySQL server: ${db}`, { level: "INFO" });
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
                    logger.log("sql.log", `Error executing query (${str}): ${e}`, { level: "ERROR" });
                    return;
                }
                if(verbose) logger.log("sql.log", `Executed query (${str})`, { level: "INFO" });
                res(r);
            })
        });
    }
    function alive(c = conn) {
        return new Promise((res, rej) => {
            c.ping(e => {
                if(e) {
                    rej(e);
                    logger.log("sql.log", `Couldn't ping MySQL server (connection lost?): ${e}`, { level: "WARN" });
                    return;
                }
                res(true);
            });
        });
    }
    function end(c = conn) {
        c.end();
        if(verbose) logger.log("sql.log", `Disconnected from MySQL server.`, { level: "INFO" });
        if(c == conn) conn = null;
    }

    return {
        setVerbose,
        connect,
        state,
        query,
        alive,
        end
    }
})();

module.exports = sql;