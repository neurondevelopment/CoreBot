const { db } = require('../../index')
const { levelsEnabled, xpNeededPerLevel } = require('../../config.json').level
const { imageOrColor, data, progressBarColour } = require('../../config.json').level.rank
const canvacord = require('canvacord');
const { AttachmentBuilder, SlashCommandBuilder } = require('discord.js')

module.exports = {
    perms: [],
    data: new SlashCommandBuilder()
        .setName('rank')
        .setDescription('Check the rank of yourself or another user')
        .addUserOption((option) => option.setName('user').setDescription('The user to check').setRequired(false)),
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true })
        if(!levelsEnabled) return interaction.reply({ content: 'Levelling system is disabled!', ephemeral: true });
        const user = interaction.options.getUser('user') || interaction.user;
        const level = await db.get(`level.${user.id}`) || 1;
        const xp = await db.get(`xp.${user.id}`) || 1;
        const xpNeeded = level * xpNeededPerLevel;
        let every = await db.all()
        every = every.filter(i => i.id.startsWith(`guild.xptotal_`)).sort((a, b) => b.data - a.data)
        const rank = every.map(x => x.id).indexOf(`xptotal.${user.id}`) + 1;

        const image = new canvacord.Rank()
            .setUsername(user.username)
            .setDiscriminator(user.discriminator)
            .setBackground(imageOrColor, data)
            .setCurrentXP(xp)
            .setRequiredXP(xpNeeded)
            .setRank(rank)
            .setLevel(level)
            .setAvatar(user.displayAvatarURL({ format: "png" }))
            .setProgressBar(progressBarColour, 'COLOR')

        image.build()
            .then(data => {
                const attachment = new AttachmentBuilder(data, { name: "rank.png" });
                interaction.editReply({files: [attachment], ephemeral: true})
            });
    },
};