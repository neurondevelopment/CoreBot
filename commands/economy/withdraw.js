const { db } = require('../../index')
const { currency, enabled } = require('../../config.json').economy
const { SlashCommandBuilder } = require('discord.js')

module.exports = {
    perms: [],
    data: new SlashCommandBuilder()
        .setName('withdraw')
        .setDescription('Take money out of your bank into your wallet')
        .addIntegerOption((option) => option.setName('amount').setDescription('The amount to bet').setRequired(true)),
    async execute(interaction) {
        if(!enabled) return;
        const bank = await db.get(`bank.${interaction.user.id}`);
        let amount = interaction.options.getInteger('amount');

        if (bank === null || bank < 1) return interaction.reply({ content: 'You do not have any money to withdraw!', ephemeral: true });
        
        if(bank < amount) return interaction.reply({content: 'You do not have that much money!', ephemeral: true });
        if(amount < 1) return interaction.reply({content: `You need to withdraw at least 1 ${currency}!`, ephemeral: true });
        interaction.reply({ content:`Successfully withdrew ${amount}`, ephemeral: true });


        await db.sub(`bank.${interaction.user.id}`, amount);
        await db.add(`wallet.${interaction.user.id}`, amount);
    },
};