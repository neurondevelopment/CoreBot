const { SlashCommandBuilder } = require('@discordjs/builders');
const utils = require('../../utils')
module.exports = {
    perms: [],
    data: new SlashCommandBuilder()
        .setName('add')
        .setDescription('Add a user to a ticket')
        .addUserOption((option) => option.setName('user').setDescription('The user to add').setRequired(true)),
    async execute(interaction) {
        const userID = interaction.options.getUser('user').id
        const user = interaction.options.getMember('user')
        if(!interaction.channel.topic || !interaction.channel.topic.split('|')[1] || interaction.channel.topic.split('|')[2] !== 'ticket') return interaction.reply({ content: 'This is not a ticket channel!', ephemeral: true })        
        interaction.channel.permissionOverwrites.edit(user, {
            VIEW_CHANNEL: true
        })
        interaction.reply({ content: `Successfully added <@${userID}> to this ticket!` })
        
    },
};