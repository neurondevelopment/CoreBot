const { footer } = require('../../config.json')
const fs = require('fs')
const { EmbedBuilder, ButtonStyle, ButtonBuilder, ActionRowBuilder, SelectMenuBuilder, SlashCommandBuilder } = require('discord.js')

module.exports = {
    perms: [],
    requirePermEmbed: true,
    data: new SlashCommandBuilder()
        .setName('sync')
        .setDescription('Update tickets and dropdown roles according to database'),
    async execute(interaction) {
        if(!interaction.member.permissions.has('Administrator')) return interaction.reply({ content: 'You must be an administrator to run this command!', ephemeral: true })
        const tickets = require('../../db/tickets.json')
        for(const ticket in tickets) {
            const curr = tickets[ticket]
            const channel = await interaction.client.channels.fetch(curr.messageChannelID).catch(err => { })
            if(!channel) return interaction.reply({ content: `Error at: ${ticket}\nUnable to find specified messageChannelID`, ephemeral: true })

            function gen() {
                const embed = new EmbedBuilder()
                    .setTitle(ticket)
                    .setColor(curr.embed.colour)
                    .setDescription(curr.embed.description)
                    .setImage(curr.embed.image)
                    .setFooter({ text: `${footer} - Made By Cryptonized`})
                const button = new ButtonBuilder()
                    .setCustomId('openTicket')
                    .setLabel(curr.button.label)
                    .setStyle(ButtonStyle[curr.button.buttonStyle])
                    .setEmoji(curr.button.emoji)
                const row = new ActionRowBuilder()
                    .addComponents(button)
                channel.send({ embeds: [embed], components: [row] }).then(msg => {
                    tickets[ticket].donttouch = msg.id
                    fs.writeFileSync('./db/tickets.json', JSON.stringify(tickets, null, 4))
                })
            }
            if(!curr.donttouch) return gen()
            
            const message = await channel.messages.fetch(curr.donttouch).catch(err => { })
            if(!message) return gen()
            let embed = message.embeds[0]
            if(embed.description !== curr.embed.description) {
                embed.description = curr.embed.description
                message.edit({ embeds: [embed] })
            }   
            if(embed.image !== curr.embed.image) {
                embed.setImage(curr.embed.image)
                message.edit({ embeds: [embed] })
            }
            if(embed.color !== curr.embed.colour) {
                embed.color = curr.embed.colour
                message.edit({ embeds: [embed] })
            }
            
        }

        const dropdown = require('../../db/dropdownRoles.json')
        if(dropdown) {
            for(const dropdownChannel in dropdown) {
                const curr = dropdown[dropdownChannel]
                const channel = await interaction.client.channels.fetch(dropdownChannel).catch(err => {})
                if(!channel) return interaction.reply({ content: `Error at: ${dropdownChannel}\nUnable to find specified channel`})

                function gen() {
                    const select = new SelectMenuBuilder()
                        .setCustomId(`dropdownRoles`)
                        .setMinValues(1)
                        .setMaxValues(1)
                        .setPlaceholder('Nothing Selected')

                    for(const role in curr.roles) {
                        const roleInfo = curr.roles[role]
                        select.addOptions([
                            {
                                label: `${role}`,
                                description: `${roleInfo.description}`,
                                emoji: `${roleInfo.emoji}`,
                                value: `${roleInfo.roles.join(',')}`
                            }
                        ])

                    }
                    const row = new ActionRowBuilder()
                        .addComponents(select)
                    channel.send({ content: curr.message, components: [row] }).then(msg => {
                        dropdown[dropdownChannel].donttouch = msg.id
                        fs.writeFileSync('./db/dropdownRoles.json', JSON.stringify(dropdown, null, 4))
                    })
                }
                if(!curr.donttouch) return gen()
                
                const message = await channel.messages.fetch(curr.donttouch).catch(err => { })
                if(!message) return gen()
                const select = new SelectMenuBuilder()
                    .setCustomId(`dropdownRoles`)
                    .setMinValues(1)
                    .setMaxValues(1)
                    .setPlaceholder('Nothing Selected')

                for(const role in curr.roles) {
                    const roleInfo = curr.roles[role]
                    select.addOptions([
                        {
                            label: `${role}`,
                            description: `${roleInfo.description}`,
                            emoji: `${roleInfo.emoji}`,
                            value: `${roleInfo.roles.join(',')}`
                        }
                    ])

                }
                const row = new ActionRowBuilder()
                    .addComponents(select)
                message.edit({ content: curr.message, components: [row] })
            }
        }

        interaction.reply({ content: `Successfully synced the tickets & dropdown menus according to your database!`, ephemeral: true })
        
    },
};
