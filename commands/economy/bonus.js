const Discord = require('discord.js');
const db = require("quick.db");
const ms = require("ms");
const { currency, enabled } = require('../../config.json').economy
const { amount, timeout, embedcolour } = require('../../config.json').economy.bonus
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    perms: [],
    data: new SlashCommandBuilder()
        .setName('bonus')
        .setDescription('Claim your bonus'),
    execute(interaction) {
        if(!enabled) return;

        const bonus = db.get(`bonus.${interaction.user.id}`);

        if (bonus !== null && timeout - (Date.now() - bonus) > 0) {
          const time = ms(timeout - (Date.now() - bonus));

          interaction.reply({ content: `You've already collected your bonus\n\nIt can be collected again in ${time}`, ephemeral: true })
        }
        else {
          const moneyEmbed = new Discord.MessageEmbed()
            .setColor(embedcolour)
            .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL()})
            .setDescription(`You've claimed your bonus of ${amount} ${currency}`);
         interaction.reply({embeds: [moneyEmbed], ephemeral: true });
         db.add(`wallet.${interaction.user.id}`, amount);
         db.set(`bonus.${interaction.user.id}`, Date.now());


  }
    },
};