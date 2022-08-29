let serverLogChannel
const { serverLogs } = require('../config.json').logs
const { EmbedBuilder } = require('discord.js')

module.exports = {
    name: 'messageDelete',
    enabled: true,
    async execute(message) {
        if(!message) return;
        if(!message.content) return;
        if(!serverLogChannel) serverLogChannel = await message.client.channels.fetch(serverLogs).catch(err => { })

        try {
            if(message.author.bot) return;
            const delEmbed = new EmbedBuilder()
                .setColor('#FF0000')
                .setAuthor({ name: `${message.author.tag}`, iconURL: message.author.displayAvatarURL()})
                .addFields([
                    { name: 'Message Deleted', value: message.content },
                    { name: 'Channel', value: `<#${message.channel.id}>`}
                ])
                .setTimestamp()
                .setFooter({ text: `Author ID: ${message.author.id}`, iconURL: message.guild.iconURL()})
            if(serverLogChannel) serverLogChannel.send({embeds: [delEmbed]});
        }
        catch (err) {
            console.log(`caught logging error messageDelete ${err}`);
        }
    }
}