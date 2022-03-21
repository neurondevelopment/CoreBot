const Discord = require('discord.js');
const { embedcolour } = require('../../config.json').commands.globalunban
const { footer } = require('../../config.json')
const { SlashCommandBuilder } = require('@discordjs/builders');
const utils = require('../../utils')

module.exports = {
    perms: [],
    data: new SlashCommandBuilder()
        .setName('globalunban')
        .setDescription('Unban a user from all servers the bot is in')
        .addStringOption((option) => option.setName('user').setDescription('The user ID to unban').setRequired(true)),
    async execute(interaction) {

        const target = interaction.options.get('user').value

        interaction.client.guilds.cache.forEach(server => {
            server.members.unban(target).catch(err => {
                //
            });
        })
        const embed = new Discord.MessageEmbed()
            .setColor(embedcolour)
            .setTitle('Globally Unbanned Member')
            .setDescription(`Successfully unbanned user with ID \`${target}\` from all servers`)
            .setTimestamp()
            .setFooter({ text: `${footer} - Made By Cryptonized`, iconURL: interaction.guild.iconURL()});
        interaction.reply({embeds: [embed]})
        const loggingchannel = await interaction.client.channels.fetch(utils.sendLogs('globalunban')).catch(err => { })
        if(loggingchannel) loggingchannel.send({embeds: [embed]})
    },
};