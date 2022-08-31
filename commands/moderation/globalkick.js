const { footer } = require('../../config.json')
const { embedcolour } = require('../../config.json').commands.globalkick
const { sendLogs, checkPerms } = require('../../utils')
const { EmbedBuilder, SlashCommandBuilder } = require('discord.js')

module.exports = {
    perms: [],
    requirePermEmbed: true,
    data: new SlashCommandBuilder()
        .setName('globalkick')
        .setDescription('Kick a user from all servers the bot is in')
        .addUserOption((option) => option.setName('user').setDescription('The user to kick').setRequired(true))
        .addStringOption((option) => option.setName('reason').setDescription('The reason for the kick').setRequired(false)),
    async execute(interaction) {
        const reason = interaction.options.getString('reason') || 'No reason specified'
        const target = interaction.options.getMember('user')
        let num = 0;
        const permCheck = checkPerms(interaction.member, target)
        if(permCheck) return interaction.reply({ content: permCheck, ephemeral: true })

        interaction.client.guilds.cache.forEach(async server => {
            try {
                const member = await server.members.fetch(target.user.id).catch(err => { })
                if(member && member.kickable) {
                    await member.kick(`${reason} - ${interaction.user.tag}`)
                    num++
                }
                else {
                    num--
                }
            }
            catch {
                num--
            }
        })
        const loggingChannel = await interaction.client.channels.fetch(sendLogs('globalkick')).catch(err => { })
        const embed = new EmbedBuilder()
            .setColor(embedcolour)
            .setTitle('Globally Kicked Member')
            .setThumbnail(target.user.displayAvatarURL())
            .setDescription(`Successfully kicked \`${target.user.username}\` from ${num} servers for \`${reason}\``)
            .addFields(
                { name: 'User\'s Discord', value: `${target.user.tag}`, inline: true },
                { name: 'User\'s ID', value: `${target.user.id}`, inline: true },
                { name: 'Kicked By', value: interaction.user.tag, inline: true}
            )
            .setTimestamp()
            .setFooter({ text: `${footer} - Made By Cryptonized`, iconURL: interaction.guild.iconURL()});
        interaction.reply({embeds: [embed]})
        
        if(loggingChannel) loggingChannel.send({embeds: [embed]});


    },
};