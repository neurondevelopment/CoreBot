let serverLogChannel
const { serverLogs } = require('../config.json').logs
const { EmbedBuilder } = require('discord.js')
const { footer } = require('../config.json')

module.exports = {
    name: 'roleUpdate',
    enabled: true,
    async execute(oldRole, newRole) {
        if(!serverLogChannel) serverLogChannel = await oldRole.client.channels.fetch(serverLogs).catch(err => { })
        try{
            if (oldRole.name === newRole.name) return;
            const delEmbed = new EmbedBuilder()
                .setColor('#FFBA33')
                .setAuthor({ name: 'Role Updated'})
                .addFields([
                    { name: 'Original Name', value: `\`${oldRole.name}\`` },
                    { name: 'New Name', value: `\`${newRole.name}\`` }
                ])
                .setTimestamp()
                .setFooter({ text: `${footer} - Made By Cryptonized`, iconURL: oldRole.guild.iconURL()})
            if(serverLogChannel) serverLogChannel.send({embeds: [delEmbed]});
        }
        catch (err) {
            console.log(`caught logging error roleUpdate ${err}`);
        }
    }
}