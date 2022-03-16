const discord = require('discord.js');
const { perms } = require('../../config.json').commands.announce
const { SlashCommandBuilder } = require('@discordjs/builders');
const { footer } = require('../../config.json')

module.exports = {
    perms: [],
    data: new SlashCommandBuilder()
        .setName('announce')
        .setDescription('Send an announcement to the channel')
        .addStringOption((option) => option.setName('colour').setDescription('The colour of the embed').setRequired(true))
        .addStringOption((option) => option.setName('message').setDescription('The message to send in the announcement').setRequired(true)),
    async execute(interaction) {

        const announceEmbed = new discord.MessageEmbed()
            .setColor(interaction.options.get('colour').value)
            .setTitle(`Announcement`)
            .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
            .setDescription(`\n\n${interaction.options.get('message').value}`)
            .addField('Author', `<@${interaction.user.id}>`)
            .setTimestamp()
            .setFooter({ text: footer, iconURL: interaction.guild.iconURL()}) // removed my credits since im just too nice (sure)

        interaction.channel.send({embeds: [announceEmbed]});
        interaction.reply({ content: 'Successfully sent announcement', ephemeral: true })

    },
};
