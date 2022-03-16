const db = require('quick.db');
const Discord = require('discord.js');
const { currency, enabled } = require('../../config.json').economy
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    perms: [],
    data: new SlashCommandBuilder()
        .setName('balance')
        .setDescription('Check balance of yourself or someone else')
        .addUserOption((option) => option.setName('user').setDescription('The user\'s balance to check').setRequired(false)),
    execute(interaction) {
        if(!enabled) return;
        const user = interaction.options.get('user') ? interaction.client.users.cache.get(interaction.options.get('user').value) : interaction.user
        let wallet = db.get(`wallet.${user.id}`) || 0;

        let bank = db.get(`bank.${user.id}`) || 0;

        const balEmbed = new Discord.MessageEmbed()
            .setColor('RANDOM')
            .setAuthor({ name: `${user.username}'s Balance`, iconURL: user.displayAvatarURL()})
            .addField('**Wallet**', wallet.toString())
            .addField('**Bank**', bank.toString())
            .setDescription(`Currency - ${currency}`)
            .setFooter({ text: `Requested by: ${interaction.user.tag}`})
        interaction.reply({embeds: [balEmbed]});
    },
};