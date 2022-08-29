const { footer } = require('../../config.json')
const { embedcolour } = require('../../config.json').commands.globalban
const { EmbedBuilder, SlashCommandBuilder } = require('discord.js')
const { sendLogs, checkPerms } = require('../../utils')

module.exports = {
    perms: [],
    requirePermEmbed: true,
    data: new SlashCommandBuilder()
        .setName('globalban')
        .setDescription('Ban a user from all servers the bot is in')
        .addUserOption((option) => option.setName('user').setDescription('The user to ban').setRequired(true))
        .addStringOption((option) => option.setName('reason').setDescription('The reason for the ban').setRequired(false)),
    async execute(interaction) {
        const reason = interaction.options.getString('reason') || 'No reason specified'
        const target = interaction.options.getMember('user')
        let num = 0;
        const permCheck = checkPerms(interaction.member, target)
        if(permCheck) return interaction.reply({ content: permCheck, ephemeral: true })
        
        interaction.client.guilds.cache.forEach(server => {
            server.bans.create(target.user, { reason: `${reason} - ${interaction.user.tag}`}).then(() => {
                num += 1;
            }).catch(err => { })
        })
        
        const loggingChannel = await interaction.client.channels.fetch(sendLogs('globalban')).catch(err => {})

        const embed = new EmbedBuilder()
            .setColor(embedcolour)
            .setTitle('Globally Banned Member')
            .setThumbnail(target.user.displayAvatarURL())
            .setDescription(`Successfully banned \`${target.user.username}\` from ${num} servers for \`${reason}\``)
            .addFields(
                { name: 'User\'s Discord', value: `${target.user.tag}`, inline: true },
                { name: 'User\'s ID', value: `${target.user.id}`, inline: true },
                { name: 'Banned By', value: interaction.user.tag, inline: true}
            )
            .setTimestamp()
            .setFooter({ text: `${footer} - Made By Cryptonized`, iconURL: interaction.guild.iconURL()});
        interaction.reply({embeds: [embed]})
        if(loggingChannel) loggingChannel.send({embeds: [embed]}).catch(err => {})
        

    },
};
