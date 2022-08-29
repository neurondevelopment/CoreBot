const ms = require('ms');
const {  footer } = require('../../config.json');
const { EmbedBuilder, SlashCommandBuilder } = require('discord.js')
const { sendLogs } = require('../../utils')

module.exports = {
    perms: [],
    requirePermEmbed: true,
    data: new SlashCommandBuilder()
        .setName('lockdown')
        .setDescription('Prevent @everyone from speaking until the specified time is over, or manually overwritten')
        .addStringOption((option) => option.setName('time').setDescription('How long to lock the channel for').setRequired(false)),
    async execute(interaction) {
        const target = interaction.channel;
        const time = interaction.options.getString('time') || '10m';
        if(!ms(time)) return interaction.reply({ content: 'Invalid time specified!', ephemeral: true });

        await target.permissionOverwrites.edit(interaction.channel.guild.roles.everyone, { SendMessages: false });

        const announceEmbed = new EmbedBuilder()
            .setColor('#f57c73')
            .setTitle(`Channel Locked`)
            .setThumbnail(`${interaction.guild.iconURL() || ''}`)
            .setDescription(`This channel was locked for ${time}`)
            .setTimestamp()
            .setFooter({ text: footer, iconURL: interaction.guild.iconURL()})

        const uannounceEmbed = new EmbedBuilder()
            .setColor('#b1fc03')
            .setTitle(`Channel Unlocked`)
            .setThumbnail(`${interaction.guild.iconURL() || ''}`)
            .setDescription(`This channel was unlocked after ${time}`)
            .setTimestamp()
            .setFooter({ text: footer, iconURL: interaction.guild.iconURL()})

        interaction.reply({embeds: [announceEmbed]})

        setTimeout(async () => {
            await target.permissionOverwrites.edit(interaction.channel.guild.roles.everyone, { SendMessages: null });
            interaction.channel.send({embeds: [uannounceEmbed]});
        }, ms(time) );

        const logEmbed = new EmbedBuilder()
            .setColor('#f57c73')
            .setTitle('Channel Locked')
            .setDescription(`Channel <#${target.id}> was successfully locked down!`)
            .setThumbnail(interaction.guild.iconURL())
            .addFields(
                { name: '\u200B', value: '\u200B' },
                { name: 'Channel', value: `<#${target.id}>`, inline: true },
                { name: 'Moderator', value: `${interaction.user.tag}`, inline: true },
                { name: 'Time', value: `${time}`, inline: true },
            )
            .setTimestamp()
            .setFooter({ text: footer, iconURL: interaction.guild.iconURL()});

            const loggingChannel = await interaction.client.channels.fetch(sendLogs('lockdown')).catch(err => { })
            if(loggingChannel) loggingChannel.send({embeds: [logEmbed]})
    },
};