const discord = require('discord.js');
const { footer } = require('../../config.json');
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    perms: [],
    data: new SlashCommandBuilder()
        .setName('unlock')
        .setDescription('Unlocks the channel'),
    async execute(interaction) {

        const uannounceEmbed = new discord.MessageEmbed()
            .setColor('#b1fc03')
            .setTitle(`Channel Unlocked`)
            .setThumbnail(`${interaction.guild.iconURL() || ''}`)
            .setDescription(`This channel was manually unlocked!`)
            .setTimestamp()
            .setFooter({ text: `${footer} - Made By Cryptonized`, iconURL: interaction.guild.iconURL()})

        await interaction.channel.permissionOverwrites.edit(interaction.guild.roles.everyone, { SEND_MESSAGES: null });

        interaction.reply({embeds: [uannounceEmbed]});
    },
};