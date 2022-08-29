const { db } = require('../../index')
const { SlashCommandBuilder } = require('discord.js')

module.exports = {
    perms: [],
    requirePermEmbed: true,
    data: new SlashCommandBuilder()
        .setName('stick')
        .setDescription('Stick a message in the channel')
        .addStringOption(option =>
            option.setName('choice')
                .setDescription('Set Or Remove')
                .setRequired(true)
                .addChoices(
                    { name: 'Set', value: 'set' },
                    { name: 'Remove ', value: 'remove' }
                ))
        .addStringOption((option) => option.setName('message').setDescription('The message to stick').setRequired(true)),
    async execute(interaction) {
        const choice = interaction.options.getString('choice')

        if(choice === 'set') {
            const content = interaction.options.getString('message')
            interaction.channel.send(`**STICKY MESSAGE**\n${content}`).then(async msg => {
                await db.set(`stick_${interaction.guild.id}_${interaction.channel.id}`, content)
                await db.set(`stick_${interaction.guild.id}_${interaction.channel.id}_msg`, `${msg.id}`)
                await db.set(`stick_${interaction.guild.id}_${interaction.channel.id}_last`, 0)
            })
            interaction.reply({ content: 'Successfully set sticky message!', ephemeral: true })
        }
        else if(choice === 'remove') {
            await db.delete(`stick_${interaction.guild.id}_${interaction.channel.id}`)
            interaction.reply({ content: 'Successfully removed the sticky message from this channel!', ephemeral: true })
        }
        
    },
};