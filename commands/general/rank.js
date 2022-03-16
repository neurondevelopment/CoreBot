const Discord = require('discord.js');
const db = require('quick.db');
const { levelsEnabled, xpNeededPerLevel } = require('../../config.json').level
const { imageOrColor, data, progressBarColour } = require('../../config.json').level.rank
const canvacord = require('canvacord');
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    perms: [],
    data: new SlashCommandBuilder()
        .setName('rank')
        .setDescription('Check the rank of yourself or another user')
        .addUserOption((option) => option.setName('user').setDescription('The user to check').setRequired(false)),
    async execute(interaction) {
        if(!levelsEnabled) return interaction.reply({ content: 'Levelling system is disabled!', ephemeral: true });
        const user = await interaction.client.users.fetch((interaction.options.get('user') ? interaction.options.get('user').value : interaction.user.id))
        const level = db.get(`level.${user.id}`) || 1;
        const xp = db.get(`xp.${user.id}`) || 1;
        const xpNeeded = level * xpNeededPerLevel;
        const every = db
            .all()
            .filter(i => i.ID.startsWith(`guild.xptotal_`))
            .sort((a, b) => b.data - a.data)
        const rank = every.map(x => x.ID).indexOf(`xptotal.${user.id}`) + 1;

        const image = new canvacord.Rank()
            .setUsername(user.username)
            .setDiscriminator(user.discriminator)
            .setBackground(imageOrColor, data)
            .setCurrentXP(xp)
            .setRequiredXP(xpNeeded)
            .setRank(rank)
            .setLevel(level)
            .setAvatar(user.displayAvatarURL({ format: "png" }))
            .setProgressBar(progressBarColour)

        image.build()
            .then(data => {
                const attachment = new Discord.MessageAttachment(data, "rank.png");
                interaction.reply({files: [attachment], ephemeral: true})
            });
    },
};