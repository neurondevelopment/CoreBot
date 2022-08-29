const { db } = require('../index')
const { moneyOnLevel, amountPerLevel } = require('../config.json').economy
const { levelsEnabled, autoDeleteAfter, xpNeededPerLevel } = require('../config.json').level
const { enabled, sendEvery } = require('../config.json').stickyMessages

async function xp(message) {
    if(!levelsEnabled) return;
    const randomNumber = Math.floor(Math.random() * 10) + 15;
    await db.add(`xp.${message.author.id}`, randomNumber);
    await db.add(`xptotal.${message.author.id}`, randomNumber);
    const level = await db.get(`level.${message.author.id}`) || 1;
    const xp = await db.get(`xp.${message.author.id}`);
    const xpNeeded = level * xpNeededPerLevel;
    if (xpNeeded < xp) {
        await db.add(`level.${message.author.id}`, 1);
        await db.set(`xp.${message.author.id}`, 0);
        if(moneyOnLevel) {
            await db.add(`wallet.${message.author.id}`, amountPerLevel * parseInt(level));
            message.channel.send(`<@${message.author.id}>, you levelled up to level ${await db.get(`level.${message.author.id}`)} and you received ${amountPerLevel * parseInt(level)}!`).then(msg => {
               if(autoDeleteAfter && autoDeleteAfter > 0) {
                setTimeout(() => msg.delete(), autoDeleteAfter);
               }
            });
        }
        else {
            message.channel.send(`<@${message.author.id}>, you levelled up to level ${await db.get(`level.${message.author.id}`)}`).then(msg => {
                if(autoDeleteAfter && autoDeleteAfter > 0) {
                    setTimeout(() => msg.delete(), autoDeleteAfter);
                    
               }
            });
        }
    }
}

module.exports = {
    name: 'messageCreate',
    enabled: true,
    async execute(message) {
        if(message.guild) {
            const mes = await db.get(`stick_${message.guild.id}_${message.channel.id}`)
            if(enabled && mes) {
                if(await db.get(`stick_${message.guild.id}_${message.channel.id}_last`) >= sendEvery) {
                    const id = await db.get(`stick_${message.guild.id}_${message.channel.id}_msg`)
                    const mess = await message.channel.messages.fetch(id).catch(err => { })
                    if(mess) mess.delete()
                    await db.set(`stick_${message.guild.id}_${message.channel.id}_last`, 0)
                    const mes2 = await message.channel.send(`**STICKY MESSAGE**\n${mes}`)
                    await db.set(`stick_${message.guild.id}_${message.channel.id}_msg`, `${mes2.id}`)
                    
                }
                else {
                    await db.add(`stick_${message.guild.id}_${message.channel.id}_last`, 1)
                }
            }
        }
    
        if (message.author.bot) return;
        if(!message.guild) return;
        if(levelsEnabled) {
            xp(message)
        }
    }
}