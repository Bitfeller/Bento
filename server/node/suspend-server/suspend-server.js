const fs = require('fs');
const Logger = require('../utils/logger.js');

const log = new Logger('shutdown-server.js', '../logs');
let lastChange = Date.now();

function set_htaccess(name) {
    try { fs.unlinkSync('../../../.htaccess'); } catch(_) {}
    fs.copyFileSync(`./htaccess/${name}.htaccess`, '../../../.htaccess');
}
function get_state() {
    let state = fs.readFileSync('../../conf/config-suspend-server', 'utf8');
    return parseInt(state) ?? 1;
}

function update() {
    if(Date.now() - lastChange < 1) return;
    lastChange = Date.now();

    let state = get_state();
    if (state == 1) {
        log.log('suspend-server.log', 'Server was suspended.');
        set_htaccess('suspend');
    } else if (state == 0) {
        log.log('suspend-server.log', 'Server is now active.');
        set_htaccess('normal');
    }
}

fs.watch('../../conf/config-suspend-server', (event, _) => {
    if(event == 'change') update();
});
update();