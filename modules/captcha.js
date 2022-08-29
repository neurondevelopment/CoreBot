const { AttachmentBuilder, EmbedBuilder } = require('discord.js')
const { Captcha } = require("captcha-canvas");
const fs = require('fs')
const config = JSON.parse(fs.readFileSync('./config.json')).modules["captcha"]

module.exports = async (client) => {
    client.on("guildMemberAdd", async (member) => {
        const captcha = new Captcha();
        captcha.async = true;
        captcha.addDecoy();
        captcha.drawTrace();
        captcha.drawCaptcha();

        const png = await captcha.png
    
        const verifyEmbed = new EmbedBuilder()
            .setColor('#024F33')
            .setAuthor({ name: "Member Joined" })
            .setDescription(`Member \`${member.user.tag}\` successfully verified`)
            .setThumbnail(member.user.avatarURL())
            .addFields([
                { name: 'Member ID', value: member.id }
            ])
            .setTimestamp()

        const verifyEmbed1 = new EmbedBuilder()
            .setColor('Orange')
            .setAuthor({ name: `${member.user.tag}`, iconURL: member.user.avatarURL() })
            .setThumbnail(member.user.avatarURL())
            .setDescription(`Kicked for failing to verify within the ${config.maximumTime} ms limit`)
            .setTimestamp()
            .setFooter({ text: `User ID: ${member.user.id}`, iconURL: member.guild.iconURL() });
        
        const captchaEmbed = new EmbedBuilder()
            .setDescription(`Please Complete This Captcha to join **${member.guild.name}**. You need to type all the green letters you see.\nYou have **${config.maximumTime / 1000} seconds** to complete it`)
            .setImage('attachment://captcha.png')
            .setTimestamp()
        
        const closedDmChannel = await member.guild.channels.fetch(config.closedDmChannelId).catch(err => { })
        if(!closedDmChannel) return error('Captcha Module', 'Invalid Channel ID for the closed DM channel');
        const verifyLog = await member.guild.channels.fetch(config.loggingChannelId);

        const attachment = new AttachmentBuilder(png, { name: "captcha.png" });
        const msg = await member.send({files: [attachment], embeds: [captchaEmbed]}).catch(err => {
            closedDmChannel.send(`<@${member.id}> Please enable your dms so I can send you the captcha, once you have enabled your DMs rejoin the server. You will be automatically kicked in 10 seconds.`)
            setTimeout(() => {
                member.kick().catch(err => { verifyLog.send(`I was unable to kick user ${member.user.tag} (${member.id}) due to the following error\n\n${err}`)})
            }, 10000)
        });

    
        const filter = (message => {
            if(message.author.id !== member.id) return;
            if(message.content == captcha.text) {
                return true
            }
            else {
                member.send("Incorrect Captcha, you will now be kicked. You can rejoin to try again.").catch(() => closedDmChannel.send(`<@${member.id}> Please enable your dms so I can send you the captcha, one you have enabled your dms rejoin the server.`));
                const failedEmbed = new EmbedBuilder()
                    .setColor('Red')
                    .setThumbnail(member.user.avatarURL())
                    .setAuthor({ name: `${member.user.tag}`, iconURL: member.user.avatarURL() })
                    .setDescription(`Kicked for entering the incorrect captcha. They were presented with the following captcha, they answered \`${message.content}\``)
                    .setImage('attachment://captcha.png')
                verifyLog.send({ embeds: [failedEmbed], files: [attachment]})
                member.kick().catch(err => { verifyLog.send(`I was unable to kick user ${member.user.tag} (${member.id}) due to the following error\n\n${err}`)})
            }
        })
        try {
            const response = await msg.channel.awaitMessages({ filter, max: 1, time: config.maximumTime, errors: ['time'] });
            if(response) {
                member.send({content: 'Successfully Verified'});
                config.memberRoles.forEach(role => {
                    member.roles.add(role)
                })
                verifyLog.send({embeds: [verifyEmbed]});
    
            }
        } catch (err) {
            member.send(`You have been kicked for failing to verify within the ${config.maximumTime} ms limit`).catch(() => closedDmChannel.send(`<@${member.id}> Please enable your dms so I can send you the captcha, one you have enabled your dms rejoin the server.`));
            verifyLog.send({embeds: [verifyEmbed1]});
            member.kick(`Failed to verify within the ${config.maximumTime} ms limit`);
        }
    });
}