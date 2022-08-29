const { footer } = require('../../config.json')
const { EmbedBuilder, SlashCommandBuilder } = require('discord.js')
const ms = require('ms')
const { sendLogs, formatTimestamp } = require('../../utils')
const fs = require('fs')

module.exports = {
    perms: [],
    requirePermEmbed: true,
    data: new SlashCommandBuilder()
        .setName('temprole')
        .setDescription('Temporarily add a role to a user')
        .addUserOption((option) => option.setName('member').setDescription('The member to add the role to').setRequired(true))
        .addRoleOption((option) => option.setName('role').setDescription('The role to add to the member').setRequired(true))
        .addStringOption((option) => option.setName('time').setDescription('The time to add the role for').setRequired(true)),
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true })
        const member = interaction.options.getMember('member')
        const role = interaction.options.getRole('role')
        const time = ms(interaction.options.getString('time'))
        if(role.position >= interaction.member.roles.highest.position) return interaction.editReply({ content: 'You cannot give roles that have a higher or equal position to your own!', ephemeral: true })

        if(!time) return interaction.editReply({ content: 'Invalid time specified!', ephemeral: true });
        let failed
        member.roles.add(role).catch(err => { 
            failed = true
            interaction.editReply({ content: 'Unable to add role to that user', ephemeral: true }) 
        })
        if(failed) return;

        const roleDB = JSON.parse(fs.readFileSync('./db/temproles.json'))
        if(!roleDB[interaction.guild.id]) roleDB[interaction.guild.id] = {}
        if(!roleDB[interaction.guild.id][member.id]) roleDB[interaction.guild.id][member.id] = []
        if(roleDB[interaction.guild.id][member.id].filter(r => r.role === role.id)[0]) {
            roleDB[interaction.guild.id][member.id].filter(r => r.role === role.id)[0].time = Date.now() + time
        }
        else {
            roleDB[interaction.guild.id][member.id].push({ role: role.id, time: Date.now() + time })
        }
        fs.writeFileSync('./db/temproles.json', JSON.stringify(roleDB))

        interaction.editReply({ content: `Successfully gave ${member.user.tag} the role <@&${role.id}> for \`${interaction.options.getString('time')}\` it will expire on <t:${Math.floor((Date.now() + time) / 1000)}>`, ephemeral: true })

        const embed = new EmbedBuilder()
            .setColor('Green')
            .setTitle('Temp Role Added')
            .setThumbnail(member.user.displayAvatarURL())
            .setDescription(`${interaction.user.tag} successfully gave \`${member.user.tag}\` the role ${role.name} for \`${interaction.options.getString('time')}\``)
            .addFields(
                { name: 'Mod\'s Discord', value: `${interaction.user.tag}`, inline: true },
                { name: 'Mod\'s ID', value: `${interaction.user.id}`, inline: true },
                { name: 'Expires', value: `<t:${Math.floor((Date.now() + time) / 1000)}>`, inline: true}
            )
            .setTimestamp()
            .setFooter({ text: `${footer} - Made By Cryptonized`, iconURL: interaction.guild.iconURL()});

        const loggingChannel = await interaction.client.channels.fetch(sendLogs('temprole')).catch(err => { })
        if(loggingChannel) loggingChannel.send({embeds: [embed]})

    },
};