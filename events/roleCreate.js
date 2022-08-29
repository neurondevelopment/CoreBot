let serverLogChannel
const { serverLogs } = require('../config.json').logs
const { EmbedBuilder } = require('discord.js')

module.exports = {
    name: 'roleCreate',
    enabled: true,
    async execute(role) {
        if(!serverLogChannel) serverLogChannel = await role.client.channels.fetch(serverLogs).catch(err => { })
        try {
            const delEmbed = new EmbedBuilder()
                .setColor('#00FA9A')
                .addFields([{ name: 'Role Created', value: `\`${role.name}\`` }])
                .setTimestamp()
                .setFooter({ text: `Role ID: ${role.id}`, iconURL: role.guild.iconURL()})
        
            if(serverLogChannel) serverLogChannel.send({embeds: [delEmbed]});
        }
        catch (err) {
           console.log(`caught logging error roleCreate ${err}`);
        }
    }
}