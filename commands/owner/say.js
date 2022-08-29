const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    perms: [],
    requirePermEmbed: true,
    data: new SlashCommandBuilder()
        .setName('say')
        .setDescription('Send an announcement to the channel')
        .addStringOption((option) => option.setName('message').setDescription('The message to say').setRequired(true)),
    execute(interaction) {
        interaction.channel.send(interaction.options.getString('message'))
        interaction.reply({ content: 'Success!', ephemeral: true})
    },
};
