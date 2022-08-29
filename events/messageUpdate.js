let serverLogChannel
const { serverLogs } = require('../config.json').logs
const { EmbedBuilder } = require('discord.js')

module.exports = {
    name: 'messageUpdate',
    enabled: true,
    async execute(oldMessage, newMessage) {
        if(!serverLogChannel) serverLogChannel = await oldMessage.client.channels.fetch(serverLogs).catch(err => { })
        if(!oldMessage) return;
        if(!oldMessage.content) return;
        if(!newMessage) return;
        if(!newMessage.content) return;
        let mes = oldMessage.content;
        let mes2 = newMessage.content;

        if(oldMessage.content.length > 1024) {
            mes = '[Message too long to display]';
        }
        if(newMessage.content.length > 1024) {
            mes2 = '[Message too long to display]';
        }

        try {
            if(oldMessage.author.bot) return;
            if(oldMessage.content === newMessage.content) return;
            const delEmbed = new EmbedBuilder()
                .setColor('#FF8F00')
                .setAuthor({ name: `${oldMessage.author.tag}`, iconURL: oldMessage.author.displayAvatarURL()})
                .addFields([
                    { name: 'Original Message', value: mes },
                    { name: 'New Message', value: mes2 },
                    { name: 'Channel', value: `${oldMessage.channel.name} - [Go To](https://discordapp.com/channels/${oldMessage.guild.id}/${oldMessage.channel.id}/${newMessage.messageID})` }
                ])
                .setTimestamp()
                .setFooter({ text: `Author ID: ${oldMessage.author.id}`, iconURL: oldMessage.guild.iconURL()});
            if(serverLogChannel) serverLogChannel.send({embeds: [delEmbed]});
        }
        catch (err) {
            console.log(`error at messageUpdate ${err}`);
        }
    }
}