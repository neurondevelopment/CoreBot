const { EmbedBuilder, SlashCommandBuilder } = require('discord.js')
const {subbey} = require('subbey');
let { subreddits, allowNSFW, topPosts } = require('../../config.json').commands.memes

module.exports = {
    perms: [],
    data: new SlashCommandBuilder()
        .setName('meme')
        .setDescription('Generate a random meme'),
    async execute(interaction) {
      await interaction.deferReply({ ephemeral: true })
      subreddits = subreddits.split(',');
      let subreddit = subreddits[Math.floor(Math.random() * subreddits.length)];
      const img = await subbey({sub: subreddit, max: 1, nfsw: allowNSFW, top: topPosts});

      const Embed = new EmbedBuilder()
        .setTitle(`From r/${subreddit}`)
        .setURL(`https://reddit.com/r/${subreddit}`)
        .setColor("Random")
        .setImage(img[0].media);

      
      interaction.editReply({embeds: [Embed]});
      
  },
};