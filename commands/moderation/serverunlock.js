const { sendLogs } = require('../../utils')
const { db } = require('../../index')
const {  footer } = require('../../config.json');
const { EmbedBuilder, SlashCommandBuilder } = require('discord.js')

module.exports = {
    perms: [],
    requirePermEmbed: true,
    data: new SlashCommandBuilder()
        .setName('serverunlock')
        .setDescription('Unlocks the server'),
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true })
        const all = await db.get(`settings_${interaction.guild.id}.locked`);
        for(let i = 0; i < all.length; i++) {
            const channelId = all[i]
            const channel = await interaction.client.channels.fetch(channelId).catch(err => {})
            if(channel) {
                await channel.permissionOverwrites.edit(interaction.channel.guild.roles.everyone, {
                    SendMessages: null,
                });
            }
        }

        const embed = new EmbedBuilder()
            .setColor('Green')
            .setTitle(`Server Unlocked`)
            .setThumbnail(`${interaction.guild.iconURL() || ''}`)
            .setDescription(`This server was unlocked`)
            .setTimestamp()
            .setFooter({ text: footer, iconURL: interaction.guild.iconURL()})

        interaction.editReply({embeds: [embed]});

        const logEmbed = new EmbedBuilder()
            .setColor('Green')
            .setTitle('Server Locked')
            .setDescription(`The server was successfully unlocked!`)
            .setThumbnail(interaction.guild.iconURL())
            .addFields(
                { name: '\u200B', value: '\u200B' },
                { name: 'Moderator', value: `${interaction.user.tag}`, inline: true },
                { name: 'Moderator ID', value: `${interaction.user.id}`, inline: true }
            )
            .setTimestamp()
            .setFooter({ text: footer, iconURL: interaction.guild.iconURL()})

        const loggingChannel = await interaction.client.channels.fetch(sendLogs('lockdown')).catch(err => { })
        if(loggingChannel) loggingChannel.send({embeds: [logEmbed]})
    }
};
