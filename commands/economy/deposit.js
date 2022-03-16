const db = require('quick.db');
const { currency, enabled } = require('../../config.json').economy

const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    perms: [],
    data: new SlashCommandBuilder()
        .setName('deposit')
        .setDescription('Put money into your bank from your wallet')
        .addIntegerOption((option) => option.setName('amount').setDescription('The amount to bet').setRequired(true)),
    execute(interaction) {
        if(!enabled) return;
        const wallet = db.get(`wallet.${interaction.user.id}`);

        if (!wallet) return interaction.reply({ content: 'You dont have any money to deposit!', ephemeral: true });
        
        if(!wallet) return interaction.reply({ content: 'You dont have any money to deposit!', ephemeral: true });
        if(wallet > 0) {
            amount = wallet;
        }
        else {
            return interaction.reply({ content: 'You dont have any money to deposit!', ephemeral: true });
        }

        if(wallet < amount) return interaction.reply({ content: 'You do not have that much money!', ephemeral: true });
        if(amount < 1) return interaction.reply({ content: `You need to deposit at least 1 ${currency}`, ephemeral: true });
        interaction.reply({ content: `Successfully deposited ${amount}`, ephemeral: true });
        

        db.add(`bank.${interaction.user.id}`, amount);
        db.subtract(`wallet.${interaction.user.id}`, amount);
    },
};