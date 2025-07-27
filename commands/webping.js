const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');
const { performance } = require('perf_hooks');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('webping')
        .setDescription('Check if a website is UP or DOWN with response time')
        .addStringOption(option =>
            option.setName('url')
                .setDescription('The URL to check (e.g., google.com or https://www.google.com)')
                .setRequired(true)),

    async execute(interaction) {
        let url = interaction.options.getString('url');

        // Force https:// if missing
        if (!url.startsWith('https://') && !url.startsWith('http://')) {
            url = 'https://' + url;
        }

        await interaction.reply({
            content: '🔍 Checking website status...', ephemeral: true});

        const start = performance.now();

        try {
            const response = await axios.get(url, { timeout: 5000 });
            const end = performance.now();
            const timeTaken = Math.round(end - start);

            const embed = new EmbedBuilder()
                .setTitle('🟢 Website is UP')
                .addFields(
                    { name: 'URL', value: url, inline: true },
                    { name: 'Status', value: '🟢 Website is UP', inline: true },
                    { name: 'HTTP Status', value: `${response.status} ${response.statusText}` },
                    { name: 'Response Time', value: `${timeTaken} ms`, inline: true }
                )
                .setColor(0x00ff00)
                .setTimestamp();

            await interaction.editReply({ content: '', embeds: [embed] });

        } catch (error) {
            const end = performance.now();
            const timeTaken = Math.round(end - start);

            const embed = new EmbedBuilder()
                .setTitle('🔴 Website is DOWN')
                .addFields(
                    { name: 'URL', value: url, inline: true },
                    { name: 'Status', value: '🔴 Website is DOWN', inline: true },
                    { name: 'Error', value: error.response? `${error.response.status} ${error.response.statusText}`: error.message },
                    { name: 'Response Time', value: `${timeTaken}ms`, inline: true }
                )
                .setColor(0xff0000)
                .setTimestamp();

            await interaction.editReply({ content: '', embeds: [embed] });
        }
    }
};
