const Discord = require('discord.js');
const { footer } = require('../../config.json')
const { perms, embedcolour } = require('../../config.json').commands.ban
const { SlashCommandBuilder } = require('@discordjs/builders');
const utils = require('../../utils')

module.exports = {
    perms: [],
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('Ban a user')
        .addUserOption((option) => option.setName('user').setDescription('The user to ban').setRequired(true))
        .addStringOption((option) => option.setName('reason').setDescription('The reason for the ban').setRequired(false)),
    async execute(interaction) {

        const reason = interaction.options.get('reason') ? interaction.options.get('reason').value : 'No reason specified'
        const target = await interaction.guild.members.fetch(interaction.options.get('user').value)

        let fail;
        await interaction.guild.members.ban(target, { reason: `${reason} - ${interaction.user.tag}`})
            .catch(err => {
                fail = true;
                interaction.reply({ content: 'Unable to ban that user', ephemeral: true })
            })
        if(fail) return;
        const embed = new Discord.MessageEmbed()
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
        const loggingchannel = interaction.client.channels.cache.get(utils.sendLogs('ban'))
        loggingchannel.send({embeds: [embed]})

    },
};