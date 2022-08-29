const { SlashCommandBuilder } = require('discord.js')

module.exports = {
    perms: [],
    data: new SlashCommandBuilder()
        .setName('decode')
        .setDescription('Decode a Base64 message')
        .addStringOption((option) => option.setName('message').setDescription('The encoded message to be decoded').setRequired(true)),
    execute(interaction) {
        const input = interaction.options.getString('message')

        const decoded = Buffer.from(input, 'base64').toString('utf8');

        interaction.reply({ content: `Your decoded message is: \`${decoded}\``, ephemeral: true });

    },
};