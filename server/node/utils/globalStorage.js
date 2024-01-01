const fs = require('fs');
const Logger = require('./logger.js');

const log = new Logger('globalStorage.js', '../logs', '[{script}, {timestamp}, {level}] - ');

class GlobalStorage {
    constructor(db, create) {
        this.data = {};
        this.path = 'globalStorage/' + db + '.json';
        if(create == true) {
            this.create();
        } else {
            this.load();
        }
    }

    load() {
        try {
            this.data = JSON.parse(fs.readFileSync('../../' + this.path));
        } catch(e) {
            log.log('globalStorage.log', `Couldn't load data from ${this.path}: ${e}`, { level: 'ERROR' });
        }
    }
    create() {
        try {
            fs.writeFileSync('../../' + this.path, '{}');
            this.data = {};
        } catch(e) {
            log.log('globalStorage.log', `Couldn't create db in ${this.path}: ${e}`, { level: 'ERROR' });
        }
    }
    write() {
        try {
            fs.writeFileSync('../../' + this.path, JSON.stringify(this.data));
        } catch(e) {
            log.log('globalStorage.log', `Couldn't write db to ${this.path}: ${e}`, { level: 'ERROR' });
        }
    }

    get(key) {
        return this.data[key];
    }
    set(key, value) {
        this.data[key] = value;
        this.write();
    }
    remove(key) {
        delete this.data[key];
        this.write();
    }
    clear() {
        this.data = {};
        this.write();
    }
    set_temp(key, value) {
        this.data[key] = value;
    }
    remove_temp(key) {
        delete this.data[key];
    }
    clear_temp() {
        this.data = {};
    }
}

module.exports = GlobalStorage;