const { SlashCommandBuilder, GuildChannel } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('say')
        .setDescription('Repeats the message you send')
        .addStringOption(option =>
            option.setName('message')
            .setDescription('The message to repeat')
            .setRequired(true)),
    async execute(interaction) {
        const message = interaction.options.getString('message');
        
        try {
            await interaction.channel.send(message);
                return interaction.reply({ content: 'Message sent!', ephemeral: true });
        } catch (error) {
            return interaction.reply({ content: 'Error sending message.', ephemeral: true });
        }
    }
};