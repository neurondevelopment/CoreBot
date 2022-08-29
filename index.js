const Discord = require('discord.js');
const { Routes, ActivityType } = require('discord.js')
const { QuickDB } = require('quick.db')
const db = new QuickDB()
const fs = require('fs');
const figlet = require('figlet');
const undici = require('undici')
const { token, memberCountChannel, memberCountChannelName, serverID } = require('./config.json');
const { error } = require('./utils')
const client  = new Discord.Client({
    intents: 46791
});
module.exports.db = db

client.commands = new Discord.Collection();
const commandFolders = fs.readdirSync('./commands');
const { REST } = require('@discordjs/rest');

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

async function checkVersion() {
    const bot = 'CoreBot'
    const req = await undici.request(`https://raw.githubusercontent.com/neurondevelopment/${bot}/main/package.json`)
    const data = await req.body.json()
    if(data.version > require('./package.json').version) {
        console.log('\x1b[33m%s\x1b[0m', `New version available, please update to v${data.version} at https://github.com/neurondevelopment/${bot}`)
    }
}

setInterval(() => {
    checkVersion()
}, 300000)

client.on('ready', async () => {
    checkVersion()

    const rest = new REST({ version: '10' }).setToken(token);

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

    /* MODULE HANDLER */
    const modules = fs.readdirSync(`./modules`).filter(file => file.endsWith('.js'));
    const moduleConfig = require('./config.json').modules
	for (const moduleFileName of modules) {
		const moduleName = moduleFileName.split('.js')[0]
        if(moduleConfig[moduleName].enabled) {
            const module = require(`./modules/${moduleName}`)
            module(client)
        }
	}

    const { type, content } = require('./config.json').status
    setInterval(async () => {
        const channel = await client.channels.fetch(memberCountChannel).catch(err => {})
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
        if(!ActivityType[type]) return error('Bot Status Config', `Invalid activity type: ${type}`)
        client.user.setActivity(content, { type: ActivityType[type] })
    }

})

const eventFiles = fs.readdirSync('./events');
for(const file of eventFiles) {
    const event = require(`./events/${file}`);
    if(event.enabled) client.on(event.name, (...args) => event.execute(...args));
}


client.login(token)
