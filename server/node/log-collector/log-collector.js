const fs = require('fs');
const Logger = require('../utils/logger.js');
const schedule = require('node-schedule');

const log = new Logger('log-collector.js', '../logs', '[{script}, {timestamp}] - ');

// Runs every week
const _ = schedule.scheduleJob("0 0 0 * * 0", async () => {
    try {
        log.log('log-collector-info.log', 'Log collection started.');
        fs.readdirSync('../../php-db/info').map(file => {
            let num = parseInt(fs.readFileSync('../../php-db/info/' + file, 'utf8'));
            log.log('log-collector.log', 'Collected from ' + file + ': ' + num);
            fs.writeFileSync('../../php-db/info/' + file, '0');
        })
        log.log('log-collector-info.log', 'Log collection completed.');
    } catch(e) {
        log.log('log-collector-info.log', `[!] Failed to collect logs: ${e} [!]`);
    }
});