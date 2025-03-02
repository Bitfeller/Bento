const fs = require('fs');
const path = require('path');
const sql = require('../utils/sql.js');
const Logger = require('../utils/logger.js');
const schedule = require('node-schedule');
const { get_config } = require('../utils/config.js');

const config = get_config();
const log = new Logger('backup.js', '../logs', '[{script}, {timestamp}] - ');

async function copy(src, dest, src_db) {
    let tables = await sql.query("SHOW TABLES", src);
    for(let i = 0; i < tables.length; i++) {
        let table = tables[i][`Tables_in_${src_db}`];
        await sql.query(`CREATE TABLE IF NOT EXISTS ${table} LIKE ${src_db}.${table}`, dest);
        await sql.query(`INSERT INTO ${table} SELECT * FROM ${src_db}.${table}`, dest);
    }
}
function copydir(src, dest) {
    fs.readdirSync(src).forEach(file => {
        let srcPath = path.join(src, file);
        let destPath = path.join(dest, file);
        if(fs.lstatSync(srcPath).isDirectory()) {
            if(!fs.existsSync(destPath)) fs.mkdirSync(destPath);
            copy(srcPath, destPath);
        } else fs.copyFileSync(srcPath, destPath);
    });
}

async function backup() {
    try {
        const bento = await sql.connect('bento');
        const bento_backup = await sql.connect('bento-backup');
        await copy(bento, bento_backup, 'bento');
        bento.end();
        bento_backup.end();
        const src = path.join(__dirname, config.file_db);
        const dest = path.join(__dirname, config.file_db + '-backup');
        if(!fs.existsSync(dest)) fs.mkdirSync(dest);
        copydir(src, dest);
        log.log('backup.log', 'Backup completed for MySQL server.');
    } catch(e) {
        log.log('backup.log', `[!] Failed to backup MySQL server: ${e} [!]`);
    }
}

const _ = schedule.scheduleJob("0 0 12 * * *", backup);
backup();