const ms = require("ms");
const { embedcolour } = require('../../config.json').commands.timeout
const { footer } = require('../../config.json')
const { EmbedBuilder, SlashCommandBuilder } = require('discord.js')
const { sendLogs, checkPerms } = require('../../utils')

module.exports = {
    perms: [],
    requirePermEmbed: true,
    data: new SlashCommandBuilder()
        .setName('timeout')
        .setDescription('Time out a user for specified time')
        .addUserOption((option) => option.setName('user').setDescription('The user to timeout').setRequired(true))
        .addStringOption((option) => option.setName('time').setDescription('How long to timeout the user for').setRequired(true)),
    async execute(interaction) {
        const time = interaction.options.getString('time') || '10m'
        const user = interaction.options.getMember('user')
        const permCheck = checkPerms(interaction.member, user)
        if(permCheck) return interaction.reply({ content: permCheck, ephemeral: true })

        if(!ms(time)) return interaction.reply({ content: 'Invalid time specified!', ephemeral: true });

        let failed;
        user.timeout(ms(time)).catch(err => { 
            failed = true
            interaction.reply({ content: 'Unable to timeout that user', ephemeral: true })
        })

        if(failed) return;

        const embed = new EmbedBuilder()
            .setColor(embedcolour)
            .setTitle('Timed Out User')
            .setThumbnail(user.user.displayAvatarURL())
            .setDescription(`Successfully timed out \`${user.user.username}\` in ${interaction.guild.name} for \`${time}\``)
            .addFields(
                { name: 'User\'s Discord', value: `${user.user.tag}`, inline: true },
                { name: 'User\'s ID', value: `${user.user.id}`, inline: true },
                { name: 'Moderator', value: interaction.user.tag, inline: true}
            )
            .setTimestamp()
            .setFooter({ text: `${footer} - Made By Cryptonized`, iconURL: interaction.guild.iconURL()})

        interaction.reply({embeds: [embed], ephemeral: true});
        const loggingChannel = await interaction.client.channels.fetch(sendLogs('timeout')).catch(err => { })
        if(loggingChannel) loggingChannel.send({embeds: [embed]})
    },
};