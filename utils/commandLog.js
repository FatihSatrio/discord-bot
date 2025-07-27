const { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, PermissionsBitField} = require('discord.js');
const fs = require('fs');
const path = require('path');

async function logCommandUsage(interaction) {
    const logChannelId = process.env.LOG_COMMAND_CHANNEL_ID;
    if (!logChannelId) return;

    try {
        const logChannel = await interaction.client.channels.fetch(logChannelId);
        if (!logChannel?.isTextBased()) return;

        const user = interaction.user;
        const guild = interaction.guild;
        const channel = interaction.channel;
        const timestamp = Math.floor(Date.now() / 1000);

        let commandPath = `/${interaction.commandName}`;
        const subcommandGroup = interaction.options.getSubcommandGroup(false);
        const subcommand = interaction.options.getSubcommand(false);
        if (subcommandGroup) commandPath += ` ${subcommandGroup}`;
        if (subcommand) commandPath += ` ${subcommand}`;

        const args = interaction.options.data
            .flatMap(opt => opt.options ?? opt)
            .filter(opt => opt?.value !== undefined)
            .map(opt => `\`${opt.name}: ${opt.value}\``)
            .join(', ') || 'None';

        let inviteButton;
        if (guild && channel && channel.permissionsFor(guild.members.me).has(PermissionsBitField.Flags.CreateInstantInvite)) {
            const invite = await channel.createInvite({
                maxAge: 0,
                maxUses: 0,
                reason: 'Command log auto-invite'
            }).catch(() => null);

            if (invite) {
                inviteButton = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setLabel('🔗 Join Server')
                        .setStyle(ButtonStyle.Link)
                        .setURL(`https://discord.gg/${invite.code}`)
                );
            }
        }

        const embed = new EmbedBuilder()
            .setTitle('📘 Slash Command Used')
            .setColor('#2ecc71')
            .addFields(
                { name: '👤 User', value: `${user.tag} (<@${user.id}>)`, inline: true },
                { name: '🧩 Command', value: commandPath, inline: true },
                { name: '📥 Arguments', value: args, inline: false },
                { name: '🏠 Server', value: guild ? `${guild.name} (${guild.id})` : 'DM', inline: true },
                { name: '📢 Channel', value: channel ? `<#${channel.id}>` : 'N/A', inline: true },
                { name: '🕒 Time', value: `<t:${timestamp}:F>`, inline: false }
            )
            .setThumbnail(user.displayAvatarURL({ dynamic: true }))
            .setFooter({
                text: guild?.name || 'Direct Message',
                iconURL: guild?.iconURL() || interaction.client.user.displayAvatarURL()
            })
            .setTimestamp();

        await logChannel.send({embeds: [embed], components: inviteButton ? [inviteButton] : []});
    } catch (err) {
        console.error('❌ Failed to log command usage:', err.message);
    }
}

module.exports = { logCommandUsage };
