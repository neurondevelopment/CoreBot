const db = require('quick.db')
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    perms: [],
    data: new SlashCommandBuilder()
        .setName('autoroles')
        .setDescription('Automatically give users a role when joining your server')
        .addStringOption(option =>
            option.setName('choice')
                .setDescription('Add or Remove')
                .setRequired(true)
                .addChoices(
                    { name: 'Add', value: 'add' },
                    { name: 'Remove ', value: 'remove' }
                ))
        .addStringOption(option => option.setName('roleid').setDescription('ID of the role').setRequired(true)),
    execute(interaction) {
        if(!interaction.member.permissions.has('ADMINISTRATOR')) return interaction.reply({ content: 'You do not have permission to run this command', ephemeral: true });

        const choice = interaction.options.get('choice').value
        const roleChoice = interaction.options.get('roleid').value
        const role = interaction.guild.roles.cache.get(roleChoice);
        if(!role) return interaction.reply({ content: 'Invalid role ID specified', ephemeral: true });

        if (choice === 'add') {
            if(db.get(`autoroles.${interaction.guild.id}`)) {
                if(db.get(`autoroles.${interaction.guild.id}`).indexOf(roleChoice) >= 1) {
                    interaction.reply({ content: 'That role is already an autorole!', ephemeral: true });
                }
            }
            db.push(`autoroles.${interaction.guild.id}`, `${role.id}`);
            interaction.reply({ content: `Successfully added ${role.name} as an autorole! \nNew List: <@&${db.get(`autoroles.${interaction.guild.id}`).join('> <@&')}>`, ephemeral: true });
        }
        else if (choice === 'remove') {
            if(db.get(`autoroles.${interaction.guild.id}`) && db.get(`autoroles.${interaction.guild.id}`).indexOf(roleChoice) < 0) return interaction.reply({ content: 'That role isn\'t setup as an autorole!', ephemeral: true });
            let all = db.get(`autoroles.${interaction.guild.id}`);
            if(all) {
                all = all.filter(i => i !== role.id);
            }
            else {
                return interaction.reply({ content: 'No autoroles setup for this server!', ephemeral: true })
            }
            db.delete(`autoroles.${interaction.guild.id}`);
            all.forEach(n => {
                db.push(`autoroles.${interaction.guild.id}`, n);
            });
            if(db.get(`autoroles.${interaction.guild.id}`)) {
                interaction.reply({ content: `Successfully removed ${role.name} from your autoroles! \nNew List: <@&${db.get(`autoroles.${interaction.guild.id}`).join('> <@&')}>`, ephemeral: true });
            }
            else {
                interaction.reply({ content: `Successfully removed ${role.name} from your autoroles!`, ephemeral: true });
            }
        }

    },
};