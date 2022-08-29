const db = require("quick.db");
const ms = require("ms");
const { currency, enabled } = require('../../config.json').economy
const { amount, timeout, embedcolour } = require('../../config.json').economy.bonus
const { EmbedBuilder, SlashCommandBuilder } = require('discord.js')


module.exports = {
    perms: [],
    data: new SlashCommandBuilder()
        .setName('bonus')
        .setDescription('Claim your bonus'),
    async execute(interaction) {
        if(!enabled) return;
        const bonus = await db.get(`bonus.${interaction.user.id}`);

        if (bonus && timeout - (Date.now() - bonus) > 0) {
          const time = ms(timeout - (Date.now() - bonus));

          interaction.reply({ content: `You've already collected your bonus\n\nIt can be collected again in ${time}`, ephemeral: true })
        }
        else {
          const moneyEmbed = new EmbedBuilder()
            .setColor(embedcolour)
            .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL()})
            .setDescription(`You've claimed your bonus of ${amount} ${currency}`);
          interaction.reply({embeds: [moneyEmbed], ephemeral: true });
          await db.add(`wallet.${interaction.user.id}`, amount);
          await db.set(`bonus.${interaction.user.id}`, Date.now());
        }
    },
};