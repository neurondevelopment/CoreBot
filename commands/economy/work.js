const ms = require('ms');
const Discord = require('discord.js');
const db = require('quick.db');
const { currency, enabled } = require('../../config.json').economy
const { timeout, minHard, maxHard, minNormal, maxNormal, workHardChance, hardembedcolour, normalembedcolour } = require('../../config.json').economy.work
let { jobs } = require('../../config.json').economy.work
jobs = jobs.split(',')
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    perms: [],
    data: new SlashCommandBuilder()
        .setName('work')
        .setDescription('Get money from working'),
    execute(interaction) {
        if(!enabled) return;
        const author = db.get(`work.${interaction.user.id}`);

        if (author !== null && timeout - (Date.now() - author) > 0) {
            const time = ms(timeout - (Date.now() - author));

            interaction.reply({ content: `You have already worked recently\n\nTry again in ${time}`, ephemeral: true})
          }
        else {

            const result = Math.floor((Math.random() * jobs.length));
            let amount = 0;
            const hard = Math.floor(Math.random() * workHardChance) + 1;

            if (hard == 1) {
                amount = Math.floor(Math.random() * (maxHard - minHard)) + 1 + minHard;
                const embed = new Discord.MessageEmbed()
                    .setColor(hardembedcolour)
                    .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL()})
                    .setDescription(`You worked hard as a \`${jobs[result]}\` and earned ${amount} ${currency}`);
                interaction.reply({ embeds: [embed], ephemeral: true})
            }
            else {
                amount = Math.floor(Math.random() * (maxNormal - minNormal)) + 1 + minNormal;
                const embed = new Discord.MessageEmbed()
                    .setColor(normalembedcolour)
                    .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL()})
                    .setDescription(`You worked as a \`${jobs[result]}\` and earned ${amount} ${currency}`);
                interaction.reply({ embeds: [embed], ephemeral: true})
            }

            db.add(`wallet.${interaction.user.id}`, amount);
            db.set(`work.${interaction.user.id}`, Date.now());
        }
    },
};