const Discord = require('discord.js');
const ms = require("ms");
const { embedcolour } = require('../../config.json').commands.timeout
const { footer } = require('../../config.json')
const { SlashCommandBuilder } = require('@discordjs/builders');
const utils = require('../../utils')

module.exports = {
    perms: [],
    data: new SlashCommandBuilder()
        .setName('timeout')
        .setDescription('Time out a user for specified time')
        .addUserOption((option) => option.setName('user').setDescription('The user to timeout').setRequired(true))
        .addStringOption((option) => option.setName('time').setDescription('How long to timeout the user for').setRequired(true)),
    async execute(interaction) {
    
    const time = interaction.options.get('time') ? interaction.options.get('time').value : '10m'
    const user = await interaction.guild.members.fetch(interaction.options.get('user').value)

    if(!ms(time)) return interaction.reply({ content: 'Invalid time specified!', ephemeral: true });

    user.timeout(ms(time))

    const embed = new Discord.MessageEmbed()
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
    const loggingchannel = interaction.client.channels.cache.get(utils.sendLogs('timeout'))
    loggingchannel.send({embeds: [embed]})

  },
};