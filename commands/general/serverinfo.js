const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js')
const { formatTimestamp } = require('../../utils')

module.exports = {
    perms: [],
    data: new SlashCommandBuilder()
        .setName('serverinfo')
        .setDescription('Get some information on this server'),
    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setColor('Random')
            .setAuthor({ name: `${interaction.guild.name}`, iconURL: interaction.guild.iconURL() })
            .addFields([
                { name: 'Server ID', value: `\`${interaction.guild.id}\``, inline: true },
                { name: 'Owner ID', value: `\`${interaction.guild.ownerId}\``, inline: true },
                { name: 'Server Created', value: `\`${formatTimestamp(interaction.guild.createdAt)}\``, inline: true },
                { name: 'Channel Count', value: `\`\`\`${interaction.guild.channels.cache.size}\`\`\``, inline: true },
                { name: 'Role Count', value: `\`\`\`${interaction.guild.roles.cache.size}\`\`\``, inline: true },
                { name: 'Member Count', value: `\`\`\`${interaction.guild.memberCount}\`\`\``, inline: true },
            ])
            .setThumbnail(interaction.guild.iconURL())
            .setTimestamp()

        interaction.reply({ embeds: [embed] })
    },
};