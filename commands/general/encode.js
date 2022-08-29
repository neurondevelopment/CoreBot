const emojiStrip = require('emoji-strip')
const { SlashCommandBuilder } = require('discord.js')

module.exports = {
    perms: [],
    data: new SlashCommandBuilder()
        .setName('encode')
        .setDescription('Encode a message with Base64')
        .addStringOption((option) => option.setName('message').setDescription('The message to be encoded').setRequired(true)),
    execute(interaction) {
        const input = emojiStrip(interaction.options.getString('message').replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi, ''));

        const encoded = Buffer.from(input, 'utf8').toString('base64');

        interaction.reply({ content: `Your encoded message is \`${encoded}\``, ephemeral: true})

    },
};