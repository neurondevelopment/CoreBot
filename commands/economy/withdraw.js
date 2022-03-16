const db = require('quick.db');
const { currency, enabled } = require('../../config.json').economy
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    perms: [],
    data: new SlashCommandBuilder()
        .setName('withdraw')
        .setDescription('Take money out of your bank into your wallet')
        .addIntegerOption((option) => option.setName('amount').setDescription('The amount to bet').setRequired(true)),
    execute(interaction) {
        if(!enabled) return;
        const bank = db.get(`bank.${interaction.user.id}`);
        let amount = interaction.options.get('amount').value;

        if (bank === null || bank < 1) return interaction.reply({ content: 'You do not have any money to withdraw!', ephemeral: true });
        
        if(bank < amount) return interaction.reply({content: 'You do not have that much money!', ephemeral: true });
        if(amount < 1) return interaction.reply({content: `You need to withdraw at least 1 ${currency}!`, ephemeral: true });
        interaction.reply({ content:`Successfully withdrew ${amount}`, ephemeral: true });


        db.subtract(`bank.${interaction.user.id}`, amount);
        db.add(`wallet.${interaction.user.id}`, amount);
    },
};