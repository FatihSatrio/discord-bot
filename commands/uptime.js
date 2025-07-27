const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('uptime')
        .setDescription('Show uptime of the bot!'),

    async execute(interaction) {
        const processUptime = process.uptime(); // in seconds
        const botUptimeISO = new Date(processUptime * 1000).toISOString().substr(11, 8); // HH:MM:SS

        const totalSeconds = Math.floor(processUptime);
        const days = Math.floor(totalSeconds / (60 * 60 * 24));
        const hours = Math.floor((totalSeconds / (60 * 60)) % 24);
        const minutes = Math.floor((totalSeconds / 60) % 60);
        const seconds = totalSeconds % 60;

        const embed = new EmbedBuilder()
            .setTitle('🕒 Bot Uptime')
            .setColor('Green')
            .addFields(
                { name: '🗓️ Days', value: `${days}d`, inline: true },
                { name: '⏰ Hours', value: `${hours}h`, inline: true },
                { name: '🕑 Minutes', value: `${minutes}m`, inline: true },
                { name: '⏱️ Seconds', value: `${seconds}s`, inline: true },
                { name: '📊 ISO Format', value: botUptimeISO, inline: false }
            )
            .setTimestamp()
            .setFooter({
                text: 'Uptime',
                iconURL: 'https://cdn.glitch.global/f17846b6-dd81-4025-aa4d-414956f8c9d1/emoji3.png?v=1742049392731'
            });

        await interaction.reply({ embeds: [embed] });
    },
};