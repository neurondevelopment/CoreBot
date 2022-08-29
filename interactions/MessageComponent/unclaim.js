module.exports = {
    name: 'unclaim',
    async execute(interaction, args) {
        const support = interaction.channel.topic.split('|')[1].split(',')
        let done;
        support.forEach(curr => {
            if(interaction.guild.members.cache.get(interaction.user.id).roles.cache.some(r => r.id === curr)) {
                done = true;
            }
        })
        if(!done) return interaction.message.channel.send('You are not allowed to unclaim this ticket!')

        support.forEach(curr => {
            interaction.message.channel.permissionOverwrites.edit(curr, {
                ViewChannel: true
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
            .setStyle(ButtonStyle.Primary)
            .setLabel("Claim Ticket")
            .setCustomId(`claim`)
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