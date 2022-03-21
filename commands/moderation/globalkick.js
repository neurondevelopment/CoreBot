const Discord = require('discord.js');
const { footer } = require('../../config.json')
const { embedcolour } = require('../../config.json').commands.globalkick
const utils = require('../../utils')
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    perms: [],
    data: new SlashCommandBuilder()
        .setName('globalkick')
        .setDescription('Kick a user from all servers the bot is in')
        .addUserOption((option) => option.setName('user').setDescription('The user to kick').setRequired(true))
        .addStringOption((option) => option.setName('reason').setDescription('The reason for the kick').setRequired(false)),
    async execute(interaction) {

        const reason = interaction.options.get('reason') ? interaction.options.get('reason').value : 'No reason specified'
        const target = await interaction.guild.members.fetch(interaction.options.get('user').value)

        let num = 0;
        interaction.client.guilds.cache.forEach(server => {
            server.members.cache.get(target.user.id).kick(`${reason} - ${interaction.user.tag}`).catch(err => {
                num -= 1
            });
            num += 1;
        })
        const loggingchannel = await interaction.client.channels.fetch(utils.sendLogs('globalkick')).catch(err => { })
        const embed = new Discord.MessageEmbed()
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
        
        if(loggingchannel) loggingchannel.send({embeds: [embed]});


    },
};