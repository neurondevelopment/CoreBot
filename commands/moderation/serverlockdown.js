const { db } = require('../../index')
const ms = require('ms');
const { footer } = require('../../config.json');
const { EmbedBuilder, SlashCommandBuilder } = require('discord.js')
const { sendLogs } = require('../../utils')

module.exports = {
    perms: [],
    requirePermEmbed: true,
    data: new SlashCommandBuilder()
        .setName('serverlockdown')
        .setDescription('Prevent @everyone from speaking in any channel')
        .addStringOption((option) => option.setName('time').setDescription('How long to lock the channel for').setRequired(false)),
    async execute(interaction) {
        const time = interaction.options.getString('time') || '10m';
        if(!ms(time)) return interaction.reply({ content: 'Invalid time specified!', ephemeral: true });
        interaction.guild.channels.cache.forEach(async (channel, id) => {
            const yes = channel.permissionsFor(interaction.guild.roles.everyone).has('SendMessages');
             if(yes) {
                await channel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
                    SendMessages: false,
                });
                await db.push(`settings_${interaction.guild.id}.locked`, channel.id);
                setTimeout(async function() {
                    await channel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
                        SendMessages: null,
                    });
                }, ms(time));
            }
         });

         const embed = new EmbedBuilder()
            .setColor('#f57c73')
            .setTitle(`Server Locked`)
            .setThumbnail(`${interaction.guild.iconURL() || ''}`)
            .setDescription(`This server was locked for \`${time}\``)
            .setTimestamp()
            .setFooter({ text: footer, iconURL: interaction.guild.iconURL()})

         interaction.reply({embeds: [embed]}).then(msg => {
            setTimeout(() => msg.delete(), ms(time));
         });

          const logEmbed = new EmbedBuilder()
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

            const loggingChannel = await interaction.client.channels.fetch(sendLogs('lockdown')).catch(err => { })
            if(loggingChannel) loggingChannel.send({embeds: [logEmbed]})
        }
};