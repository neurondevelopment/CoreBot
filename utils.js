const { modLogs, commandLogs } = require('./config.json').logs
const all = require('./config.json').commands

module.exports = {
    sendLogs: function(commandName) {
        if(all[commandName].logs === 'mod') {
            return modLogs
        }
        else if(all[commandName].logs === 'command') {
            return commandLogs
        }
        else {
            return all[commandName].logs;
        }
    },
    generateCode: function(length) {
        var result           = '';
        var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        var charactersLength = characters.length;
        for ( var i = 0; i < length; i++ ) {
          result += characters.charAt(Math.floor(Math.random() * charactersLength));
       }
       return result;
    },
    error: function(origin, message) {
        console.log(`\x1b[36m[${origin}]\x1b[0m \x1b[31m${message}\x1b[0m`)
    },
    checkPerms: function(member, target) {
        if(target.id === member.id) return 'You cannot do run this command on yourself!'
        if(target.permissions.has('Administrator')) return `You cannot run this command on an administrator`
        if(!target.bannable) return `I do not have permission to ban this user`
        if(member.roles.highest.position < target.roles.highest.position) return `That user has a role higher than you!`
    },
    formatTimestamp: function(timestamp) {
        const date = new Date(timestamp)
        const day = date.getDate();
        const month = date.getMonth() + 1;
        const year = date.getFullYear();
        const hour = date.getHours();
        const minute = date.getMinutes();
        return `${day}/${month}/${year} ${hour}:${minute}`
    }

};