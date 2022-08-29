const { db } = require('../../index')
const { footer } = require('../../config.json')
const { embedcolour } = require('../../config.json').commands.kick
const { EmbedBuilder, SlashCommandBuilder } = require('discord.js')
const { sendLogs, checkPerms } = require('../../utils')

module.exports = {
    perms: [],
    requirePermEmbed: true,
    data: new SlashCommandBuilder()
        .setName('kick')
        .setDescription('Kick a user from the server')
        .addUserOption((option) => option.setName('user').setDescription('The user to kick').setRequired(true))
        .addStringOption((option) => option.setName('reason').setDescription('The reason for the kick').setRequired(false)),
    async execute(interaction) {
        const reason = interaction.options.getString('reason') || 'No reason specified'
        const target = interaction.options.getMember('user')
        const permCheck = checkPerms(interaction.member, target)
        if(permCheck) return interaction.reply({ content: permCheck, ephemeral: true })

        const today = new Date();
        const dateTime = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();

        let fail;
        await target.kick(`${reason} - ${interaction.user.tag}`)
            .catch(err => {
                fail = true;
                interaction.reply({ content: 'Unable to kick that user!', ephemeral: true})
            })
        if(fail) return;
            
        const embed = new EmbedBuilder()
            .setColor(embedcolour)
            .setTitle('Kicked Member')
            .setThumbnail(target.user.displayAvatarURL())
            .setDescription(`Successfully kicked \`${target.user.username}\` from ${interaction.guild.name} for \`${reason}\``)
            .addFields(
                { name: 'User\'s Discord', value: `${target.user.tag}`, inline: true },
                { name: 'User\'s ID', value: `${target.user.id}`, inline: true },
                { name: 'Kicked By', value: interaction.user.tag, inline: true}
            )
            .setTimestamp()
            .setFooter({ text: `${footer} - Made By Cryptonized`, iconURL: interaction.guild.iconURL()});

        interaction.reply({embeds: [embed]})
        const loggingChannel = await interaction.client.channels.fetch(sendLogs('kick')).catch(err => { })
        if(loggingChannel) loggingChannel.send({embeds: [embed]})
        await db.push(`kicks_${target.id}`, `**${reason}** - ${interaction.user.tag} - ${dateTime}`)



    },
};