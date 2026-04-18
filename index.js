require('dotenv').config();
const { Telegraf } = require('telegraf');
const axios = require('axios');
const cron = require('node-cron');

const bot = new Telegraf(process.env.BOT_TOKEN);

// ID Grup kamu
const targetGroupId = '-1003807658725';

// 1. Fungsi Ambil Jadwal (Tetap sama)
async function getJadwalSholat() {
    try {
        const d = new Date();
        const url = `https://api.myquran.com/v2/sholat/jadwal/1301/${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`;
        const response = await axios.get(url);
        return response.data.data.jadwal;
    } catch (error) {
        console.error("API Error:", error.message);
        return null;
    }
}

// 2. PRIORITAS: Perintah Command (Harus di atas bot.on)
bot.command('tes', (ctx) => {
    console.log("Menerima perintah /tes");
    ctx.reply("apadah di tes mulu.");
});

bot.command('setup_grup', (ctx) => {
    ctx.reply('✅ Grup ini sudah terdaftar untuk pengingat otomatis.');
});

// 3. Respon Text Biasa (Taruh di bawah command)
bot.on('text', (ctx) => {
    console.log(`Pesan masuk dari ${ctx.chat.title}: ${ctx.message.text}`);

    const pesan = ctx.message.text.toLowerCase();
    if (pesan === 'halo') {
        ctx.reply('hi! welcome kata kentut ganteng.');
    }
    if (pesan === 'rachel') {
        ctx.reply('jelek.');
    }
    if (pesan === 'kentut') {
        ctx.reply('ganteng');
    }
    if (pesan === 'fadli') {
        ctx.reply('cabul');
    }
    if (pesan === 'p') {

        ctx.reply('p apa');
    }
    if (pesan === 'el') {
        ctx.reply('sunda');
    }
});

// 4. Pengingat Otomatis (Cron Job)
cron.schedule('* * * * *', async () => {
    const d = new Date();
    const sekarang = d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false }).replace('.', ':');

    console.log(`[${sekarang}] Mengecek jadwal...`);

    const jadwal = await getJadwalSholat();
    if (jadwal) {
        const waktuIbadah = {
            'Subuh': jadwal.subuh,
            'Dzuhur': jadwal.dzuhur,
            'Ashar': jadwal.ashar,
            'Maghrib': jadwal.maghrib,
            'Isya': jadwal.isya
        };

        for (const [nama, waktu] of Object.entries(waktuIbadah)) {
            if (sekarang === waktu) {
                const teksRemind = `📣 **WAKTUNYA ${nama.toUpperCase()}**\n\nUntuk wilayah Jakarta dan sekitarnya, mari menunaikan ibadah. abis diingetin sama si ganteng (kentut).\n\nCc: @all anggota grup`;
                bot.telegram.sendMessage(targetGroupId, teksRemind, { parse_mode: 'Markdown' });
                console.log(`Reminder ${nama} terkirim!`);
            }
        }
    }
});

cron.schedule('0 8 * * 7', () => { // Setiap hari Minggu jam 08:00 pagi
    bot.telegram.sendMessage(targetGroupId, "🔔 Selamat pagi! Waktunya bersiap untuk ibadah Kebaktian/Misa hari Minggu.");
});

bot.launch().then(() => console.log('🚀 Bot Aktif! Coba /tes sekarang.'));

// Graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));