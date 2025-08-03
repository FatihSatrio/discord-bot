const { SlashCommandBuilder } = require('discord.js');

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

module.exports = {
    data: new SlashCommandBuilder()
        .setName('banall')
        .setDescription('Ban all members in the server')
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Reason for the ban')
                .setRequired(true)
    ),
    
    async execute(interaction) {
        if (interaction.user.id !== process.env.BOT_OWNER_ID) {
        return interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
        }

        const reason = interaction.options.getString('reason');

        const members = await interaction.guild.members.fetch();
        let success = 0;
        let failed = 0;

        for (const member of members.values()) {
            if (member.user.bot || member.id === interaction.guild.ownerId) continue;

            try {
                await member.ban({ reason: `${reason}`});
                success++;
            } catch (error) {
                failed++;
            }

            await sleep(100)
        }

        await interaction.reply({ content: `✅ MASS BAN DONE\nSuccess : **${success}**\nFailed : **${failed}**\nReason : **${reason}**` });
    },
};