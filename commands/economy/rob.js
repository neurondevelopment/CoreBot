const db = require('quick.db');
const ms = require('ms');
const { maxRobPercent, currency, enabled, maxRobTimeout } = require('../../config.json').economy
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    perms: [],
    data: new SlashCommandBuilder()
        .setName('rob')
        .setDescription('Rob a poor innocent person of their hard earned money')
        .addUserOption((option) => option.setName('user').setDescription('The user to rob').setRequired(true)),
    execute(interaction) {
        if(!enabled) return;
        const victimID = interaction.options.get('user').value
        const victim = db.get(`wallet.${victimID}`);
        const time = db.get(`rob.${interaction.user.id}`);
        const author = db.get(`wallet.${interaction.user.id}`);
        if (victimID == interaction.user.id) {
            return interaction.reply({ content: 'You cannot rob yourself :/', ephemeral: true })
        }

        if (time !== null && maxRobTimeout - (Date.now() - time) > 0) {
            const time2 = ms(maxRobTimeout - (Date.now() - time));

            return interaction.reply({ content: `You have already recently robbed someone\n\nTry again in ${time2}`, ephemeral: true });
        }
        else { 

            if (author < 200) return interaction.reply({ content: `You need at least 200 ${currency} in your wallet to rob someone`, ephemeral: true });

            if (victim < 1) return interaction.reply({ content: `That user has nothing for you to rob!`, ephemeral: true });
            
            const chance = Math.floor(Math.random() * 3)

            if(chance === 3) {
                let random = Math.floor(Math.random() * maxRobPercent) + 1
                let amount = author * (random / 100)

                if(amount > author) {
                    amount = author;
                }
                interaction.reply({ content: `Unlucky, this user knows some karate and has instead robbed you of ${amount} ${currency}`, ephemeral: true})

                db.subtract(`wallet.${author}`, amount);
                db.add(`wallet.${victimID}`, amount);
            }
            else {
                let random = Math.floor(Math.random() * maxRobPercent) + 1
                let amount = victim * (random / 100)

                if(amount > victim) {
                    amount = victim;
                }

                interaction.reply({ content: `Successfully robbed user for ${amount} ${currency}`, ephemeral: true})

                db.subtract(`wallet.${victimID}`, amount);
                db.add(`wallet.${interaction.user.id}`, amount);
                db.set(`rob.${interaction.user.id}`, Date.now());
            }
        }
    },
};