const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Check bot latency'),

    async execute(interaction) {

        const start = Date.now(); // mulai hitung

        await interaction.deferReply();

        const botLatency = Date.now() - start; // waktu proses bot
        const apiLatency = Math.max(0, Math.round(interaction.client.ws.ping));

        const embed = new EmbedBuilder()
            .setColor(0x2ecc71)
            .setTitle('🏓 Pong!')
            .addFields(
                { name: 'Bot Latency', value: `${botLatency} ms`, inline: true },
                { name: 'API Latency', value: `${apiLatency} ms`, inline: true }
            )
            .setTimestamp()
            .setFooter({ 
                text: 'Latency Bot', 
                iconURL: 'https://cdn.glitch.global/f17846b6-dd81-4025-aa4d-414956f8c9d1/emoji3.png?v=1742049392731' 
            });

        await interaction.editReply({ embeds: [embed] });
    }
};