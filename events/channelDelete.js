let serverLogChannel
const { EmbedBuilder } = require('discord.js')
const { serverLogs } = require('../config.json').logs

module.exports = {
    name: 'channelDelete',
    enabled: true,
    async execute(channel) {
        if(!serverLogChannel) serverLogChannel = await channel.client.channels.fetch(serverLogs).catch(err => { })
        try{
            const delEmbed = new EmbedBuilder()
                .setColor('#03adfc')
                .addFields([{ name: 'Channel Deleted', value: `\`${channel.name}\`` }])
                .setTimestamp()
                .setFooter({text: `Channel ID: ${channel.id}`, iconURL: channel.guild.iconURL()})
            if(serverLogChannel) serverLogChannel.send({embeds: [delEmbed]});
        }
        catch (err) {
           console.log(`caught logging error channelDelete ${err}`);
        }
    }
}