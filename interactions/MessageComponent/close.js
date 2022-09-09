const { generateCode } = require('../../utils');
const { enableTranscriptDMs, transcriptChannelID } = require('../../config.json').tickets
const fs = require('fs')

module.exports = {
    name: 'close',
    async execute(interaction, args) {
        const owner = interaction.channel.topic.split('|')[0]
        const code = generateCode(5)
        const owner2 = interaction.client.users.cache.get(owner)
        if(enableTranscriptDMs) {
            let all = await interaction.message.channel.messages.fetch()
            all = all.reverse()
            all.each(ms => {
                if(ms.content && ms.content !== ' ') {
                    const d = new Date(ms.createdTimestamp)
                    const date = d.getHours() + ":" + d.getMinutes() + ", " + d.toDateString();
                    const author = `${ms.author.tag}(${ms.author.id}) @ ${date}`;
                    const content = ms.content;
                    fs.appendFileSync(`./${code}.txt`, `${author} - ${content}\n`)
                }
            })
            const ticket = require('../../db/tickets.json')[interaction.message.embeds[0].fields[1].value]
            if(!ticket) return interaction.reply({ content: 'ERROR! Could not find this ticket type in the config?', ephemeral: true })
            owner2.send({ content: `${ticket.closeMessage}`, files: [`./${code}.txt`] }).then(async () => {
                const logChannel = interaction.client.channels.cache.get(transcriptChannelID);
                if(logChannel) {
                    await logChannel.send({ content: `New transcript saved! Ticket Owner: ${interaction.client.users.cache.get(owner).tag}(${owner})`,
                        files: [`./${code}.txt`]
                    })
                }
                fs.unlinkSync(`./${code}.txt`)
                interaction.message.channel.delete()
                
            })
        }
        else {     
            interaction.message.channel.delete()    
        }
    }
}