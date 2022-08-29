const { db } = require('../../index')
const { footer } = require('../../config.json')
const { embedcolour } = require('../../config.json').commands.warn
const { EmbedBuilder, SlashCommandBuilder } = require('discord.js')
const { sendLogs, checkPerms } = require('../../utils')

module.exports = {
    perms: [],
    requirePermEmbed: true,
    data: new SlashCommandBuilder()
        .setName('warn')
        .setDescription('Warns a user')
        .addUserOption((option) => option.setName('user').setDescription('The user to warn').setRequired(true))
        .addStringOption((option) => option.setName('reason').setDescription('The reason for warning').setRequired(false)),
    async execute(interaction) {
        const reason = interaction.options.getString('reason') || 'No reason specified'
        const target = interaction.options.getMember('user')
        const permCheck = checkPerms(interaction.member, target)
        if(permCheck) return interaction.reply({ content: permCheck, ephemeral: true })

        const today = new Date();
        const dateTime = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();

        await db.push(`warnings_${target.id}`, `**${reason}** - ${interaction.user.tag} - ${dateTime}`);

        const number = await db.get(`warnings_${target.id}`).length || 0;

        const embed = new EmbedBuilder()
            .setColor(embedcolour)
            .setTitle('User Warned')
            .setDescription(`Successfully warned <@${target.id}> for \`${reason}\`\n\nUser now has: \`${number}\` warnings`)
            .setFooter({ text: `${footer} - Made By Cryptonized`})
        interaction.reply({embeds: [embed]});

        const logEmbed = new EmbedBuilder()
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

        const loggingChannel = await interaction.client.channels.fetch(sendLogs('warn')).catch(err => { })
        if(loggingChannel) loggingChannel.send({embeds: [logEmbed]})

    },
};