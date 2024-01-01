const fs = require('fs');

class Logger {
    constructor(scriptName = "<unknown>", logSrc = "", metadata = "[{script}, {timestamp}] - ") {
        this.logSrc = logSrc;
        this.metadata = metadata;
        this.scriptName = scriptName;
    }
    format(log, metadata = {}) {
        let pre = this.metadata
            .replaceAll("{timestamp}", new Date().toISOString())
            .replaceAll("{script}", this.scriptName);
        for(let key in metadata)
            pre = pre.replaceAll(`{${key}}`, metadata[key]);
        return `${pre}${log}`;
    }
    setLogSrc(src) {
        this.logSrc = src;
    }
    setScriptName(name = "<unknown>") {
        this.scriptName = name;
    }
    setMetadata(metadata = "[{script}, {timestamp}] - ") {
        this.metadata = metadata;
    }
    log(file = "misc.log", log = "", metadata = {}) {
        if(this.logSrc == "")
            return false;
        
        let contnt = this.format(log, metadata);
        try {
            fs.appendFileSync(`${this.logSrc}/${file}`, `${contnt}\n`);
        } catch(err) {
            console.error(`[!] Error logging to ${file}: ${err}`);
            return false;
        }

        return true;
    }
}

module.exports = Logger;