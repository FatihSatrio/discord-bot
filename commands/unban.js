const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unban')
        .setDescription('Unban a user from the server by user ID')
        .addUserOption(option => 
            option.setName('userid')
                .setDescription('The user ID of the person to unban')
                .setRequired(true))
            .addStringOption(option =>
                option.setName('reason')
                .setDescription('Reason for unbanning the user')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

    async execute(interaction) {
        const userID = interaction.options.getUser('userid');
        const reason = interaction.options.getString('reason');

            const ban = await interaction.guild.bans.fetch(userID);

            if (!ban) {
                return await interaction.reply({ content: '⚠️ This user is not banned or the ID is incorrect.', ephemeral: true });
            }

            try {
                await interaction.guild.members.unban(userID, reason);
                return await interaction.reply({ content: `Successfully unbanned **${ban.user.tag}(${ban.user.id})**\nReason: **${reason}**\nUnbanned by : **${interaction.user.tag}(${interaction.user.id})**`, ephemeral: false });
            } catch (error) {
                console.error('Unban error:', error);
                return await interaction.reply({ content: '⚠️ An error occurred while unbanning the user. Make sure i have permission and the ID, Reason is correct ', ephemeral: true });
            }
    }
};