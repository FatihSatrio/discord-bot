const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('dm')
        .setDescription('dm someone on your discord server')
        .addUserOption(option =>
            option.setName('target')
            .setDescription('the user to dm')
            .setRequired(true))
        .addStringOption(option =>
            option.setName('message')
            .setDescription('the message to send')
            .setRequired(true)),

    async execute(interaction) {
        const target = interaction.options.getUser('target');
        const message = interaction.options.getString('message');

        try {
            await target.send(message);
                return interaction.reply({ content: `Message : **${message}** sent to **${target.tag}!**`, ephemeral: true });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'There was an error trying to dm this user!', ephemeral: true });
        }
    },

};
