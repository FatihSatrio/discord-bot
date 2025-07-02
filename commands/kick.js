const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('kick')
    .setDescription('Kick a user from the server')
    .addUserOption(option =>
        option.setName('user')
            .setDescription('The user to kick')
            .setRequired(true))
    .addStringOption(option => 
        option.setName('reason')
            .setDescription('Reason for kicking')
            .setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),
async execute(interaction) {
    const target = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason') || 'No Reason Provided';

    const targetMember = await interaction.guild.members.fetch(target.id).catch(() => null);

    if (!targetMember) {
        return interaction.reply({ content: 'That user is not in the server!', ephemeral: true});
    }

    if (!targetMember.kickable) {
        return interaction.reply({ content: 'I cannot kick this user. They may have higher permission than me', ephemeral: true});
    }

    try {
        await targetMember.kick(reason);
        await interaction.reply(`Successfully kicked **${target.tag}** from the server.\nReason: ${reason}`);
    } catch (error) {
        console.error(error);
        await interaction.reply({ content: 'There was an error trying to kick this user!', ephemeral: true})
    }
  },
};