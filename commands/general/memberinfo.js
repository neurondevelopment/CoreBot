const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js')
const { formatTimestamp } = require('../../utils')

module.exports = {
    perms: [],
    data: new SlashCommandBuilder()
        .setName('memberinfo')
        .setDescription('Get some information on a member')
        .addUserOption((option) => option.setName('member').setDescription('The user to get information on').setRequired(false)),
    async execute(interaction) {
        const member = interaction.options.getMember('member') || interaction.member
        const missing = member.permissions.missing(PermissionsBitField.All)
        let permissions = []
        member.permissions.toArray().forEach(permission => {
            permissions.push(`✅ ${permission}`)
        })
        missing.forEach(permission => {
            permissions.push(`🚫 ${permission}`)
        })

        const embed = new EmbedBuilder()
            .setColor('Random')
            .setAuthor({ name: `${member.user.username}'s Info`, iconURL: member.user.displayAvatarURL() })
            .addFields([
                { name: 'User ID', value: `\`${member.id}\``, inline: true },
                { name: 'Account Created', value: `\`${formatTimestamp(member.user.createdAt)}\``, inline: true },
                { name: 'Joined Server', value: `\`${formatTimestamp(member.joinedAt)}\``, inline: true },
                { name: 'Permissions', value: `\`\`\`${permissions.join('\n')}\`\`\``, inline: false }
            ])
            .setThumbnail(member.user.displayAvatarURL())
            .setTimestamp()

        interaction.reply({ embeds: [embed] })
    },
};