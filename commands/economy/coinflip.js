const { db } = require('../../index')
const { enabled } = require('../../config.json').economy
const { SlashCommandBuilder } = require('discord.js')

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
                    { name: 'Heads', value: 'heads' },
                    { name: 'Tails ', value: 'tails' }
                )),
    async execute(interaction) {
        if(!enabled) return;
        const balance = await db.get(`wallet.${interaction.user.id}`);
        const amount = interaction.options.getInteger('amount')
        const winnings = amount * 2;
        let guess;
        const option = interaction.options.getString('choice')
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
            interaction.reply({ content:`Coin landed on: \`${guess}\`\n\nYou won the coinflip, winning you: \`${winnings - amount}\`, you now have \`${balance - amount + winnings}\``});
            await db.sub(`wallet.${interaction.user.id}`, amount);
            await db.add(`wallet.${interaction.user.id}`, winnings);
        }
        else {
            interaction.reply({ content: `Coin landed on: \`${guess}\`\n\nYou lost the coinflip! You now have \`${balance - amount}\`` });
            await db.sub(`wallet.${interaction.user.id}`, amount);
        }
    },
};