const { db } = require('../../index')
const { footer, defaultEmbedColour } = require('../../config.json')
const { EmbedBuilder, SlashCommandBuilder } = require('discord.js')

module.exports = {
    perms: [],
    data: new SlashCommandBuilder()
        .setName('infractions')
        .setDescription('Check a user\'s infractions')
        .addUserOption((option) => option.setName('user').setDescription('The user\'s balance to check').setRequired(false)),
    async execute(interaction) {
        const target = interaction.options.getString('user') || interaction.user.id
        const warnings = await db.get(`warnings_${target}`) || ['None'];
        const kicks = await db.get(`kicks_${target}`) || ['None'];
        let number = warnings.length;
        let number2 = kicks.length;

        if(warnings[0] === 'None') number = 0;
        if(kicks[0] === 'None') number2 = 0;

        const embed = new EmbedBuilder()
            .setColor(defaultEmbedColour)
            .addFields([
                { name: 'Warnings', value: `- ${warnings.join('\n- ') || 'None'}` },
                { name: 'Kicks', value: `- ${kicks.join('\n- ') || 'None'}` }
            ]) 
            .setFooter({text: `${number} warnings | ${number2} kicks - ${footer}`, iconURL: interaction.guild.iconURL()})
        interaction.reply({ embeds: [embed], ephemeral: true })
    },
};