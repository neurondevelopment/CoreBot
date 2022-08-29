const { db } = require('../../index')
const { currency, enabled } = require('../../config.json').economy

const { SlashCommandBuilder } = require('discord.js')

module.exports = {
    perms: [],
    data: new SlashCommandBuilder()
        .setName('pay')
        .setDescription('Pay another user from your wallet')
        .addUserOption((option) => option.setName('user').setDescription('The user to pay').setRequired(true))
        .addIntegerOption((option) => option.setName('amount').setDescription('The amount to pay').setRequired(true)),
    async execute(interaction) {
        if(!enabled) return;
        const bal = await db.get(`wallet.${interaction.user.id}`);
        const amount = interaction.options.getInteger('amount')

        if (!bal || bal < 1) return interaction.reply({ content:'You do not have any money in your wallet!', ephemeral: true })
        
        if (amount > bal) return interaction.reply({ content:'You do not have enough money in your wallet!', ephemeral: true })
        if(amount < 0) return interaction.reply({ content:'You cannot put people into debt...', ephemeral: true })
        interaction.reply({ content:`Successfully payed user ${amount} ${currency}`, ephemeral: true })
        
        await db.sub(`wallet.${interaction.user.id}`, amount);
        await db.add(`wallet.${interaction.options.getUser('user').id}`, amount);
    },
};