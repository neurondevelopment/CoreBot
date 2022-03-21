const discord = require('discord.js');
const ms = require('ms');
const {  footer } = require('../../config.json');
const { SlashCommandBuilder } = require('@discordjs/builders');
const utils = require('../../utils')

module.exports = {
    perms: [],
    data: new SlashCommandBuilder()
        .setName('lockdown')
        .setDescription('Prevent @everyone from speaking until the specified time is over, or manually overwritten')
        .addStringOption((option) => option.setName('time').setDescription('How long to lock the channel for').setRequired(false)),
    async execute(interaction) {
        const target = interaction.channel;
        const time = interaction.options.get('time') ? interaction.options.get('time').value : '10m';
        if(!ms(time)) return interaction.reply({ content: 'Invalid time specified!', ephemeral: true });

        await target.permissionOverwrites.edit(interaction.channel.guild.roles.everyone, { SEND_MESSAGES: false });

        const announceEmbed = new discord.MessageEmbed()
            .setColor('#f57c73')
            .setTitle(`Channel Locked`)
            .setThumbnail(`${interaction.guild.iconURL() || ''}`)
            .setDescription(`This channel was locked for ${time}`)
            .setTimestamp()
            .setFooter({ text: footer, iconURL: interaction.guild.iconURL()})

        const uannounceEmbed = new discord.MessageEmbed()
            .setColor('#b1fc03')
            .setTitle(`Channel Unlocked`)
            .setThumbnail(`${interaction.guild.iconURL() || ''}`)
            .setDescription(`This channel was unlocked after ${time}`)
            .setTimestamp()
            .setFooter({ text: footer, iconURL: interaction.guild.iconURL()})

        interaction.reply({embeds: [announceEmbed]})

        setTimeout(async () => {
            await target.permissionOverwrites.edit(interaction.channel.guild.roles.everyone, { SEND_MESSAGES: null });
            interaction.channel.send({embeds: [uannounceEmbed]});
        }, ms(time) );

        const logEmbed = new discord.MessageEmbed()
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

            const loggingchannel = await interaction.client.channels.fetch(utils.sendLogs('lockdown')).catch(err => { })
            if(loggingchannel) loggingchannel.send({embeds: [logEmbed]})
    },
};