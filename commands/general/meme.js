const { MessageEmbed } = require('discord.js');
const {subbey} = require('subbey');
let { subreddits, allowNSFW, topPosts } = require('../../config.json').commands.memes
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    perms: [],
    data: new SlashCommandBuilder()
        .setName('meme')
        .setDescription('Generate a random meme'),
    async execute(interaction) {
      subreddits = subreddits.split(',');
      let subreddit = subreddits[Math.floor(Math.random() * subreddits.length)];
      const img = await subbey({sub: subreddit, max: 1, nfsw: allowNSFW, top: topPosts});

      const Embed = new MessageEmbed()
        .setTitle(`From r/${subreddit}`)
        .setURL(`https://reddit.com/r/${subreddit}`)
        .setColor("RANDOM")
        .setImage(img[0].media);

      
      interaction.reply({embeds: [Embed]});
      
  },
};