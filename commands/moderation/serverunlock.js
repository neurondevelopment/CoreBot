const discord = require('discord.js');
const utils = require('../../utils.js');
const db = require('quick.db');
const {  footer } = require('../../config.json');
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    perms: [],
    data: new SlashCommandBuilder()
        .setName('serverunlock')
        .setDescription('Unlocks the server'),
    async execute(interaction) {

        const all = db.get(`settings_${interaction.guild.id}.locked`);
        interaction.guild.channels.cache.forEach(async (channel, id) => {
            try {
                if(all.indexOf(channel.id) >= 0) {
                    await channel.permissionOverwrites.edit(interaction.channel.guild.roles.everyone, {
                        SEND_MESSAGES: null,
                     });
                }
            }
            catch {
                // caught idk
            }
         });

         const embed = new discord.MessageEmbed()
         .setColor('GREEN')
         .setTitle(`Server Unlocked`)
         .setThumbnail(`${interaction.guild.iconURL() || ''}`)
         .setDescription(`This server was unlocked`)
         .setTimestamp()
         .setFooter({ text: footer, iconURL: interaction.guild.iconURL()})

         interaction.reply({embeds: [embed]});

          const logEmbed = new discord.MessageEmbed()
            .setColor('GREEN')
            .setTitle('Server Locked')
            .setDescription(`The server was successfully unlocked!`)
            .setThumbnail(interaction.guild.iconURL())
            .addFields(
                { name: '\u200B', value: '\u200B' },
                { name: 'Moderator', value: `${interaction.user.tag}`, inline: true },
                { name: 'Moderator ID', value: `${interaction.user.id}`, inline: true }
            )
            .setTimestamp()
            .setFooter({ text: footer, iconURL: interaction.guild.iconURL()})

            const loggingchannel = await interaction.client.channels.fetch(utils.sendLogs('lockdown')).catch(err => { })
            if(loggingchannel) loggingchannel.send({embeds: [logEmbed]})
        }
};
