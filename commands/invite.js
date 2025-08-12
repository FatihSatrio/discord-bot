const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('invite')
    .setDescription('Send an invite link for the bot with Administrator permission'),
  async execute(interaction) {
    const url = `https://discord.com/oauth2/authorize?client_id=1389140440489656340&permissions=8&integration_type=0&scope=bot+applications.commands`;

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel('🚀 Invite Bot')
        .setStyle(ButtonStyle.Link)
        .setURL(url)
    );

    await interaction.reply({
      content: 'Click the button below to invite the bot to your server with **Administrator permissions**',
      components: [row],
      ephemeral: true
    });
  },
};
