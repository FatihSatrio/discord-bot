const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports ={
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Replies with Pong and latency bot!'),
    async execute(interaction) {
        const sent = await interaction.reply({ content : `Pinging...`, fetchReply: true});        
        const latency = sent.createdTimestamp - interaction.createdTimestamp;

        const embed = new EmbedBuilder()
            .setColor('Green')
            .setTitle('Pong!')
            .setTimestamp()
            .setFooter({ text: 'Bot Latency', iconURL: 'https://cdn.glitch.global/f17846b6-dd81-4025-aa4d-414956f8c9d1/emoji3.png?v=1742049392731'})
            .addFields({ name: 'Latency', value: latency + 'ms', inline: true })
            .addFields({ name: 'API Latency', value: Math.round(sent.createdTimestamp - Date.now()) + 'ms', inline: true });

        await interaction.editReply({ embeds: [embed] });
    },
};