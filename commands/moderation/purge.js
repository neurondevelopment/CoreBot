const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    perms: [],
    data: new SlashCommandBuilder()
        .setName('purge')
        .setDescription('Delete (up to 99) messages in a channel')
        .addIntegerOption((option) => option.setName('amount').setDescription('The number of messages (max 99)').setRequired(true)),
    execute(interaction) {
        const val = interaction.options.get('amount').value + 1
        const amount = val > 99 ? 99 : val

        interaction.channel.bulkDelete(amount, true)

        interaction.reply({ content: `Successfully purged ${amount-1} messages`})
    },
};