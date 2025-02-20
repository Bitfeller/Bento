const sql = require('../utils/sql.js');
const Logger = require('../utils/logger.js');
const schedule = require('node-schedule');

const log = new Logger('backup.js', '../logs', '[{script}, {timestamp}] - ');

async function copy(src, dest, src_db) {
    let tables = await sql.query("SHOW TABLES", src);
    for(let i = 0; i < tables.length; i++) {
        let table = tables[i][`Tables_in_${src_db}`];
        await sql.query(`CREATE TABLE IF NOT EXISTS ${table} LIKE ${src_db}.${table}`, dest);
        await sql.query(`INSERT INTO ${table} SELECT * FROM ${src_db}.${table}`, dest);
    }
}
async function backup() {
    try {
        const bento = await sql.connect('bento');
        const bento_backup = await sql.connect('bento-backup');
        await copy(bento, bento_backup, 'bento');
        bento.end();
        bento_backup.end();
        log.log('backup.log', 'Backup completed for MySQL server.');
    } catch(e) {
        log.log('backup.log', `[!] Failed to backup MySQL server: ${e} [!]`);
    }
}

const _ = schedule.scheduleJob("0 0 12 * * *", backup);
backup();