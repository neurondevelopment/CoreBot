const Discord = require('discord.js');
const fs = require('fs');
const figlet = require('figlet');
const db = require('quick.db');
const { token, footer, licenseKey, memberCountChannel, memberCountChannelName, joinChannel, joinMessage, leaveChannel, leaveMessage, serverID } = require('./config.json');
const { ticketInfoColour, enableTranscriptDMs, transcriptChannelID } = require('./config.json').tickets
const { levelsEnabled, autoDeleteAfter, xpNeededPerLevel } = require('./config.json').level
const { serverLogs, joinLeaveLogs, commandLogs } = require('./config.json').logs
const { enabled, sendEvery } = require('./config.json').stickyMessages

const client  = new Discord.Client({
    partials: ['CHANNEL', 'MESSAGE', "REACTION", 'GUILD_MEMBER'],
    intents: 14023
});

client.commands = new Discord.Collection();
const commandFolders = fs.readdirSync('./commands');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');

const commands = [];
for (const folder of commandFolders) {
	const commandFiles = fs.readdirSync(`./commands/${folder}`).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const command = require(`./commands/${folder}/${file}`);
		commands.push(command.data.toJSON());  
        client.commands.set(command.data.name, command);
	}
}

process.on('unhandledRejection', (reason, promise) => {
    const pr = Promise.resolve(promise);
    console.log(`Unhandled Rejection at: ${reason.stack || reason} | ${pr}`);

});


client.on('ready', async () => {
    const rest = new REST({ version: '9' }).setToken(token);

    (async () => {
        try {
            await rest.put(
                Routes.applicationGuildCommands(client.user.id, serverID),
                { body: commands },
            );

            console.log('Successfully registered application commands.');
        } catch (error) {
            console.error(error);
        }
    })();
    const { type, content } = require('./config.json').status
    setInterval(async () => {
        const channel = client.channels.cache.get(memberCountChannel)
        if(!channel) return;
        const members = channel.guild.members.cache.filter(m => !m.user.bot).size
        channel.setName(`${memberCountChannelName}${members}`)
    }, 600000)

    figlet('Neuron Development', function(err, data) {
        if (err) {
            console.log(err)
            return;
        }
        console.log(`\x1b[36m%s\x1b[0m`, data)
        console.log('Started bot')
    });

    if(type && content) {
        if(type.toUpperCase() === 'PLAYING') {
            client.user.setActivity(content, { type: 'PLAYING' })
        }
        else if(type.toUpperCase() === 'WATCHING') {
            client.user.setActivity(content, { type: 'WATCHING' })
        }
        else {
            console.log('Invalid type specified for the bot\'s status')
        }
    }

})

function xp(message) {
    
    if(!levelsEnabled) return;
    const { moneyOnLevel, amountPerLevel } = require('./config.json').economy
    const randomNumber = Math.floor(Math.random() * 10) + 15;
    db.add(`xp.${message.author.id}`, randomNumber);
    db.add(`xptotal.${message.author.id}`, randomNumber);
    const level = db.get(`level.${message.author.id}`) || 1;
    const xp = db.get(`xp.${message.author.id}`);
    const xpNeeded = level * xpNeededPerLevel;
    if (xpNeeded < xp) {
        db.add(`level.${message.author.id}`, 1);
        db.set(`xp.${message.author.id}`, 0);
        if(moneyOnLevel) {
            db.add(`wallet.${message.author.id}`, amountPerLevel * parseInt(level));
            message.channel.send(`<@${message.author.id}>, you levelled up to level ${db.get(`level.${message.author.id}`)} and you received ${amountPerLevel * parseInt(level)}!`).then(msg => {
               if(autoDeleteAfter && autoDeleteAfter > 0) {
                setTimeout(() => msg.delete(), autoDeleteAfter);
               }
            });
        }
        else {
            message.channel.send(`<@${message.author.id}>, you levelled up to level ${db.get(`level.${message.author.id}`)}`).then(msg => {
                if(autoDeleteAfter && autoDeleteAfter > 0) {
                    setTimeout(() => msg.delete(), autoDeleteAfter);
                    
               }
            });
        }
    }
}

client.on('messageCreate', message => {
    if(message.guild) {
        const mes = db.get(`stick_${message.guild.id}_${message.channel.id}`)
        if(enabled && mes) {
            if(db.get(`stick_${message.guild.id}_${message.channel.id}_last`) >= sendEvery) {
                const id = db.get(`stick_${message.guild.id}_${message.channel.id}_msg`)
                message.channel.messages.fetch(id).then(mess => {
                    mess.delete()
                    db.set(`stick_${message.guild.id}_${message.channel.id}_last`, 0)
                    message.channel.send(`**STICKY MESSAGE**\n${mes}`).then(mes2 => {
                        db.set(`stick_${message.guild.id}_${message.channel.id}_msg`, `${mes2.id}`)
                    })
                })
            }
            else {
                db.add(`stick_${message.guild.id}_${message.channel.id}_last`, 1)
            }
        }
    }

    if (message.author.bot) return;
    if(!message.guild) return;
    if(levelsEnabled) {
        xp(message)
    }
})

client.on('interactionCreate', async (interaction) => {
    if(interaction.isButton()) {
        if(interaction.customId === 'openticket') {
            await interaction.deferReply({ ephemeral: true})
            const tickets = require('./db/tickets.json')
            const ticket = tickets[interaction.message.embeds[0].title]
            const user = interaction.user
            interaction.message.guild.channels.create(user.username, {
                type: 'text',
                parent: ticket.categoryID,
                topic: `${interaction.user.id}|${ticket.supportroles.join(',')}|ticket`
            }).then(chann => {
                interaction.editReply({ content: `Your ticket can be found here: <#${chann.id}>`})
                chann.permissionOverwrites.edit(user, {
                    VIEW_CHANNEL: true
                })
                ticket.supportroles.forEach(curr => {
                    chann.permissionOverwrites.edit(curr, {
                        VIEW_CHANNEL: true
                    })
                })
                const embed = new Discord.MessageEmbed()
                    .setColor(ticketInfoColour)
                    .setTitle('Ticket Information')
                    .setThumbnail(user.displayAvatarURL())
                    .addField('Ticket Owner', `${user.tag} - ${user.id}`)
                    .addField('Ticket Type', interaction.message.embeds[0].title)
                    .addField('Commands', `/rename - Renames the ticket\n/add - Adds a user to the ticket\n/remove - Removes a user from the ticket`)
                    .setTimestamp()
                    .setFooter({ text: `${footer} - Made By Cryptonized`})
                const button1 = new Discord.MessageButton()
                    .setStyle("SECONDARY")
                    .setLabel("Close Ticket")
                    .setCustomId(`close`)
                    .setEmoji('🔒')
                    .toJSON()
                const button2 = new Discord.MessageButton()
                    .setStyle("PRIMARY")
                    .setLabel("Claim Ticket")
                    .setCustomId(`claim`)
                    .setEmoji('🔑')
                    .toJSON()
                const buttonRow = new Discord.MessageActionRow()
                    .addComponents(button1, button2)
                chann.send({ embeds: [embed], components: [buttonRow]})
                chann.send(ticket.message.split('{[USER]}').join(`<@${user.id}>`))
            })
        }
        else if(interaction.customId === 'claim') {
            const support = interaction.channel.topic.split('|')[1].split(',')
            let done;
            support.forEach(curr => {
                if(interaction.guild.members.cache.get(interaction.user.id).roles.cache.some(r => r.id === curr)) {
                    done = true;
                }
            })
            if(!done) {
                interaction.reply({ content: 'You are not allowed to unclaim this ticket!', ephemeral: true })
            }
            else {
                //interaction.message.channel.setName(`${interaction.user.username}-claimed`)
                support.forEach(curr => {
                    interaction.message.channel.permissionOverwrites.edit(curr, {
                            VIEW_CHANNEL: false
                    })
                })
                interaction.message.channel.permissionOverwrites.edit(interaction.user, {
                        VIEW_CHANNEL: true
                })

                const button1 = new Discord.MessageButton()
                    .setStyle("SECONDARY")
                    .setLabel("Close Ticket")
                    .setCustomId(`close`)
                    .setEmoji('🔒')
                    .toJSON()
                const button2 = new Discord.MessageButton()
                    .setStyle("DANGER")
                    .setLabel("Unclaim Ticket")
                    .setCustomId(`unclaim`)
                    .setEmoji('🔑')
                    .toJSON()
                const buttonRow = new Discord.MessageActionRow()
                    .addComponents(button1, button2)

                interaction.update({
                    embeds: [interaction.message.embeds[0]],
                    components: [buttonRow]
                })
            }
        }
        else if(interaction.customId === 'unclaim') {
            const support = interaction.channel.topic.split('|')[1].split(',')
            let done;
            support.forEach(curr => {
                if(interaction.guild.members.cache.get(interaction.user.id).roles.cache.some(r => r.id === curr)) {
                    done = true;
                }
            })
            if(!done) {
                interaction.message.channel.send('You are not allowed to unclaim this ticket!')
            }
            else {
                support.forEach(curr => {
                    interaction.message.channel.permissionOverwrites.edit(curr, {
                            VIEW_CHANNEL: true
                    })
                })
                interaction.message.channel.permissionOverwrites.edit(interaction.user, {
                        VIEW_CHANNEL: true
                })

                const button1 = new Discord.MessageButton()
                    .setStyle("SECONDARY")
                    .setLabel("Close Ticket")
                    .setCustomId(`close`)
                    .setEmoji('🔒')
                    .toJSON()
                const button2 = new Discord.MessageButton()
                    .setStyle("PRIMARY")
                    .setLabel("Claim Ticket")
                    .setCustomId(`claim`)
                    .setEmoji('🔑')
                    .toJSON()
                const buttonRow = new Discord.MessageActionRow()
                    .addComponents(button1, button2)

                interaction.update({
                    embeds: [interaction.message.embeds[0]],
                    components: [buttonRow]
                })
            }
        }
        else if(interaction.customId === 'close') {
            const owner = interaction.channel.topic.split('|')[0]
            function generateCode(length) {
                var result           = '';
                var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
                var charactersLength = characters.length;
                for ( var i = 0; i < length; i++ ) {
                  result += characters.charAt(Math.floor(Math.random() * charactersLength));
               }
               return result;
            }
            const code = generateCode(5)
            const owner2 = interaction.client.users.cache.get(owner)
            if(enableTranscriptDMs) {
                let all = await interaction.message.channel.messages.fetch()
                all = all.reverse()
                all.each(ms => {
                    if(ms.content && ms.content !== ' ') {
                        const d = new Date(ms.createdTimestamp)
                        const date = d.getHours() + ":" + d.getMinutes() + ", " + d.toDateString();
                        const author = `${ms.author.tag}(${ms.author.id}) @ ${date}`;
                        const content = ms.content;
                        fs.appendFileSync(`./${code}.txt`, `${author} - ${content}\n`)
                    }
                })
                const ticket = require('./db/tickets.json')[interaction.message.embeds[0].fields[1].value]
                if(!ticket) return interaction.reply({ content: 'ERROR! Could not find this ticket type in the config?', ephemeral: true })
                owner2.send({ content: `${ticket.closeMessage}`, files: [`./${code}.txt`] }).then(() => {
                    const logChannel = interaction.client.channels.cache.get(transcriptChannelID);
                    if(logChannel) {
                        logChannel.send({ content: `New transcript saved! Ticket Owner: ${interaction.client.users.cache.get(owner).tag}(${owner})`,
                            files: [`./${code}.txt`]
                        }).then(() => {
                            fs.unlinkSync(`./${code}.txt`)
                            interaction.message.channel.delete()
                        })
                    }
                    else{
                        fs.unlinkSync(`./${code}.txt`)
                        interaction.message.channel.delete()
                    }
                })
                
            }
            else {     
                interaction.message.channel.delete()    
            }
        }
    }
    else if(interaction.isSelectMenu()) {
        if(interaction.customId === 'dropdownRoles') {
            if(!interaction.values[0]) return;
            const roles = interaction.values[0].split(',');
            if(!roles) return interaction.reply({ content: 'This dropdown has no roles setup :/', ephemeral: true})
            let done = [];
            roles.forEach(curr => {
                try {
                    interaction.member.roles.add(curr)
                    done.push(curr);
                }
                catch {
                    interaction.followUp({ content: `Error trying to give role with ID: ${curr}`, ephemeral: true})
                }
            })

            interaction.reply({ content: `Successfully gave roles: <@&${done.join('> <@&')}>`, ephemeral: true})
        }
    }
    else if(interaction.isCommand()) {
        const command = client.commands.get(interaction.commandName);
        if (!command) return;
        try {
            if(command.perms[0] && !command.perms.some(currPerm => interaction.member.permissions.has(currPerm) || interaction.member.roles.cache.some(role => role.id === currPerm))) return interaction.reply({ content: `You do not have permission to run this command!`, ephemeral: true })
            await command.execute(interaction);
            const logChan = client.channels.cache.get(commandLogs) 
            if(logChan) {
                const embed = new Discord.MessageEmbed()
                    .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL()})
                    .addField('Command Executed', interaction.commandName)
                    .addField('Channel', `<#${interaction.channel.id}>`)
                    .setFooter({ text: `${footer} - Made By Cryptonized`})
                logChan.send({embeds: [embed]})
            }
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
        }
    }
})


client.on('channelCreate', async channel => {
    if(channel.partial) await channel.fetch();
    if(!channel.guild) return;
    try{
    const delEmbed = new Discord.MessageEmbed()
        .setColor('#03adfc')
        .addField('Channel Created', `\`${channel.name}\`\n<#${channel.id}>`)
        .setTimestamp()
        .setFooter({ text: `Channel ID: ${channel.id}`, iconURL: channel.guild.iconURL() })
    const chann = channel.guild.channels.cache.find(c => c.id === serverLogs);
    if(!chann) return;
    chann.send({ embeds: [delEmbed]});
    }
    catch (err) {
        console.log(`caught logging error channelCreate ${err}`);
    }
});

client.on('guildMemberUpdate', async (oldMember, newMember) => {
    if(!oldMember) return;
    try{

        const chann = oldMember.guild.channels.cache.find(c => c.id === serverLogs);
        if(!chann) return;

    if(oldMember.displayName !== newMember.displayName) {
        const delEmbed = new Discord.MessageEmbed()
        .setColor('#03adfc')
        .setAuthor({ name: `${oldMember.user.tag} - Updated Nickname`, iconURL: oldMember.user.displayAvatarURL()})
        .addField('Original Username', `\`${oldMember.displayName}\``)
        .addField('New Username', `\`${newMember.displayName}\``)
        .setTimestamp()
        .setFooter({text: `User ID: ${oldMember.id}`, iconURL: newMember.guild.iconURL()})
        chann.send({embeds: [delEmbed]});
    }


    if (oldMember.roles.cache.size > newMember.roles.cache.size) {
        // Creating an embed message.
        const Embed = new Discord.MessageEmbed()
        .setColor("RED")
        .setAuthor({ name: newMember.user.tag, iconURL: newMember.user.displayAvatarURL() })
        .setTimestamp()
        .setFooter({text: `User ID - ${oldMember.user.id}`, iconURL: newMember.guild.iconURL()})

        // Looping through the role and checking which role was removed.
        oldMember.roles.cache.forEach(role => {
            if (!newMember.roles.cache.has(role.id)) {
                Embed.addField("Role Removed", role.toString());
            }
        });

        chann.send({embeds: [Embed]});
    }
    else if (oldMember.roles.cache.size < newMember.roles.cache.size) {
        const Embed = new Discord.MessageEmbed();
        Embed.setColor("GREEN");
        Embed.setAuthor({ name: newMember.user.tag, iconURL: newMember.user.displayAvatarURL()});
        Embed.setTimestamp();
        Embed.setFooter({text: `User ID - ${oldMember.user.id}`, iconURL: newMember.guild.iconURL()})

        // Looping through the role and checking which role was added.
        newMember.roles.cache.forEach(role => {
            if (!oldMember.roles.cache.has(role.id)) {
                Embed.addField("Role Added", role.toString());
            }
        });

        chann.send({embeds: [Embed]});
    }
    }
    catch (err) {
       console.log(`caught logging error guildMemberUpdate ${err}`);
    }
});

client.on('channelDelete', async channel => {
    if(channel.partial) await channel.fetch();
    try{
    const delEmbed = new Discord.MessageEmbed()
        .setColor('#03adfc')
        .addField('Channel Deleted', `\`${channel.name}\``)
        .setTimestamp()
        .setFooter({text: `Channel ID: ${channel.id}`, iconURL: channel.guild.iconURL()})
    const chann = channel.guild.channels.cache.find(c => c.id === serverLogs);
    if(!chann) return;
    chann.send({embeds: [delEmbed]});
    }
    catch (err) {
       console.log(`caught logging error channelDelete ${err}`);
    }
});

client.on('guildMemberAdd', async member => {
    const autoroles = db.get(`autoroles.${member.guild.id}`);
        if(autoroles) {
            const chann = client.channels.cache.get(serverLogs);
            if(!chann) return;
            const rr = [];
            for(let i = 0; i < autoroles.length; i++) {
                const role = autoroles[i];
                if(!member.guild.roles.cache.get(role)) {
                    const all = db.get(`autoroles.${member.guild.id}`).filter(e => e !== role.id);
                    db.delete(`autoroles.${member.guild.id}`);
                    all.forEach(n => {
                        db.push(`autoroles.${member.guild.id}`, n);
                    });
                    chann.send(`Removed autorole ${role.name} as the role no longer exists!`);
                }
                try {
                    member.roles.add(role);
                    rr.push(role);
                }
                catch (err) {
                   console.log('Failed adding autorole' + err);
                }
            }
            const embed = new Discord.MessageEmbed()
                .setColor('#f5cb42')
                .setAuthor({ name: `Autorole Success`})
                .setDescription(`Successfully added roles: <@&${rr.join('> <@&') || rr}> to user: ${member.user.tag}`)
                .setTimestamp()
                .setFooter({ text: `${footer} - Made By Cryptonized`, iconURL: member.guild.iconURL()})
            chann.send({embeds: [embed]})
        }
        const channel = client.channels.cache.get(joinChannel)
        if(channel) {
            const mes = joinMessage.split('{[USER]}').join(`<@${member.id}>`).split('{[SERVER]}').join(`${member.guild.name}`)
            channel.send(mes).catch(err => {
                console.log(err)
            })
        }
        const accountAge = Math.round((Date.now() - member.user.createdAt) / 86400000);
        const delEmbed2 = new Discord.MessageEmbed()
            .setColor('#48EC73')
            .setAuthor({ name: `${member.user.username} - Joined Server`, iconURL: member.user.displayAvatarURL()})
            .addField('Account Tag', member.user.tag)
            .addField('Account Age', `${accountAge} days`)
            .addField('Created On', member.user.createdAt.toString())
            .setTimestamp()
            .setFooter({ text: `User ID: ${member.user.id}`, iconURL: member.guild.iconURL()});
        const chann1 = member.guild.channels.cache.find(c => c.id === joinLeaveLogs);
        if(!chann1) return;
        chann1.send({embeds: [delEmbed2]});
})

client.on('guildMemberRemove', member => {
    const channel = client.channels.cache.get(leaveChannel)
    if(channel) {
        const mes = leaveMessage.split('{[USER]}').join(`<@${member.id}> (${member.user.tag})`).split('{[SERVER]}').join(`${member.guild.name}`)
        channel.send(mes).catch(err => {
            console.log(err)
        })
    }
    const alafal = member.roles.cache.map(r => `${r}`).filter(r => r !== '@everyone').join(' ');
    try {
        const delEmbed = new Discord.MessageEmbed()
            .setColor('#E12B09')
            .setAuthor({ name: `${member.user.username} - Left Server`, iconURL: member.user.displayAvatarURL()})
            .addField('Account Tag', member.user.tag)
            .addField('Join Date', `${member.joinedAt}`)
            .addField('Roles', alafal || 'None', true)
            .setTimestamp()
            .setFooter({ text: `User ID: ${member.user.id}`, iconURL: member.guild.iconURL()});
        const chann = member.guild.channels.cache.find(c => c.id === joinLeaveLogs);
        if(!chann) return;
        chann.send({embeds: [delEmbed]});
    }
    catch (err) {
        console.log(`caught error at guildMemberRemove ${err}`)
    }
})

client.on('messageReactionAdd', async (reaction, user) => {
    if(reaction.message.partial) await reaction.message.fetch();
    if(reaction.partial) await reaction.fetch();
    if(user.bot) return;
    const all = db.get('reactionroles')
    if(all) {
        for (let i = 0; i < all.length; i++) {
            if(reaction.message.id === all[i].toString().split('|')[0] && (`<:${reaction.emoji.name}:${reaction.emoji.id}>` === all[i].toString().split('|')[1] || reaction.emoji.name === all[i].toString().split('|')[1] || `<a:${reaction.emoji.name}:${reaction.emoji.id}>` === all[i].toString().split('|')[1])) {
                const role = await reaction.message.guild.roles.fetch(all[i].toString().split('|')[2])
                reaction.message.guild.members.cache.get(user.id).roles.add(role)
            }
        }
    }
})

client.on('messageReactionRemove', async (reaction, user) => {
    if(reaction.message.partial) await reaction.message.fetch();
    if(reaction.partial) await reaction.fetch();
    if(user.bot) return;
    const all = db.get('reactionroles')
	if(all) {
		for (let i = 0; i < all.length; i++) {
			if(reaction.message.id === all[i].toString().split('|')[0] && (`<:${reaction.emoji.name}:${reaction.emoji.id}>` === all[i].toString().split('|')[1] || reaction.emoji.name === all[i].toString().split('|')[1] || `<a:${reaction.emoji.name}:${reaction.emoji.id}>` === all[i].toString().split('|')[1])) {
				const role = await reaction.message.guild.roles.fetch(all[i].toString().split('|')[2])
				reaction.message.guild.members.cache.get(user.id).roles.remove(role)
			}
        }
    }
})

client.on('messageUpdate', async (oldMessage, newMessage) => {
	if(oldMessage.partial) await oldMessage.fetch();
    if(!oldMessage.content) return;
	if(!oldMessage) return;

	if(newMessage.partial) await newMessage.fetch();
    if(!newMessage.content) return;
	if(!newMessage) return;

    let mes = oldMessage.content;
    let mes2 = newMessage.content;

    if(oldMessage.content.length > 1024) {
        mes = '[Message too long to display]';
    }
    if(newMessage.content.length > 1024) {
        mes2 = '[Message too long to display]';
    }

    try {
        if(oldMessage.author.bot) return;
         if(oldMessage.content === newMessage.content) return;
         const delEmbed = new Discord.MessageEmbed()
        .setColor('#FF8F00')
        .setAuthor({ name: `${oldMessage.author.tag}`, iconURL: oldMessage.author.displayAvatarURL()})
        .addField('Original Message', mes)
        .addField('New Message', mes2)
        .addField('Channel', `${oldMessage.channel.name} - [Go To](https://discordapp.com/channels/${oldMessage.guild.id}/${oldMessage.channel.id}/${newMessage.messageID})`)
        .setTimestamp()
        .setFooter({ text: `Author ID: ${oldMessage.author.id}`, iconURL: oldMessage.guild.iconURL()});
    const chann = oldMessage.guild.channels.cache.find(c => c.id === serverLogs);
    if(!chann) return;
        chann.send({embeds: [delEmbed]});
    }
    catch (err) {
        console.log(`error at messageUpdate ${err}`);
    }

});

client.on('roleUpdate', (oldRole, newRole) => {
    try{
    if (oldRole.name === newRole.name) return;
    const delEmbed = new Discord.MessageEmbed()
        .setColor('#FFBA33')
        .setAuthor({ name: 'Role Updated'})
        .addField('Original Name', `\`${oldRole.name}\``)
        .addField('New Name', `\`${newRole.name}\``)
        .setTimestamp()
        .setFooter({ text: `${footer} - Made By Cryptonized`, iconURL: oldRole.guild.iconURL()})
    const chann = oldRole.guild.channels.cache.find(c => c.id === serverLogs);
    if(!chann) return;
    chann.send({embeds: [delEmbed]});
    }
    catch (err) {
        console.log(`caught logging error roleUpdate ${err}`);
    }
});

client.on('messageDelete', async (message) => {
	if(!message) return;
	if(!message.content) return;
    if(message.partial) await message.fetch();
    try {
    if(message.author.bot) return;
    const delEmbed = new Discord.MessageEmbed()
        .setColor('#FF0000')
        .setAuthor({ name: `${message.author.tag}`, iconURL: message.author.displayAvatarURL()})
        .addField('Message Deleted', `${message.content}`)
        .addField('Channel', `<#${message.channel.id}>`)
        .setTimestamp()
        .setFooter({ text: `Author ID: ${message.author.id}`, iconURL: message.guild.iconURL()})
    const chann = message.guild.channels.cache.find(c => c.id === serverLogs);
    if(!chann) return;
    chann.send({embeds: [delEmbed]});
    }
    catch (err) {
       console.log(`caught logging error messageDelete ${err}`);
    }
});

client.on('roleCreate', role => {
    try {
    const delEmbed = new Discord.MessageEmbed()
        .setColor('#00FA9A')
        .addField('Role Created', `\`${role.name}\``)
        .setTimestamp()
        .setFooter({ text: `Role ID: ${role.id}`, iconURL: role.guild.iconURL()})
    const chann = role.guild.channels.cache.find(c => c.id === serverLogs);
    if(!chann) return;
    chann.send({embeds: [delEmbed]});
    }
    catch (err) {
       console.log(`caught logging error roleCreate ${err}`);
    }
});

client.on('roleDelete', role => {
    try {
    const delEmbed = new Discord.MessageEmbed()
        .setColor('#eb796e')
        .addField('Role Deleted', `\`${role.name}\``)
        .setTimestamp()
        .setFooter({ text: `Role ID: ${role.id}`, iconURL: role.guild.iconURL()})
    const chann = role.guild.channels.cache.find(c => c.id === serverLogs);
    if(!chann) return;
    chann.send({embeds: [delEmbed]});
    }
    catch (err) {
       console.log(`caught logging error roleDelete ${err}`);
    }
});

client.login(token)
