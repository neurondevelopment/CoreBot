const discord = require('discord.js');
const db = require('quick.db');
const { footer } = require('../../config.json')
const { embedcolour } = require('../../config.json').commands.warn
const { SlashCommandBuilder } = require('@discordjs/builders');
const utils = require('../../utils')

module.exports = {
    perms: [],
    data: new SlashCommandBuilder()
        .setName('warn')
        .setDescription('Warns a user')
        .addUserOption((option) => option.setName('user').setDescription('The user to warn').setRequired(true))
        .addStringOption((option) => option.setName('reason').setDescription('The reason for warning').setRequired(false)),
    async execute(interaction) {

        const reason = interaction.options.get('reason') ? interaction.options.get('reason').value : 'No reason specified'
        const target = await interaction.guild.members.fetch(interaction.options.get('user').value)

        const today = new Date();
        const dateTime = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();

        db.push(`warnings_${target.id}`, `**${reason}** - ${interaction.user.tag} - ${dateTime}`);

        const number = db.get(`warnings_${target.id}`).length || 0;

        const embed = new discord.MessageEmbed()
            .setColor(embedcolour)
            .setTitle('User Warned')
            .setDescription(`Successfully warned <@${target.id}> for \`${reason}\`\n\nUser now has: \`${number}\` warnings`)
            .setFooter({ text: `${footer} - Made By Cryptonized`})
        interaction.reply({embeds: [embed]});

        const logEmbed = new discord.MessageEmbed()
            .setColor(embedcolour)
            .setTitle('Member Warned')
            .setThumbnail(target.user.displayAvatarURL())
            .setDescription(`User \`${target.user.username}\` was warned for \`${reason}\``)
            .addFields(
                { name: 'Total Warns', value: `${number}`, inline: true },
                { name: 'User\'s ID', value: `${target.user.id}`, inline: true },
                { name: 'Warned By', value: interaction.user.tag, inline: true}
            )
            .setTimestamp()
            .setFooter({ text: `${footer} - Made By Cryptonized`, iconURL: interaction.guild.iconURL()})

        const loggingchannel = interaction.client.channels.cache.get(utils.sendLogs('warn'))
        loggingchannel.send({embeds: [logEmbed]})

    },
};