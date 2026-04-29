require('dotenv').config();
const { Telegraf } = require('telegraf');
const axios = require('axios');

const bot = new Telegraf(process.env.BOT_TOKEN);
const targetGroupId = '-1003807658725';

// Fungsi ambil jadwal sholat (tanpa cache karena serverless tidak simpan memori)
async function getJadwalSholat() {
    try {
        const d = new Date();
        const tanggal = d.getDate();
        const bulan = d.getMonth() + 1;
        const tahun = d.getFullYear();
        const url = `https://api.myquran.com/v2/sholat/jadwal/1301/${tahun}/${bulan}/${tanggal}`;
        const response = await axios.get(url);
        return response.data.data.jadwal;
    } catch (error) {
        console.error("❌ API Error:", error.message);
        return null;
    }
}

// --- Logic Bot ---
bot.command('tes', (ctx) => ctx.reply("apadah di tes mulu."));
bot.command('setup_grup', (ctx) => ctx.reply('✅ Grup ini sudah terdaftar.'));

bot.on('text', (ctx) => {
    const pesan = ctx.message.text.toLowerCase();
    const respon = {
        'halo': 'hi! welcome kata kentut ganteng.',
        'rachel': 'RATU', 'rahel': 'RATU', 'ahel': 'RATU',
        'kentut': 'si ganteng kalem',
        'fadli': 'CABUL BANGET, kaya monyet',
        'p': 'p apa', 'pp': 'p apa', 'ppp': 'p apa', 'pppp': 'brisik',
        'el': 'pangeran belegug',
        'yupi': 'gemes cenah',
        'ayaa': 'ayay manis',
        'nay': 'euy',
        'f': 'cabul'
    };

    if (respon[pesan]) {
        ctx.reply(respon[pesan], { reply_to_message_id: ctx.message.message_id });
    }
});

// --- Handler untuk Vercel (Webhook) ---
module.exports = async (req, res) => {
    try {
        if (req.method === 'POST') {
            await bot.handleUpdate(req.body);
            res.status(200).send('OK');
        } else {
            res.status(200).send('Bot is running...');
        }
    } catch (err) {
        console.error("Error:", err);
        res.status(500).send('Error');
    }
};
