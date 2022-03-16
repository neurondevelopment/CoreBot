const Discord = require('discord.js');
const { footer } = require('../../config.json')
const { SlashCommandBuilder } = require('@discordjs/builders');
const fs = require('fs')

module.exports = {
    perms: [],
    data: new SlashCommandBuilder()
        .setName('sync')
        .setDescription('Update tickets and dropdown roles according to database'),
    async execute(interaction) {
        if(!interaction.member.permissions.has('ADMINISTRATOR')) return interaction.reply({ content: 'You must be an administrator to run this command!', ephemeral: true })
        const tickets = require('../../db/tickets.json')
        for(const ticket in tickets) {
            const curr = tickets[ticket]
            const channel = await interaction.client.channels.fetch(curr.messageChannelID)
            if(!channel) return interaction.reply({ content: `Error at: ${i}\nUnable to find specified messageChannelID`})
            if(!curr.donttouch) {
                const embed = new Discord.MessageEmbed()
                    .setTitle(ticket)
                    .setColor(curr.colour)
                    .setDescription(curr.embed.description)
                    .setFooter({ text: `${footer} - Made By Cryptonized`})
                const button = new Discord.MessageButton()
                    .setCustomId('openticket')
                    .setLabel(curr.button.label)
                    .setStyle(curr.button.buttonStyle)
                    .setEmoji(curr.button.emoji)
                const row = new Discord.MessageActionRow()
                    .addComponents(button)
                channel.send({ embeds: [embed], components: [row] }).then(msg => {
                    tickets[ticket].donttouch = msg.id
                    fs.writeFileSync('./db/tickets.json', JSON.stringify(tickets, null, 4))
                })
            }
            else {
                const message = await channel.messages.fetch(curr.donttouch)
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
        }

        const dropdown = require('../../db/dropdownRoles.json')
        if(dropdown) {
            for(const dropdownChannel in dropdown) {
                const curr = dropdown[dropdownChannel]
                const channel = await interaction.client.channels.fetch(dropdownChannel)
                if(!channel) return interaction.reply({ content: `Error at: ${dropdownChannel}\nUnable to find specified channel`})
                function gen() {
                    const select = new Discord.MessageSelectMenu()
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
                    const row = new Discord.MessageActionRow()
                        .addComponents(select)
                    channel.send({ content: curr.message, components: [row] }).then(msg => {
                        dropdown[dropdownChannel].donttouch = msg.id
                        fs.writeFileSync('./db/dropdownRoles.json', JSON.stringify(dropdown, null, 4))
                    })
                }
                if(!curr.donttouch) {
                    gen()
                }
                else {
                    const message = await channel.messages.fetch(curr.donttouch)
                    if(message) {
                        const select = new Discord.MessageSelectMenu()
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
                        const row = new Discord.MessageActionRow()
                            .addComponents(select)
                        message.edit({ content: curr.message, components: [row] })
                    }
                    else {
                        gen()
                    }
                }
            }
        }

        interaction.reply({ content: `Successfully synced the tickets & dropdown menus according to your database!`, ephemeral: true })
        
    },
};