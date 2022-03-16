const fetch = require('sync-fetch');
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    perms: [],
    data: new SlashCommandBuilder()
        .setName('decode')
        .setDescription('Decode a Base64 message')
        .addStringOption((option) => option.setName('message').setDescription('The encoded message to be decoded').setRequired(true)),
    execute(interaction) {
        const d = fetch(`https://some-random-api.ml/base64?decode=${interaction.options.get('message').value}`).json();

        interaction.reply({ content: `Your decoded message is: \`${d.text}\``, ephemeral: true });

    },
};