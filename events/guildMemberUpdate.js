let serverLogChannel
const { EmbedBuilder } = require('discord.js')
const { serverLogs } = require('../config.json').logs

module.exports = {
    name: 'guildMemberUpdate',
    enabled: true,
    async execute(oldMember, newMember) {
        if(!oldMember) return;
        if(!newMember) return;
        if(!serverLogChannel) serverLogChannel = await oldMember.client.channels.fetch(serverLogs).catch(err => { })
        try{
            if(oldMember.displayName !== newMember.displayName) {
                const delEmbed = new EmbedBuilder()
                .setColor('#03adfc')
                .setAuthor({ name: `${oldMember.user.tag} - Updated Nickname`, iconURL: oldMember.user.displayAvatarURL()})
                .addFields([
                    { name: 'Original Username', value: `\`${oldMember.displayName}\`` },
                    { name: 'New Username', value: `\`${newMember.displayName}\`` }
                ])
                .setTimestamp()
                .setFooter({text: `User ID: ${oldMember.id}`, iconURL: newMember.guild.iconURL()})
                if(serverLogChannel) serverLogChannel.send({embeds: [delEmbed]});
            }
    
            if (oldMember.roles.cache.size > newMember.roles.cache.size) {
                // Creating an embed message.
                const Embed = new EmbedBuilder()
                .setColor('Red')
                .setAuthor({ name: newMember.user.tag, iconURL: newMember.user.displayAvatarURL() })
                .setTimestamp()
                .setFooter({text: `User ID - ${oldMember.user.id}`, iconURL: newMember.guild.iconURL()})
    
                // Looping through the role and checking which role was removed.
                oldMember.roles.cache.forEach(role => {
                    if (!newMember.roles.cache.has(role.id)) {
                        Embed.addFields([{ name: 'Role Removed', value: role.toString() }]);
                    }
                });
    
                if(serverLogChannel) serverLogChannel.send({embeds: [Embed]});
            }
            else if (oldMember.roles.cache.size < newMember.roles.cache.size) {
                const Embed = new EmbedBuilder()
                    .setColor("Green")
                    .setAuthor({ name: newMember.user.tag, iconURL: newMember.user.displayAvatarURL()})
                    .setTimestamp()
                    .setFooter({text: `User ID - ${oldMember.user.id}`, iconURL: newMember.guild.iconURL()})
    
                // Looping through the role and checking which role was added.
                newMember.roles.cache.forEach(role => {
                    if (!oldMember.roles.cache.has(role.id)) {
                        Embed.addFields([{ name: "Role Added", value: role.toString() }]);
                    }
                });
    
                if(serverLogChannel) serverLogChannel.send({embeds: [Embed]});
            }
        }
        catch (err) {
           console.log(`caught logging error guildMemberUpdate ${err}`);
        }
    }
}