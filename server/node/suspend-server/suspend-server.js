const fs = require('fs');
const Logger = require('../utils/logger.js');

const log = new Logger('shutdown-server.js', '../logs', '');

function set_htaccess(name) {
    try { fs.unlinkSync('../../../.htaccess'); } catch(_) {}
    fs.copyFileSync(`./htaccess/${name}.htaccess`, '../../../.htaccess');
}
function get_state() {
    let state = fs.readFileSync('../../conf/config-suspend-server', 'utf8');
    return parseInt(state);
}

fs.watch('../../conf/config-suspend-server', (_, __) => {
    let state = get_state();
    if (state == 1) {
        log.info('suspend-server.log', 'Server was suspended.');
        set_htaccess('suspend');
    } else if (state == 0) {
        log.info('suspend-server.log', 'Server is now active.');
        set_htaccess('normal');
    }
});

set_htaccess(get_state() == 1 ? 'suspend' : 'normal');