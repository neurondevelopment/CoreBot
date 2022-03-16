const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    perms: [],
    data: new SlashCommandBuilder()
        .setName('say')
        .setDescription('Send an announcement to the channel')
        .addStringOption((option) => option.setName('message').setDescription('The message to say').setRequired(true)),
    execute(interaction) {

        interaction.channel.send(interaction.options.get('message').value)
        interaction.reply({ content: 'Success!', ephemeral: true})

    },
};
