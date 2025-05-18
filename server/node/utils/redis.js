const Redis = require('ioredis');
const { get_config } = require('./config.js');
const Logger = require('./logger.js');

const config = get_config();
const log = new Logger('redis.js', '../logs', '[{script}, {timestamp}] - ');

class RedisW {
    constructor() {
        this.redis = new Redis({
            host: config.redis.host,
            port: config.redis.port,
            password: config.redis.password,
        });
    }
    set(key, val) {
        return new Promise((res, rej) => {
            this.redis.set(key, val, (err, data) => {
                if (err) {
                    log.log('redis.log', `[!] Failed to set key \`${key}\` with value \`${val}\`: ${err}`);
                    rej(err);
                } else {
                    res(data);
                }
            });
        });
    }
    get(key) {
        return new Promise((res, rej) => {
            this.redis.get(key, (err, data) => {
                if (err) {
                    log.log('redis.log', `[!] Failed to get key \`${key}\`: ${err}`);
                    rej(err);
                } else {
                    res(data);
                }
            });
        });
    }
    del(key) {
        return new Promise((res, rej) => {
            this.redis.del(key, (err, data) => {
                if (err) {
                    log.log('redis.log', `[!] Failed to delete key \`${key}\`: ${err}`);
                    rej(err);
                } else {
                    res(data);
                }
            });
        });
    }
    on(event, cb) {
        this.redis.on(event, cb);
    }
    close() {
        this.redis.quit();
    }
}

module.exports = RedisW;