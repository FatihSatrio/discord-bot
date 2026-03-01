const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

function formatDuration(seconds) {
    seconds = Math.floor(seconds);

    const d = Math.floor(seconds / 86400);
    const h = Math.floor(seconds % 86400 / 3600);
    const m = Math.floor(seconds % 3600 / 60);
    const s = Math.floor(seconds % 60);

    const parts = [];
    if (d) parts.push(`${d}d`);
    if (h) parts.push(`${h}h`);
    if (m) parts.push(`${m}m`);
    if (s || parts.length === 0) parts.push(`${s}s`);

    return parts.join(' ');
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('uptime')
        .setDescription('Displays bot uptime information'),

    async execute(interaction) {

        const uptimeSeconds = process.uptime();
        const formatted = formatDuration(uptimeSeconds);

        const startedAtUnix = Math.floor(Date.now() / 1000 - uptimeSeconds);

        const embed = new EmbedBuilder()
            .setColor(0x2ecc71)
            .setTitle('⏱️ Bot Uptime')
            .setDescription(
                `**Running for:**\n` +
                `\`${formatted}\`\n\n` +
                `**Started:**\n` +
                `<t:${startedAtUnix}:F>\n` +
                `<t:${startedAtUnix}:R>`
            )
            .setFooter({
                text: `Process ID: ${process.pid}`
            })
            .setTimestamp()
            .setFooter({ text: 'Uptime', iconURL: 'https://cdn.glitch.global/f17846b6-dd81-4025-aa4d-414956f8c9d1/emoji3.png?v=1742049392731' });

        await interaction.reply({ embeds: [embed] });
    }
};