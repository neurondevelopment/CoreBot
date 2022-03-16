const db = require('quick.db');
const { currency, enabled } = require('../../config.json').economy

const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    perms: [],
    data: new SlashCommandBuilder()
        .setName('pay')
        .setDescription('Pay another user from your wallet')
        .addUserOption((option) => option.setName('user').setDescription('The user to pay').setRequired(true))
        .addIntegerOption((option) => option.setName('amount').setDescription('The amount to pay').setRequired(true)),
    execute(interaction) {
        if(!enabled) return;
        const bal = db.get(`wallet.${interaction.user.id}`);
        const amount = interaction.options.get('amount').value;

        if (!bal || bal < 1) return interaction.reply({ content:'You do not have any money in your wallet!', ephemeral: true })
        
        if (amount > bal) return interaction.reply({ content:'You do not have enough money in your wallet!', ephemeral: true })
        if(amount < 0) return interaction.reply({ content:'You cannot put people into debt...', ephemeral: true })
        interaction.reply({ content:`Successfully payed user ${amount} ${currency}`, ephemeral: true })
        
        db.subtract(`wallet.${interaction.user.id}`, amount);
        db.add(`wallet.${interaction.options.get('user').value}`, amount);
    },
};