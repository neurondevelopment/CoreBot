module.exports = {
    sendLogs: function(a) {
        const { modLogs, commandLogs } = require('./config.json').logs
        const all = require('./config.json').commands
        let log = null;
        for(var i in all) {
            if(i === a) {
                log = all[i]
            }
        }
        if(log.logs === 'mod') {
            return modLogs
        }
        else if(log.logs === 'command') {
            return commandLogs
        }
        else {
            return log.logs;
        }
    }

};