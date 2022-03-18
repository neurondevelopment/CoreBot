const Discord = require('discord.js');
const { footer } = require('../../config.json')
const { embedcolour } = require('../../config.json').commands.globalban
const { SlashCommandBuilder } = require('@discordjs/builders');
const utils = require('../../utils')

module.exports = {
    perms: [],
    data: new SlashCommandBuilder()
        .setName('globalban')
        .setDescription('Ban a user from all servers the bot is in')
        .addUserOption((option) => option.setName('user').setDescription('The user to ban').setRequired(true))
        .addStringOption((option) => option.setName('reason').setDescription('The reason for the ban').setRequired(false)),
    async execute(interaction) {

        const reason = interaction.options.getString('reason') || 'No reason specified'
        const target = await interaction.guild.members.fetch(interaction.options.get('user').value)

        let num = 0;
        interaction.client.guilds.cache.forEach(server => {
            server.members.ban(target, { reason: `${reason} - ${interaction.user.tag}`}).catch(err => {
                num -= 1
            })
            num += 1;
        })
        const loggingchannel = await interaction.client.channels.fetch(utils.sendLogs('globalban')).catch(err => {})

        const embed = new Discord.MessageEmbed()
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
        if(loggingchannel) loggingchannel.send({embeds: [embed]}).catch(err => {})
        

    },
};
