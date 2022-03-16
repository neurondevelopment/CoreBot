const discord = require('discord.js');
const db = require('quick.db');
const { footer, defaultEmbedColour } = require('../../config.json')
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    perms: [],
    data: new SlashCommandBuilder()
        .setName('infractions')
        .setDescription('Check a user\'s infractions')
        .addUserOption((option) => option.setName('user').setDescription('The user\'s balance to check').setRequired(false)),
    execute(interaction) {
        const target = interaction.options.get('user')? interaction.options.get('user').value : interaction.user.id
        const warnings = db.get(`warnings_${target}`) || ['None'];
        const kicks = db.get(`kicks_${target}`) || ['None'];
        let number = warnings.length;
        let number2 = kicks.length;

        if(warnings[0] === 'None') number = 0;
        if(kicks[0] === 'None') number2 = 0;

        const embed = new discord.MessageEmbed()
            .setColor(defaultEmbedColour)
            .addField('Warnings', `- ${warnings.join('\n- ') || 'None'}`) 
            .addField('Kicks', `- ${kicks.join('\n-') || 'None'}`)
            .setFooter({text: `${number} warnings | ${number2} kicks - ${footer}`, iconURL: interaction.guild.iconURL()})
        interaction.reply({ embeds: [embed], ephemeral: true })
    },
};