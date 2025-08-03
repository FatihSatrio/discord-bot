const { SlashCommandBuilder, EmbedBuilder, version: djsVersion } = require('discord.js');
const os = require('os');
const process = require('process');
const { getDiskInfoSync } = require('node-disk-info');
require('dotenv').config();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('system')
        .setDescription('Displays advanced system and uptime information for the bot'),

    async execute(interaction) {
        if (interaction.user.id !== process.env.BOT_OWNER_ID) {
            return interaction.reply({ content: '🚫 Only the bot owner can use this command.', ephemeral: true });
        }

        await interaction.deferReply({ ephemeral: true });

        const processUptime = process.uptime();
        const botUptime = new Date(processUptime * 1000).toISOString().substr(11, 8);
        const osUptime = `${Math.floor(os.uptime() / 3600)}h ${Math.floor((os.uptime() % 3600) / 60)}m`;

        const memoryUsageMB = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);
        const totalMemGB = (os.totalmem() / 1024 / 1024 / 1024).toFixed(2);
        const freeMemGB = (os.freemem() / 1024 / 1024 / 1024).toFixed(2);

        const cpuModel = os.cpus()[0].model;
        const cpuCount = os.cpus().length;
        const loadAvg = os.loadavg().map(n => n.toFixed(2)).join(' / ');

        const nodeVersion = process.version;
        const platform = os.platform();
        const arch = os.arch();

        const hostname = os.hostname();
        const ipList = Object.values(os.networkInterfaces())
            .flat()
            .filter(i => i.family === 'IPv4' && !i.internal)
            .map(i => i.address)
            .join(', ') || 'Unknown';

        const guildCount = interaction.client.guilds.cache.size;
        const wsPing = interaction.client.ws.ping;

        const cpuUsageRaw = process.cpuUsage();
        const cpuUser = (cpuUsageRaw.user / 1000).toFixed(2);
        const cpuSys = (cpuUsageRaw.system / 1000).toFixed(2);
        const cpuTotal = (+cpuUser + +cpuSys).toFixed(2);

        const pid = process.pid;
        const cwd = process.cwd();
        const execPath = process.execPath;
        const startTime = new Date(Date.now() - process.uptime() * 1000).toLocaleString('en-US', {
            timeZone: 'Asia/Jakarta',
            hour12: false,
        });

        // Disk usage with node-disk-info
        let diskUsageField = { name: '💽 Disk Usage', value: 'Unavailable', inline: false };
        try {
            const disks = getDiskInfoSync();
            const disk = disks.find(d => d.mounted === '/' || d.mounted === 'C:\\' || d.mounted === 'C:');
            if (disk) {
                const total = (disk.blocks / 1024 / 1024).toFixed(2);
                const used = (disk.used / 1024 / 1024).toFixed(2);
                const available = (disk.available / 1024 / 1024).toFixed(2);
                const percent = disk.capacity;

                diskUsageField = {
                    name: '💽 Disk Usage',
                    value: `${used} GB / ${total} GB (${percent} used)`,
                    inline: false
                };
            }
        } catch (error) {
            console.error('Disk Info Error:', error.message);
        }

        const embed = new EmbedBuilder()
            .setTitle('🖥️ System Overview')
            .setColor(0x00bfff)
            .addFields(
                { name: '🤖 Bot Uptime', value: botUptime, inline: true },
                { name: '📚 Discord.js', value: `v${djsVersion}`, inline: true },
                { name: '📦 Node.js', value: nodeVersion, inline: true },

                { name: '💾 RAM Usage', value: `${memoryUsageMB} MB`, inline: true },
                { name: '📈 Total RAM', value: `${totalMemGB} GB`, inline: true },
                { name: '📉 Free RAM', value: `${freeMemGB} GB`, inline: true },

                { name: '🧠 CPU Model', value: cpuModel, inline: false },
                { name: '🧮 CPU Cores', value: `${cpuCount}`, inline: true },
                { name: '⚙️ CPU Usage', value: `${cpuTotal} ms (User: ${cpuUser} / System: ${cpuSys})`, inline: true },

                { name: '📊 Load Avg (1/5/15m)', value: loadAvg, inline: true },
                { name: '🌐 Hostname', value: hostname, inline: true },
                { name: '📡 IP Address', value: ipList, inline: true },

                { name: '🧱 Platform', value: `${platform} (${arch})`, inline: true },
                { name: '🕰️ OS Uptime', value: osUptime, inline: true },
                { name: '🏓 WS Ping', value: `${wsPing} ms`, inline: true },

                { name: '📍 PID', value: `${pid}`, inline: true },
                { name: '📂 Working Dir', value: cwd, inline: false },
                { name: '🔐 Executable', value: execPath, inline: false },

                { name: '🗓️ Start Time', value: startTime, inline: true },
                { name: '🏠 Guilds Joined', value: `${guildCount}`, inline: true },
                { name: '👤 Requested By', value: `${interaction.user.tag}`, inline: true },
                diskUsageField
            )
            .setTimestamp();

        await interaction.editReply({ embeds: [embed] });
    }
};
