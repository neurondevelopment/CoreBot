const db = require('quick.db');
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    perms: [],
    data: new SlashCommandBuilder()
        .setName('stick')
        .setDescription('Stick a message in the channel')
        .addStringOption(option =>
            option.setName('choice')
                .setDescription('Set Or Remove')
                .setRequired(true)
                .addChoice('Set', 'set')
                .addChoice('Remove', 'remove'))
        .addStringOption((option) => option.setName('message').setDescription('The message to stick').setRequired(true)),
    async execute(interaction) {
        const choice = interaction.options.get('choice').value

        if(choice === 'set') {
            const content = interaction.options.get('message').value
            interaction.channel.send(`**STICKY MESSAGE**\n${content}`).then(msg => {
                db.set(`stick_${interaction.guild.id}_${interaction.channel.id}`, content)
                db.set(`stick_${interaction.guild.id}_${interaction.channel.id}_msg`, `${msg.id}`)
                db.set(`stick_${interaction.guild.id}_${interaction.channel.id}_last`, 0)
            })
            interaction.reply({ content: 'Successfully set sticky message!', ephemeral: true })
        }
        else if(choice === 'remove') {
            db.delete(`stick_${interaction.guild.id}_${interaction.channel.id}`)
            interaction.reply({ content: 'Successfully removed the sticky message from this channel!', ephemeral: true })
        }
        
    },
};