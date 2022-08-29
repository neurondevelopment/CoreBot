const { db } = require('../../index')
const { currency, enabled } = require('../../config.json').economy
const { SlashCommandBuilder } = require('discord.js')

module.exports = {
    perms: [],
    data: new SlashCommandBuilder()
        .setName('deposit')
        .setDescription('Put money into your bank from your wallet')
        .addIntegerOption((option) => option.setName('amount').setDescription('The amount to deposit').setRequired(false)),
    async execute(interaction) {
        const amount = interaction.options.getInteger('amount')
        if(!enabled) return;
        const wallet = await db.get(`wallet.${interaction.user.id}`);

        if (!wallet) return interaction.reply({ content: 'You dont have any money to deposit!', ephemeral: true });
        
        if(!wallet || wallet < 1) return interaction.reply({ content: 'You dont have any money to deposit!', ephemeral: true });
        if(!amount) amount = wallet;
        

        if(wallet < amount) return interaction.reply({ content: 'You do not have that much money!', ephemeral: true });
        if(amount < 1) return interaction.reply({ content: `You need to deposit at least 1 ${currency}`, ephemeral: true });
        interaction.reply({ content: `Successfully deposited ${amount}`, ephemeral: true });
        

        await db.add(`bank.${interaction.user.id}`, amount);
        await db.sub(`wallet.${interaction.user.id}`, amount);
    },
};