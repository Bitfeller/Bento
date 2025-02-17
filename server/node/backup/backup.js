const sql = require('../utils/sql.js');
const Logger = require('../utils/logger.js');
const schedule = require('node-schedule');

const log = new Logger('backup.js', '../logs', '[{script}, {timestamp}] - ');

async function copy(src, dest) {
    let tables = await src.query("SHOW TABLES");
    for(let i = 0; i < tables.length; i++) {
        let table = tables[i][`Tables_in_${src.database}`];
        await dest.query(`CREATE TABLE IF NOT EXISTS ${table} LIKE ${src.database}.${table}`);
        await dest.query(`INSERT INTO ${table} SELECT * FROM ${src.database}.${table}`);
    }
}

const _ = schedule.scheduleJob("0 0 12 * * *", async () => {
    try {
        const bento = sql.connect('bento');
        const bento_backup = sql.connect('bento-backup');
        await copy(bento, bento_backup);
        bento.end();
        bento_backup.end();
        log.log('backup.log', 'Backup completed for MySQL server.');
    } catch(e) {
        log.log('backup.log', `[!] Failed to backup MySQL server: ${e} [!]`);
    }
});