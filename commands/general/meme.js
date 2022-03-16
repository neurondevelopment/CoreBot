const { MessageEmbed } = require('discord.js');
const api = require("imageapi.js");
let { subreddits } = require('../../config.json').commands.memes
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    perms: [],
    data: new SlashCommandBuilder()
        .setName('meme')
        .setDescription('Generate a random meme'),
    async execute(interaction) {
      subreddits = subreddits.split(',');
      let subreddit = subreddits[Math.floor(Math.random() * subreddits.length)];
      let img = await api(subreddit, false);
      while(img === undefined) {
        subreddit = subreddits[Math.floor(Math.random() * subreddits.length)];
        img = await api(subreddit, true);
      }
      const Embed = new MessageEmbed()
        .setTitle(`From r/${subreddit}`)
        .setURL(`https://reddit.com/r/${subreddit}`)
        .setColor("RANDOM")
        .setImage(img);

      
      interaction.reply({embeds: [Embed]});
      
  },
};