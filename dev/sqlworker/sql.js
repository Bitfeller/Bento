const fs = require('fs');
const mysql = require('mysql');

const conf = fs.existsSync("../../server/conf/local-config.json") ? require('../../server/conf/local-config.json') : require('../../server/conf/config.json');

let conn;

function connect() {
    return new Promise((res, rej) => {
        conn = mysql.createConnection({
            host: conf.mysql.host,
            user: conf.mysql.user,
            password: conf.mysql.password,
            database: conf.mysql.db
        })
        conn.connect(err => {
            if(err) {
                rej();
                throw err;
            }
            console.log("Connected to db.");
            res(conn);
        });
    });
}
function query(q) {
    return new Promise((resolve, rej) =>
        conn.query(q, (err, res) => {
            if(err) {
                rej();
                throw err;
            }
            resolve(res);
        })
    );
}

module.exports = { connect, query };