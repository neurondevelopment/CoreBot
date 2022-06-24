const Discord = require('discord.js')
const gamedig = require('gamedig')
const fs = require('fs')

module.exports = async (client) => {
    setInterval(() => {
        const config = JSON.parse(fs.readFileSync('./config.json')).modules["server-status"]
        config.servers.forEach(async server => {
            const channel = await client.channels.fetch(server.channelId).catch(err => { })
            const msgId = server.messageId || 'throwError'
            if(channel) {
                gamedig.query({ 
                    type: server.game,
                    host: server.ip,
                    port: server.port,
                    maxAttempts: 3
                }).then(async info => { 
                    const players = info.players.map(player => `${player.name.substring(0, 20)} ${(player.raw && player.raw.ping) ? `(${player.raw.ping}ms)` : ''}`) // Map player names to also include ping, and only allow 20 characters per name
                    if(players.length > 40) players.length = 40  // Only allow 40 players to be shown to not exceed the embed limits

                    const embed = new Discord.MessageEmbed()
                        .setTitle(info.name)
                        .addFields(
                            { name: 'Direct Connect', value: `${server.displayConnectionInfo.replace('{ip}', server.ip).replace('{port}', server.port)}`, inline: true},
                            { name: 'Players', value: `**${info.players.length}/${info.maxplayers}**`, inline: true},
                            { name: 'Connected Players', value: `\`\`\`${players.length > 0 ? players.join('\n') : 'No Players Online'}\`\`\``, inline: false}
                        )
                    const message = channel.messages.cache.get(msgId) || await channel.messages.fetch(msgId).catch(err => { })
                    if(message) { // If message already exists, edit the existing one
                        message.edit({ embeds: [embed] })
                    }
                    else { // If message doesn't exist, send a new one and update the config with it's ID
                        const msg = await channel.send({ embeds: [embed]})
                        const fullConfig = JSON.parse(fs.readFileSync('./config.json'))
                        fullConfig.modules["server-status"].servers[config.servers.indexOf(server)].messageId = msg.id
                        fs.writeFileSync('./config.json', JSON.stringify(fullConfig, null, 4))
                    }
                }).catch(async err => { // Caught error so we assume the server is offline
                    const embed = new Discord.MessageEmbed()
                        .setColor('RED')
                        .setDescription(`Server is offline`)

                    const message = channel.messages.cache.get(msgId) || await channel.messages.fetch(msgId).catch(err => { })
                    if(message) { // If message already exists, edit the existing one
                        message.edit({ embeds: [embed] })
                    }
                    else { // If message doesn't exist, send a new one and update the config with it's ID
                        const msg = await channel.send({ embeds: [embed]})
                        const fullConfig = JSON.parse(fs.readFileSync('./config.json'))
                        fullConfig.modules["server-status"].servers[config.servers.indexOf(server)].messageId = msg.id
                        fs.writeFileSync('./config.json', JSON.stringify(fullConfig, null, 4))
                    }
                })

            }
        })
    }, 20000)
}
