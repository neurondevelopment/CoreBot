const db = require('quick.db');
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    perms: [],
    data: new SlashCommandBuilder()
        .setName('rename')
        .setDescription('Change the name of the ticket')
        .addStringOption((option) => option.setName('name').setDescription('The new name of the ticket channel').setRequired(true)),
    async execute(interaction) {
        if(!interaction.channel.topic && !interaction.channel.topic.split('|')[1] && interaction.channel.topic.split('|')[2] !== 'ticket') return interaction.reply({ content: 'This is not a ticket channel!', ephemeral: true })
        interaction.channel.setName(interaction.options.get('name').value)
        interaction.reply({ content: `Successfully renamed this ticket!\n\nNote: Channel renaming is rate limited to once per 10 minutes, so if the name has not updated, try again in 10 minutes`, ephemeral: true })
        
    },
};