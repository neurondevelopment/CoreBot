const { SlashCommandBuilder } = require('discord.js')

module.exports = {
    perms: [],
    data: new SlashCommandBuilder()
        .setName('remove')
        .setDescription('Remove a user from a ticket')
        .addUserOption((option) => option.setName('user').setDescription('The user\'s balance to check').setRequired(true)),
    async execute(interaction) {
        const userID = interaction.options.getUser('user').id
        const user = interaction.options.getMember('user')
        if(!interaction.channel.topic && !interaction.channel.topic.split('|')[1] && interaction.channel.topic.split('|')[2] !== 'ticket') return interaction.reply({ content: 'This is not a ticket channel!', ephemeral: true })
        interaction.channel.permissionOverwrites.edit(user, {
            ViewChannel: false
        })
        interaction.reply({ content: `Successfully added <@${userID}> to this ticket!` })
        
    },
};