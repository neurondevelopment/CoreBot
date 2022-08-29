let serverLogChannel
let joinLeaveLogChannel
const { EmbedBuilder } = require('discord.js')
const { autoroles, joinChannel, joinMessage } = require('../config.json')
const { serverLogs, joinLeaveLogs } = require('../config.json').logs

module.exports = {
    name: 'guildMemberAdd',
    enabled: true,
    async execute(member) {
        if(!serverLogChannel) serverLogChannel = await member.client.channels.fetch(serverLogs).catch(err => { })
        if(!joinLeaveLogChannel) joinLeaveLogChannel = await member.client.channels.fetch(joinLeaveLogs).catch(err => { })
        if(autoroles) {
            const rr = [];
            autoroles.forEach(role => {
                try {
                    member.roles.add(role)
                    rr.push(role)
                }
                catch (err) { }
            })
            const embed = new EmbedBuilder()
                .setColor('#f5cb42')
                .setAuthor({ name: `Autorole Success`})
                .setDescription(`Successfully added roles: <@&${rr.join('> <@&')}> to user: ${member.user.tag}`)
                .setTimestamp()
                .setFooter({ text: `${footer} - Made By Cryptonized`, iconURL: member.guild.iconURL()})
            if(serverLogChannel) serverLogChannel.send({embeds: [embed]})
        }
        const channel = await member.client.channels.fetch(joinChannel).catch(err => {})
        if(channel) {
            const mes = joinMessage.split('{[USER]}').join(`<@${member.id}>`).split('{[SERVER]}').join(`${member.guild.name}`)
            const mssembed = new EmbedBuilder()
            .setTitle("Welcome!")
            .setColor('#000000')
            .setThumbnail(member.guild.iconURL())
                .setDescription(mes)
            .setTimestamp()
    
            channel.send({embeds: [mssembed]});
        }
        const accountAge = Math.round((Date.now() - member.user.createdAt) / 86400000);
        const delEmbed2 = new EmbedBuilder()
            .setColor('#48EC73')
            .setAuthor({ name: `${member.user.username} - Joined Server`, iconURL: member.user.displayAvatarURL()})
            .addFields([
                { name: 'Account Tag', value: member.user.tag },
                { name: 'Account Age', value: `${accountAge} days`},
                { name: 'Created On', value: member.user.createdAt.toString() }
            ])
            .setTimestamp()
            .setFooter({ text: `User ID: ${member.user.id}`, iconURL: member.guild.iconURL()});
        if(joinLeaveLogChannel) joinLeaveLogChannel.send({embeds: [delEmbed2]});
    }
}