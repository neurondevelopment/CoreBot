const { ChannelType, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js')
const { ticketInfoColour } = require('../../config.json').tickets
const { footer } = require('../../config.json')

module.exports = {
    name: 'openTicket',
    async execute(interaction, args) {
        await interaction.deferReply({ ephemeral: true})
        const tickets = require('../../db/tickets.json')
        const ticket = tickets[interaction.message.embeds[0].title]
        const user = interaction.user
        interaction.message.guild.channels.create({
            name: user.username,
            type: ChannelType.GuildText,
            parent: ticket.categoryID,
            topic: `${interaction.user.id}|${ticket.supportroles.join(',')}|ticket`
        }).then(async chann => {
            interaction.editReply({ content: `Your ticket can be found here: <#${chann.id}>`})
            chann.permissionOverwrites.edit(user, {
                ViewChannel: true
            })
            ticket.supportroles.forEach(curr => {
                chann.permissionOverwrites.edit(curr, {
                    ViewChannel: true
                })
            })
            const embed = new EmbedBuilder()
                .setColor(ticketInfoColour)
                .setTitle('Ticket Information')
                .setThumbnail(user.displayAvatarURL())
                .addFields([
                    { name: 'Ticket Owner', value: `${user.tag} - ${user.id}`},
                    { name: 'Ticket Type', value: interaction.message.embeds[0].title },
                    { name: 'Commands', value: `/rename - Renames the ticket\n/add - Adds a user to the ticket\n/remove - Removes a user from the ticket`}
                ])
                .setTimestamp()
                .setFooter({ text: `${footer} - Made By Cryptonized`})

            const button1 = new ButtonBuilder()
                .setStyle(ButtonStyle.Secondary)
                .setLabel("Close Ticket")
                .setCustomId(`close`)
                .setEmoji('🔒')

            const button2 = new ButtonBuilder()
                .setStyle(ButtonStyle.Primary)
                .setLabel("Claim Ticket")
                .setCustomId(`claim`)
                .setEmoji('🔑')

            const buttonRow = new ActionRowBuilder()
                .addComponents(button1, button2)

            await chann.send({ embeds: [embed], components: [buttonRow]})
            await chann.send(ticket.message.split('{[USER]}').join(`<@${user.id}>`))
        })
    }
}