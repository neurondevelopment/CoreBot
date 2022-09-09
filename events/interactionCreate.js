const { InteractionType, EmbedBuilder } = require('discord.js')
let commandLogChannel
const { footer } = require('../config.json')
const { commandLogs } = require('../config.json').logs

module.exports = {
    name: 'interactionCreate',
    enabled: true,
    async execute(interaction) {
        if(!commandLogChannel) commandLogChannel = await interaction.client.channels.fetch(commandLogs).catch(err => { })

        if(interaction.type === InteractionType.ApplicationCommand) {
            const command = interaction.client.commands.get(interaction.commandName);
            if (!command) return;
            try {
                if((command.requirePermEmbed && !command.perms[0]) && !interaction.member.permissions.has('Administrator')) return interaction.reply({ content: `You do not have permission to run this command!`, ephemeral: true })
                if(command.perms[0] && !command.perms.some(currPerm => interaction.member.permissions.has(currPerm) || interaction.member.roles.cache.some(role => role.id === currPerm))) return interaction.reply({ content: `You do not have permission to run this command!`, ephemeral: true })
                await command.execute(interaction);
                if(commandLogChannel) {
                    const embed = new EmbedBuilder()
                        .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL()})
                        .addFields([
                            { name: 'Command Executed', value: interaction.commandName },
                            { name: 'Channel', value: `<#${interaction.channel.id}>` } 
                        ])
                        .setFooter({ text: `${footer} - Made By Cryptonized`})
                    commandLogChannel.send({embeds: [embed]})
                }
            } catch (error) {
                console.error(error);
                await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
            }
        }
        else {
            let args = []
            let customId = interaction.customId
            if(interaction.customId.includes('/\\ND\\/')) {
                customId = customId.split('/\\ND\\/')[0]
                args = interaction.customId.split('/\\ND\\/')
                args.shift() // Remove the actual ID
            }
            const interactionFile = require(`./interactions/${InteractionType[interaction.type]}/${customId}`)
            interactionFile.execute(interaction, args)
        }
    }
}