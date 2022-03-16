const discord = require('discord.js');
const db = require('quick.db');
const ms = require('ms');
const {  footer } = require('../../config.json');
const { SlashCommandBuilder } = require('@discordjs/builders');
const utils = require('../../utils')

module.exports = {
    perms: [],
    data: new SlashCommandBuilder()
        .setName('serverlockdown')
        .setDescription('Prevent @everyone from speaking in any channel')
        .addStringOption((option) => option.setName('time').setDescription('How long to lock the channel for').setRequired(false)),
    async execute(interaction) {
        const time = interaction.options.get('time') ? interaction.options.get('time').value : '10m';
        if(!ms(time)) return interaction.reply({ content: 'Invalid time specified!', ephemeral: true });
        interaction.guild.channels.cache.forEach(async (channel, id) => {
            const yes = channel.permissionsFor(interaction.guild.roles.everyone).has('SEND_MESSAGES');
             if(yes) {
                await channel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
                    SEND_MESSAGES: false,
                });
                db.push(`settings_${interaction.guild.id}.locked`, channel.id);
                setTimeout(async function() {
                        await channel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
                           SEND_MESSAGES: null,
                        });
                }, ms(time));
            }
         });

         const embed = new discord.MessageEmbed()
         .setColor('#f57c73')
         .setTitle(`Server Locked`)
         .setThumbnail(`${interaction.guild.iconURL() || ''}`)
         .setDescription(`This server was locked for \`${time}\``)
         .setTimestamp()
         .setFooter({ text: footer, iconURL: interaction.guild.iconURL()})

         interaction.reply({embeds: [embed]}).then(msg => {
            setTimeout(() => msg.delete(), ms(time));
         });

          const logEmbed = new discord.MessageEmbed()
            .setColor('#f57c73')
            .setTitle('Server Locked')
            .setDescription(`The server was successfully locked down!`)
            .setThumbnail(interaction.guild.iconURL())
            .addFields(
                { name: '\u200B', value: '\u200B' },
                { name: 'Moderator', value: `${interaction.user.tag}`, inline: true },
                { name: 'Time', value: `${time}`, inline: true },
            )
            .setTimestamp()
            .setFooter({ text: footer, iconURL: interaction.guild.iconURL()})

            const loggingchannel = interaction.client.channels.cache.get(utils.sendLogs('lockdown'))
            loggingchannel.send({embeds: [logEmbed]})
        }
};