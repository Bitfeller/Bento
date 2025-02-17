const fs = require('fs');

function get_config() {
    return fs.existsSync("../../conf/local-config.json") ? require('../../conf/local-config.json') : require('../../conf/config.json');
}

module.exports = { get_config };