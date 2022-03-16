const fetch = require('sync-fetch');
const emojiStrip = require('emoji-strip')
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    perms: [],
    data: new SlashCommandBuilder()
        .setName('encode')
        .setDescription('Encode a message with Base64')
        .addStringOption((option) => option.setName('message').setDescription('The message to be encoded').setRequired(true)),
    execute(interaction) {
        const things = emojiStrip(interaction.options.get('message').value.replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi, ''));

        const d = fetch(`https://some-random-api.ml/base64?encode=${things}`).json();

        interaction.reply({ content: `Your encoded message is \`${d.base64}\``, ephemeral: true})

    },
};