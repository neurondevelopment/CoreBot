module.exports = {
    name: 'dropdownRoles',
    async execute(interaction, args) {
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
                catch (err) {}
            })

            interaction.reply({ content: `Successfully gave roles: <@&${done.join('> <@&')}>`, ephemeral: true})
        }
    }
}