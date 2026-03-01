const {
    SlashCommandBuilder,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require('discord.js');

require('dotenv').config();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Display available commands')
        .addStringOption(option =>
            option.setName('command')
                .setDescription('View specific command info')
                .setRequired(false)
        ),

    async execute(interaction) {

        const client = interaction.client;
        const isOwner = interaction.user.id === process.env.BOT_OWNER_ID;
        const specific = interaction.options.getString('command');

        const commands = [...client.commands.values()]
            .filter(cmd => !cmd.devOnly || isOwner)
            .sort((a, b) => a.data.name.localeCompare(b.data.name));

        if (!commands.length) {
            return interaction.reply({
                content: 'No commands available.',
                ephemeral: true
            });
        }

        /* =========================
           SPECIFIC COMMAND VIEW
        ========================== */

        if (specific) {
            const cmd = commands.find(c => c.data.name === specific);

            if (!cmd) {
                return interaction.reply({
                    content: 'Command not found.',
                    ephemeral: true
                });
            }

            const embed = new EmbedBuilder()
                .setColor(0x5865F2)
                .setTitle(`/${cmd.data.name}`)
                .setDescription(cmd.data.description || 'No description.')
                .addFields(
                    { name: 'Developer Only', value: cmd.devOnly ? 'Yes 👑' : 'No', inline: true }
                )
                .setTimestamp();

            return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        /* =========================
           PAGINATION SYSTEM
        ========================== */

        const maxPerPage = 6;
        const totalPages = Math.ceil(commands.length / maxPerPage);
        let page = 0;

        const generateEmbed = () => {
            const start = page * maxPerPage;
            const current = commands.slice(start, start + maxPerPage);

            return new EmbedBuilder()
                .setColor(0x5865F2)
                .setTitle('📘 Help Menu')
                .setDescription(`Total Commands: **${commands.length}**`)
                .addFields(
                    current.map(cmd => ({
                        name: `/${cmd.data.name}${cmd.devOnly ? ' 👑' : ''}`,
                        value: cmd.data.description || 'No description.',
                        inline: false
                    }))
                )
                .setFooter({
                    text: `Page ${page + 1} / ${totalPages}`
                })
                .setTimestamp();
        };

        const getButtons = () => new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('prev')
                .setLabel('⬅️')
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(page === 0),

            new ButtonBuilder()
                .setCustomId('next')
                .setLabel('➡️')
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(page >= totalPages - 1),

            new ButtonBuilder()
                .setCustomId('close')
                .setLabel('Close')
                .setStyle(ButtonStyle.Danger)
        );

        const message = await interaction.reply({
            embeds: [generateEmbed()],
            components: [getButtons()],
            ephemeral: true,
            fetchReply: true
        });

        const collector = message.createMessageComponentCollector({
            time: 120_000
        });

        collector.on('collect', async i => {

            if (i.user.id !== interaction.user.id) {
                return i.reply({
                    content: 'This menu is not for you.',
                    ephemeral: true
                });
            }

            if (i.customId === 'prev') page--;
            if (i.customId === 'next') page++;
            if (i.customId === 'close') {
                collector.stop();
                return i.update({
                    content: 'Help menu closed.',
                    embeds: [],
                    components: []
                });
            }

            await i.update({
                embeds: [generateEmbed()],
                components: [getButtons()]
            });
        });

        collector.on('end', async () => {
            try {
                await message.edit({ components: [] });
            } catch {}
        });
    }
};