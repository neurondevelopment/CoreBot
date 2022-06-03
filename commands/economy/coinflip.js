const db = require('quick.db');
const { enabled } = require('../../config.json').economy
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    perms: [],
    data: new SlashCommandBuilder()
        .setName('coinflip')
        .setDescription('Bet your money on heads or tails')
        .addIntegerOption((option) => option.setName('amount').setDescription('The amount to bet').setRequired(true))
        .addStringOption(option =>
            option.setName('choice')
                .setDescription('Heads or Tails')
                .setRequired(true)
                .addChoices(
                    { 
                        name: 'Heads', value: 'heads',
                        name: 'Tails ', value: 'tails'
                    }
                )),
    execute(interaction) {
        if(!enabled) return;
        const balance = db.get(`wallet.${interaction.user.id}`);
        const amount = interaction.options.get('amount').value
        const winnings = amount * 2;
        let guess;
        const option = interaction.options.get('choice').value
        const choice = Math.floor(Math.random() * 2);

        if(choice === 0) {
            guess = 'heads';
        }
        else if (choice === 1) {
            guess = 'tails';
        }

        if(amount > balance) {
            return interaction.reply({ content: 'You do not have enough money to coinflip this amount!', ephemeral: true })
        }

        if(option === guess) {
            interaction.reply({ content:`Coin Landed On: \`${guess}\`\n\nYou won the coinflip, winning a total of: ${winnings}`});
            db.subtract(`wallet.${interaction.user.id}`, amount);
            db.add(`wallet.${interaction.user.id}`, winnings);
        }
        else {
            interaction.reply({ content: `Coin Landed On: \`${guess}\`\n\nYou lost the coinflip!` });
            db.subtract(`wallet.${interaction.user.id}`, amount);
        }
    },
};