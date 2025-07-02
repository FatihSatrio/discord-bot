const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports ={
    data: new SlashCommandBuilder()
        .setName('uptime')
        .setDescription('Show uptime of the bot!'),
    async execute(interaction) {
        const uptime = interaction.client.uptime;

        const second = Math.floor((uptime / 1000) % 60);
        const minute = Math.floor((uptime / (1000 ^ 60)) % 60);
        const hour = Math.floor((uptime / (1000 * 60 * 60)) % 24);
        const day = Math.floor(uptime / (1000 * 60 * 60 * 24));

        const uptimeString = `${day}Days ${hour}Hours ${minute}Minutes ${second}Seconds`;

        const embed = new EmbedBuilder()
        .setTitle('Uptime')
        .setColor('Green')
        .addFields({ name: 'Days', value: day + 'd', inline: true })
        .addFields({ name: 'Hours', value: hour + 'h', inline: true })
        .addFields({ name: 'Minutes', value: minute + 'm', inline: true })
        .addFields({ name: 'Seconds', value: second + 's', inline: true })
        .setTimestamp()
        .setFooter({ text: 'Uptime', iconURL: 'https://cdn.glitch.global/f17846b6-dd81-4025-aa4d-414956f8c9d1/emoji3.png?v=1742049392731' });
        await interaction.reply({ embeds: [embed] });
    },
};