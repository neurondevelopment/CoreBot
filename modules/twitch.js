const undici = require('undici')
const { clientId, clientSecret, streamers, channelId } = require('../config.json').modules['twitch']
const { footer } = require('../config.json')
const { EmbedBuilder } = require('discord.js')
const { error } = require('../utils')
let streamerCache = []

function finished(streamer) {
    const position = streamerCache.indexOf(streamer)
    if(position > -1) {
        streamerCache.splice(position, 1)
    }
}

module.exports = async (client) => {
    const channel = await client.channels.fetch(channelId).catch(err => {})
    if(!channel) return error('Twitch Module', 'Invalid Channel ID');
    setInterval(async () => {
        const tokenRequest = await undici.request(`https://id.twitch.tv/oauth2/token?client_id=${clientId}&client_secret=${clientSecret}&grant_type=client_credentials`, {method: 'POST' })
        const tokenBody = await tokenRequest.body.json();
        const token = tokenBody.access_token;
    
        streamers.forEach(async streamer => {
            const streamRequest = await undici.request(`https://api.twitch.tv/helix/streams?user_login=${streamer.streamer}`, {
                method: 'GET',
                headers: { 'Client-ID': clientId, 'Authorization': `Bearer ${token}` },
            });
            if(!streamRequest) return finished(streamer.streamer)
        
            const stream = await streamRequest.body.json();
            if(!stream) return finished(streamer.streamer)
        
            const userRequest = await undici.request(`https://api.twitch.tv/helix/users?login=${streamer.streamer}`, {
                method: 'GET',
                headers: { 'Client-ID': clientId, 'Authorization': `Bearer ${token}` },
            });
            if(!userRequest) return finished(streamer.streamer)
            
            const user = await userRequest.body.json();
            if(!user) return finished(streamer.streamer)
            
            if(stream && stream.data) {
                const streamData = stream.data[0];
        
                if(!streamData) return finished(streamer.streamer);
                if(!user) return finished(streamer.streamer);
        
                if(streamerCache.indexOf(streamer.streamer) > -1) return;
                const thumbnail = streamData.thumbnail_url.replace('{width}', 1920).replace('{height}', 1080);
        
                const start = streamData.started_at.replace('T', ' ').replace('Z', ' ');
                let gname = streamData.game_name || 'Unspecified';
                let title = streamData.title || 'Unspecified';
        
                const embed = new EmbedBuilder()
                    .setColor(streamer.colour)
                    .setAuthor({ name: `${streamData.user_name} is now live!`, iconURL: user.data[0].profile_image_url })
                    .setThumbnail(user.data[0].profile_image_url)
                    .addFields([
                        { name: 'Currently Playing', value: `${gname}`, inline: true },
                        { name: 'Started Stream At', value: `${start}`, inline: true },
                        { name: `Stream Title`, value: `[${title}](https://twitch.tv/${streamData.user_login})`}
                    ])
                    .setImage(thumbnail)
                    .setFooter({ text: `${footer} - Made By Cryptonized` })
    
                channel.send({ content: `${streamer.message.replace('{streamer}', streamer.streamer).replace('{url}', `https://twitch.tv/${streamData.user_login}`)}`, embeds: [embed] });
    
                streamerCache.push(streamer.streamer);
            }
        });
    }, 60 * 1000)
}