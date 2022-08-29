const { db } = require('../../index')
const { currency, enabled } = require('../../config.json').economy
const { EmbedBuilder, SlashCommandBuilder } = require('discord.js')

module.exports = {
    perms: [],
    data: new SlashCommandBuilder()
        .setName('balance')
        .setDescription('Check balance of yourself or someone else')
        .addUserOption((option) => option.setName('user').setDescription('The user\'s balance to check').setRequired(false)),
    async execute(interaction) {
        if(!enabled) return;
        const user = interaction.options.getString('user') || interaction.user
        let wallet = await db.get(`wallet.${user.id}`) || 0;

        let bank = await db.get(`bank.${user.id}`) || 0;

        const balEmbed = new EmbedBuilder()
            .setColor('Random')
            .setAuthor({ name: `${user.username}'s Balance`, iconURL: user.displayAvatarURL()})
            .addFields([
                { name: '**Wallet**', value: wallet.toString() },
                { name: '**Bank**', value: bank.toString() }
            ])
            .setDescription(`Currency - ${currency}`)
            .setFooter({ text: `Requested by: ${interaction.user.tag}`})
        interaction.reply({embeds: [balEmbed]});
    },
};