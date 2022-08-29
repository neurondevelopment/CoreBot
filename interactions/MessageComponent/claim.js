module.exports = {
    name: 'claim',
    async execute(interaction, args) {
        const support = interaction.channel.topic.split('|')[1].split(',')
        let done;
        support.forEach(curr => {
            if(interaction.guild.members.cache.get(interaction.user.id).roles.cache.some(r => r.id === curr)) {
                done = true;
            }
        })
        if(!done) {
            interaction.reply({ content: 'You are not allowed to unclaim this ticket!', ephemeral: true })
        }
        else {
            //interaction.message.channel.setName(`${interaction.user.username}-claimed`)
            support.forEach(curr => {
                interaction.message.channel.permissionOverwrites.edit(curr, {
                        ViewChannel: false
                })
            })
            interaction.message.channel.permissionOverwrites.edit(interaction.user, {
                ViewChannel: true
            })

            const button1 = new ButtonBuilder()
                .setStyle(ButtonStyle.Secondary)
                .setLabel("Close Ticket")
                .setCustomId(`close`)
                .setEmoji('🔒')
                .toJSON()
            const button2 = new ButtonBuilder()
                .setStyle(ButtonStyle.Danger)
                .setLabel("Unclaim Ticket")
                .setCustomId(`unclaim`)
                .setEmoji('🔑')
                .toJSON()
            const buttonRow = new ActionRowBuilder()
                .addComponents(button1, button2)

            interaction.update({
                embeds: [interaction.message.embeds[0]],
                components: [buttonRow]
            })
        }
    }
}