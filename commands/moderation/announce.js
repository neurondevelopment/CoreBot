const { EmbedBuilder, SlashCommandBuilder } = require('discord.js')
const { footer } = require('../../config.json')

module.exports = {
    perms: [],
    requirePermEmbed: true,
    data: new SlashCommandBuilder()
        .setName('announce')
        .setDescription('Send an announcement to the channel')
        .addStringOption((option) => option.setName('colour').setDescription('The colour of the embed').setRequired(true))
        .addStringOption((option) => option.setName('message').setDescription('The message to send in the announcement').setRequired(true)),
    async execute(interaction) {
        let colour = interaction.options.getString('colour').toLowerCase()
        colour = colour[0].toUpperCase() + colour.slice(1) // Convert to PascalCase

        const announceEmbed = new EmbedBuilder()
            .setColor(colour)
            .setTitle(`Announcement`)
            .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
            .setDescription(`\n\n${interaction.options.getString('message')}`)
            .addFields([{ name: 'Author', value: `<@${interaction.user.id}>` }])
            .setTimestamp()
            .setFooter({ text: footer, iconURL: interaction.guild.iconURL()}) // removed my credits since im just too nice (sure)

        interaction.channel.send({embeds: [announceEmbed]});
        interaction.reply({ content: 'Successfully sent announcement', ephemeral: true })

    },
};
