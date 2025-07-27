const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('List all available commands'),

  async execute(interaction) {
    const commandsPath = path.join(__dirname);
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

    const fields = [];

    for (const file of commandFiles) {
      const command = require(path.join(commandsPath, file));
      if (command.data && command.data.name !== 'help') {
        fields.push({
          name: `/${command.data.name}`,
          value: command.data.description || 'No description provided',
          inline: false
        });
      }
    }

    const embed = new EmbedBuilder()
      .setTitle('📘 Help Menu')
      .setDescription('Here are the available commands:')
      .addFields(fields)
      .setColor(0x5865F2)
      .setFooter({ text: `Requested by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
      .setTimestamp();

    await interaction.reply({ embeds: [embed], ephemeral: true });
  }
};
