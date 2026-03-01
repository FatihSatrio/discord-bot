const { SlashCommandBuilder, EmbedBuilder, version: djsVersion } = require('discord.js');
const os = require('os');
const process = require('process');
const { getDiskInfoSync } = require('node-disk-info');
const { monitorEventLoopDelay } = require('perf_hooks');
require('dotenv').config();

function formatDuration(seconds) {
    seconds = Math.floor(seconds);
    const d = Math.floor(seconds / 86400);
    const h = Math.floor(seconds % 86400 / 3600);
    const m = Math.floor(seconds % 3600 / 60);
    const s = Math.floor(seconds % 60);
    return `${d}d ${h}h ${m}m ${s}s`;
}

function gb(bytes) {
    return (bytes / 1024 / 1024 / 1024).toFixed(2);
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('system')
        .setDescription('Ultra enterprise diagnostics'),

    devOnly: true,

    async execute(interaction) {

        if (interaction.user.id !== process.env.BOT_OWNER_ID) {
            return interaction.reply({
                content: '🚫 Only bot owner allowed.',
                ephemeral: true
            });
        }

        await interaction.deferReply({ ephemeral: true });

        const client = interaction.client;

        /* ================= CPU SAMPLE ================= */

        const startUsage = process.cpuUsage();
        const startTime = process.hrtime();
        await new Promise(res => setTimeout(res, 200));
        const diffUsage = process.cpuUsage(startUsage);
        const diffTime = process.hrtime(startTime);

        const cpuPercent = (
            (diffUsage.user + diffUsage.system) /
            (diffTime[0] * 1e6 + diffTime[1] / 1e3)
        * 100).toFixed(2);

        /* ================= MEMORY ================= */

        const totalMem = os.totalmem();
        const freeMem = os.freemem();
        const usedMem = totalMem - freeMem;
        const memPercent = ((usedMem / totalMem) * 100).toFixed(1);

        /* ================= EVENT LOOP ================= */

        const h = monitorEventLoopDelay();
        h.enable();
        await new Promise(r => setTimeout(r, 200));
        h.disable();
        const eventLoop = (h.mean / 1e6).toFixed(2);

        /* ================= DISK ================= */

        let diskText = 'Unavailable';
        try {
            const disks = getDiskInfoSync();
            const disk = disks[0];
            const total = (disk.blocks / 1024 / 1024).toFixed(2);
            const used = (disk.used / 1024 / 1024).toFixed(2);
            diskText = `${used}GB / ${total}GB (${disk.capacity})`;
        } catch {}

        /* ================= HEALTH STATUS ================= */

        let health = '🟢 Healthy';
        if (memPercent > 80 || cpuPercent > 75) health = '🟡 Warning';
        if (memPercent > 90 || cpuPercent > 90) health = '🔴 Critical';

        /* ================= SHARD / CLUSTER ================= */

        const shardId = interaction.guild?.shardId ?? 0;
        const shardCount = client.shard?.count ?? 1;
        const clusterId = process.env.CLUSTER_ID ?? 'Single';

        /* ================= OPTIONAL DB PING ================= */

        let dbPing = 'Not configured';
        if (client.db?.ping) {
            const start = Date.now();
            await client.db.ping();
            dbPing = `${Date.now() - start} ms`;
        }

        /* ================= EMBED ================= */

        const embed = new EmbedBuilder()
            .setColor(health.includes('Critical') ? 0xff0000 :
                     health.includes('Warning') ? 0xffcc00 : 0x00ff99)
            .setTitle('🖥️ Ultra Enterprise Monitoring')
            .setDescription(`Status: **${health}**`)
            .addFields(

                { name: '⏱ Bot Uptime', value: formatDuration(process.uptime()), inline: true },
                { name: '🕰 OS Uptime', value: formatDuration(os.uptime()), inline: true },
                { name: '🏠 Guilds', value: `${client.guilds.cache.size}`, inline: true },

                { name: '📦 Node', value: process.version, inline: true },
                { name: '📚 Discord.js', value: `v${djsVersion}`, inline: true },
                { name: '🧱 Platform', value: `${os.platform()} (${os.arch()})`, inline: true },

                { name: '💾 RAM', value: `${gb(usedMem)}GB / ${gb(totalMem)}GB (${memPercent}%)`, inline: false },
                { name: '⚙️ CPU Usage', value: `${cpuPercent}%`, inline: true },
                { name: '🔁 Event Loop Delay', value: `${eventLoop} ms`, inline: true },

                { name: '💽 Disk', value: diskText, inline: false },

                { name: '🏓 API Latency', value: `${Math.round(client.ws.ping)} ms`, inline: true },
                { name: '🧩 Shard', value: `${shardId}/${shardCount}`, inline: true },
                { name: '🗂 Cluster', value: `${clusterId}`, inline: true },

                { name: '🗄 Database Ping', value: dbPing, inline: true },
                { name: '🆔 PID', value: `${process.pid}`, inline: true }
            )
            .setFooter({
                text: `Requested by ${interaction.user.tag}`
            })
            .setTimestamp();

        await interaction.editReply({ embeds: [embed] });
    }
};