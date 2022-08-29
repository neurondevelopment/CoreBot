const { embedcolour } = require('../../config.json').commands.globalunban
const { footer } = require('../../config.json')
const { EmbedBuilder, SlashCommandBuilder } = require('discord.js')
const { sendLogs } = require('../../utils')

module.exports = {
    perms: [],
    requirePermEmbed: true,
    data: new SlashCommandBuilder()
        .setName('globalunban')
        .setDescription('Unban a user from all servers the bot is in')
        .addStringOption((option) => option.setName('user').setDescription('The user ID to unban').setRequired(true)),
    async execute(interaction) {
        const target = interaction.options.getString('user')

        interaction.client.guilds.cache.forEach(server => {
            server.members.unban(target).catch(err => { });
        })
        const embed = new EmbedBuilder()
            .setColor(embedcolour)
            .setTitle('Globally Unbanned Member')
            .setDescription(`Successfully unbanned user with ID \`${target}\` from all servers`)
            .setTimestamp()
            .setFooter({ text: `${footer} - Made By Cryptonized`, iconURL: interaction.guild.iconURL()});
        interaction.reply({embeds: [embed]})
        const loggingChannel = await interaction.client.channels.fetch(sendLogs('globalunban')).catch(err => { })
        if(loggingChannel) loggingChannel.send({embeds: [embed]})
    },
};