const Discord = require('discord.js');
const db = require('quick.db')
const { footer } = require('../../config.json')
const { embedcolour } = require('../../config.json').commands.kick
const { SlashCommandBuilder } = require('@discordjs/builders');
const utils = require('../../utils')

module.exports = {
    perms: [],
    data: new SlashCommandBuilder()
        .setName('kick')
        .setDescription('Kick a user from the server')
        .addUserOption((option) => option.setName('user').setDescription('The user to kick').setRequired(true))
        .addStringOption((option) => option.setName('reason').setDescription('The reason for the kick').setRequired(false)),
    async execute(interaction) {

        const reason = interaction.options.get('reason') ? interaction.options.get('reason').value : 'No reason specified'
        const target = await interaction.guild.members.fetch(interaction.options.get('user').value)

        const today = new Date();
        const dateTime = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();

        let fail;
        await target.kick(`${reason} - ${interaction.user.tag}`)
            .catch(err => {
                fail = true;
                interaction.reply({ content: 'Unable to kick that user!', ephemeral: true})
            })
        if(fail) return;
            
        const embed = new Discord.MessageEmbed()
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
        const loggingchannel = interaction.client.channels.cache.get(utils.sendLogs('kick'))
        loggingchannel.send({embeds: [embed]})
        db.push(`kicks_${target.id}`, `**${reason}** - ${interaction.user.tag} - ${dateTime}`)



    },
};