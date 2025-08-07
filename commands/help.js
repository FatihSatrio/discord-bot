const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('📘 List all available commands'),

  async execute(interaction) {
    try {
      const commandsPath = path.join(__dirname);
      const commandFiles = fs.readdirSync(commandsPath)
        .filter(file => file.endsWith('.js') && file !== 'help.js');

      const commandData = [];

      for (const file of commandFiles) {
        const command = require(path.join(commandsPath, file));
        const name = command.data?.name || 'unknown';
        const description = command.data?.description || 'No description provided';
        const devOnly = command.devOnly ? '👑 Developer Only' : '';

        commandData.push({
          name: `/${name} ${[devOnly].filter(Boolean).join('\n')}`,
          value: description
        });
      }

      // Pagination logic
      const pages = [];
      const maxPerPage = 6;

      for (let i = 0; i < commandData.length; i += maxPerPage) {
        const chunk = commandData.slice(i, i + maxPerPage);
        const embed = new EmbedBuilder()
          .setTitle('📘 Help Menu')
          .setDescription('List of available commands:')
          .addFields(chunk.map(cmd => ({
            name: cmd.name,
            value: cmd.value,
            inline: false
          })))
          .setColor(0x5865F2)
          .setFooter({ text: `Page ${pages.length + 1} of ${Math.ceil(commandData.length / maxPerPage)}` })
          .setTimestamp();

        pages.push(embed);
      }

      let page = 0;

      const getRow = () => new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('prev')
          .setLabel('⬅️ Prev')
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(page === 0),
        new ButtonBuilder()
          .setCustomId('next')
          .setLabel('Next ➡️')
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(page === pages.length - 1),
        new ButtonBuilder()
          .setCustomId('stop')
          .setLabel('🛑 Close')
          .setStyle(ButtonStyle.Danger)
      );

      const msg = await interaction.reply({
        embeds: [pages[page]],
        components: [getRow()],
        ephemeral: true,
        fetchReply: true
      });

      const collector = msg.createMessageComponentCollector({
        time: 60_000 // 60 seconds
      });

      collector.on('collect', async i => {
        if (i.user.id !== interaction.user.id) {
          return i.reply({
            content: '❌ You cannot interact with this menu.',
            ephemeral: true
          });
        }

        if (i.customId === 'prev') page--;
        if (i.customId === 'next') page++;
        if (i.customId === 'stop') {
          collector.stop();
          try {
            await i.update({
              content: '❌ Help menu closed.',
              embeds: [],
              components: []
            });
          } catch (err) {
            console.warn('Interaction update failed:', err.message);
          }
          return;
        }

        try {
          await i.update({
            embeds: [pages[page]],
            components: [getRow()]
          });
        } catch (err) {
          console.warn('Page change failed:', err.message);
        }
      });

      collector.on('end', async () => {
        try {
          await msg.edit({ components: [] });
        } catch (e) {
          console.warn('Failed to clean up buttons:', e.message);
        }
      });

    } catch (err) {
      console.error('Help command error:', err);
      try {
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp({
            content: '❌ An error occurred while showing the help menu.',
            ephemeral: true
          });
        } else {
          await interaction.reply({
            content: '❌ An error occurred while showing the help menu.',
            ephemeral: true
          });
        }
      } catch (followErr) {
        console.error('Failed to send error message:', followErr);
      }
    }
  }
};
