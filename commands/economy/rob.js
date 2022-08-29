const { db } = require('../../index')
const ms = require('ms');
const { maxRobPercent, currency, enabled, maxRobTimeout } = require('../../config.json').economy
const { SlashCommandBuilder } = require('discord.js')

module.exports = {
    perms: [],
    data: new SlashCommandBuilder()
        .setName('rob')
        .setDescription('Rob a poor innocent person of their hard earned money')
        .addUserOption((option) => option.setName('user').setDescription('The user to rob').setRequired(true)),
    async execute(interaction) {
        if(!enabled) return;
        const victimID = interaction.options.getUser('user').id
        const victim = await db.get(`wallet.${victimID}`);
        const time = await db.get(`rob.${interaction.user.id}`);
        const author = await db.get(`wallet.${interaction.user.id}`);
        if (victimID == interaction.user.id) return interaction.reply({ content: 'You cannot rob yourself :/', ephemeral: true })
        

        if (time !== null && maxRobTimeout - (Date.now() - time) > 0) {
            const time2 = ms(maxRobTimeout - (Date.now() - time));

            return interaction.reply({ content: `You have already recently robbed someone\n\nTry again in ${time2}`, ephemeral: true });
        }
        else { 

            if (!author || author < 200) return interaction.reply({ content: `You need at least 200 ${currency} in your wallet to rob someone`, ephemeral: true });

            if (!victim || victim < 1) return interaction.reply({ content: `That user has nothing for you to rob!`, ephemeral: true });
            
            const chance = Math.floor(Math.random() * 3)

            if(chance === 3) {
                let random = Math.floor(Math.random() * maxRobPercent) + 1
                let amount = author * (random / 100)

                if(amount > author) {
                    amount = author;
                }
                interaction.reply({ content: `Unlucky, this user knows some karate and has instead robbed you of ${amount} ${currency}`, ephemeral: true})

                await db.sub(`wallet.${author}`, amount);
                await db.add(`wallet.${victimID}`, amount);
            }
            else {
                let random = Math.floor(Math.random() * maxRobPercent) + 1
                let amount = victim * (random / 100)

                if(amount > victim) {
                    amount = victim;
                }

                interaction.reply({ content: `Successfully robbed user for ${amount} ${currency}`, ephemeral: true})

                await db.sub(`wallet.${victimID}`, amount);
                await db.add(`wallet.${interaction.user.id}`, amount);
                await db.set(`rob.${interaction.user.id}`, Date.now());
            }
        }
    },
};