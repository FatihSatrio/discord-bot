const { SlashCommandBuilder } = require('discord.js');
const { devOnly } = require('./system');

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

module.exports = {
  data: new SlashCommandBuilder()
    .setName('dmall')
    .setDescription('Send a message to all users in the server')
    .addStringOption(option =>
      option.setName('message')
        .setDescription('The message to send')
        .setRequired(true)),

  devOnly: true,

  async execute(interaction) {
    if (interaction.user.id !== process.env.BOT_OWNER_ID) {
      return interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
    }

    const msg = interaction.options.getString('message');
    const members = await interaction.guild.members.fetch();

    let success = 0;
    let failed = 0;

    await interaction.deferReply({ flags: 64 });

    for (const member of members.values()) {
      if (member.user.bot) continue;

      try {
        await member.send(msg);
        success++;
      } catch (error) {
        failed++;
      }

      await sleep(1000);
    }

    await interaction.editReply({
      content: `✅ MASS DM DONE.\nDM Success: **${success}**\nDM Failed: **${failed}**\nMessage: **${msg}**`,
      ephemeral: true
    });
  },
};
