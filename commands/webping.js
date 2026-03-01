const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');
const { performance } = require('perf_hooks');
const dns = require('dns').promises;
const { URL } = require('url');

function isPrivateIP(ip) {
    return (
        ip.startsWith('10.') ||
        ip.startsWith('192.168.') ||
        ip.startsWith('172.16.') ||
        ip.startsWith('127.') ||
        ip === '::1'
    );
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('webping')
        .setDescription('Advanced website availability check')
        .addStringOption(option =>
            option.setName('url')
                .setDescription('Domain or URL (example.com)')
                .setRequired(true)
        ),

    async execute(interaction) {

        let input = interaction.options.getString('url').trim();

        if (!/^https?:\/\//i.test(input)) {
            input = `https://${input}`;
        }

        let parsed;
        try {
            parsed = new URL(input);
        } catch {
            return interaction.reply({
                content: '❌ Invalid URL format.',
                ephemeral: true
            });
        }

        await interaction.reply({
            content: '🔍 Performing health check...',
            ephemeral: true
        });

        let resolvedIP = 'Unknown';
        try {
            const lookup = await dns.lookup(parsed.hostname);
            resolvedIP = lookup.address;

            if (isPrivateIP(resolvedIP)) {
                return interaction.editReply({
                    content: '🚫 Private/internal IPs are not allowed.'
                });
            }
        } catch {}

        const start = performance.now();

        try {

            const response = await axios.get(parsed.href, {
                timeout: 7000,
                maxRedirects: 5,
                validateStatus: () => true
            });

            const end = performance.now();
            const time = Math.round(end - start);

            const status = response.status;
            const statusClass = Math.floor(status / 100);

            let color = 0x00ff99;
            let statusText = '🟢 Online';

            if (statusClass === 4) {
                color = 0xffcc00;
                statusText = '🟡 Client Error';
            }

            if (statusClass === 5) {
                color = 0xff0000;
                statusText = '🔴 Server Error';
            }

            const embed = new EmbedBuilder()
                .setColor(color)
                .setTitle('🌐 Website Health Report')
                .addFields(
                    { name: 'URL', value: parsed.href, inline: false },
                    { name: 'Status', value: statusText, inline: true },
                    { name: 'HTTP Code', value: `${status}`, inline: true },
                    { name: 'Response Time', value: `${time} ms`, inline: true },
                    { name: 'Resolved IP', value: resolvedIP, inline: true },
                    { name: 'Redirected', value: `${response.request?.res?.responseUrl !== parsed.href ? 'Yes' : 'No'}`, inline: true }
                )
                .setTimestamp()
                .setFooter({ text: 'WebPing', iconURL: 'https://cdn.glitch.global/f17846b6-dd81-4025-aa4d-414956f8c9d1/emoji3.png?v=1742049392731' });

            await interaction.editReply({ content: '', embeds: [embed] });

        } catch (error) {

            const end = performance.now();
            const time = Math.round(end - start);

            const embed = new EmbedBuilder()
                .setColor(0xff0000)
                .setTitle('🌐 Website Health Report')
                .addFields(
                    { name: 'URL', value: parsed.href, inline: false },
                    { name: 'Status', value: '🔴 Offline / Unreachable', inline: true },
                    { name: 'Error', value: error.code || error.message, inline: false },
                    { name: 'Response Time', value: `${time} ms`, inline: true },
                    { name: 'Resolved IP', value: resolvedIP, inline: true }
                )
                .setTimestamp()
                .setFooter({ text: 'WebPing', iconURL: 'https://cdn.glitch.global/f17846b6-dd81-4025-aa4d-414956f8c9d1/emoji3.png?v=1742049392731' });

            await interaction.editReply({ content: '', embeds: [embed] });
        }
    }
};