const { footer } = require('../../config.json')
const { embedcolour } = require('../../config.json').commands.ban
const { EmbedBuilder, SlashCommandBuilder } = require('discord.js')
const { sendLogs, checkPerms } = require('../../utils')

module.exports = {
    perms: [],
    requirePermEmbed: true,
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('Ban a user')
        .addUserOption((option) => option.setName('user').setDescription('The user to ban').setRequired(true))
        .addStringOption((option) => option.setName('reason').setDescription('The reason for the ban').setRequired(false)),
    async execute(interaction) {
        const reason = interaction.options.getString('reason') || 'No reason specified'
        const target = interaction.options.getMember('user')
        const permCheck = checkPerms(interaction.member, target)
        if(permCheck) return interaction.reply({ content: permCheck, ephemeral: true })

        let failed;
        await interaction.guild.members.ban(target, { reason: `${reason} - ${interaction.user.tag}`})
            .catch(err => {
                failed = true;
                interaction.reply({ content: 'Unable to ban that user', ephemeral: true })
            })
        if(fail) return;
        const embed = new EmbedBuilder()
            .setColor(embedcolour)
            .setTitle('Banned Member')
            .setThumbnail(target.user.displayAvatarURL())
            .setDescription(`Successfully banned \`${target.user.username}\` from ${interaction.guild.name} for \`${reason}\``)
            .addFields(
                { name: 'User\'s Discord', value: `${target.user.tag}`, inline: true },
                { name: 'User\'s ID', value: `${target.user.id}`, inline: true },
                { name: 'Banned By', value: interaction.user.tag, inline: true}
            )
            .setTimestamp()
            .setFooter({ text: `${footer} - Made By Cryptonized`, iconURL: interaction.guild.iconURL()});

        interaction.reply({ embeds: [embed] });
        const loggingChannel = await interaction.client.channels.fetch(sendLogs('ban')).catch(err => { })
        if(loggingChannel) loggingChannel.send({embeds: [embed]})

    },
};