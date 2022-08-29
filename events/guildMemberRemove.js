let joinLeaveLogChannel
const { EmbedBuilder } = require('discord.js')
const { leaveChannel, leaveMessage } = require('../config.json')
const { joinLeaveLogs } = require('../config.json').logs

module.exports = {
    name: 'guildMemberRemove',
    enabled: true,
    async execute(member) {
        if(!joinLeaveLogChannel) joinLeaveLogChannel = await member.client.channels.fetch(joinLeaveLogs).catch(err => { })
        const channel = await member.client.channels.fetch(leaveChannel).catch(err => { })
        if(channel) {
            const mes = leaveMessage.split('{[USER]}').join(`<@${member.id}> (${member.user.tag})`).split('{[SERVER]}').join(`${member.guild.name}`)
            channel.send(mes).catch(err => { })
        }
        const memberRoles = member.roles.cache.map(r => `${r}`).filter(r => r !== '@everyone').join(' ') || 'None'

        try {
            const delEmbed = new EmbedBuilder()
                .setColor('#E12B09')
                .setAuthor({ name: `${member.user.username} - Left Server`, iconURL: member.user.displayAvatarURL()})
                .addFields([
                    { name: 'Account Tag', value: member.user.tag },
                    { name: 'Join Date', value: `${member.joinedAt}`},
                    { name: 'Roles', value: memberRoles, inline: true }
                ])
                .setTimestamp()
                .setFooter({ text: `User ID: ${member.user.id}`, iconURL: member.guild.iconURL()});
            if(joinLeaveLogChannel) joinLeaveLogChannel.send({embeds: [delEmbed]});
        }
        catch (err) {
            console.log(`caught error at guildMemberRemove ${err}`)
        }
    }
}