const { footer } = require('../../config.json');
const { EmbedBuilder, SlashCommandBuilder } = require('discord.js')

module.exports = {
    perms: [],
    requirePermEmbed: true,
    data: new SlashCommandBuilder()
        .setName('unlock')
        .setDescription('Unlocks the channel'),
    async execute(interaction) {

        const uannounceEmbed = new EmbedBuilder()
            .setColor('#b1fc03')
            .setTitle(`Channel Unlocked`)
            .setThumbnail(`${interaction.guild.iconURL() || ''}`)
            .setDescription(`This channel was manually unlocked!`)
            .setTimestamp()
            .setFooter({ text: `${footer} - Made By Cryptonized`, iconURL: interaction.guild.iconURL()})

        await interaction.channel.permissionOverwrites.edit(interaction.guild.roles.everyone, { SendMessages: null });

        interaction.reply({embeds: [uannounceEmbed]});
    },
};