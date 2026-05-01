require('dotenv').config();
const { Telegraf } = require('telegraf');
const axios = require('axios');

const bot = new Telegraf(process.env.BOT_TOKEN);
const targetGroupId = '-1003807658725';

// --- 1. Fungsi Ambil Jadwal Sholat ---
async function getJadwalSholat() {
    try {
        const d = new Date();
        // Menggunakan zona waktu Jakarta (WIB)
        const url = `https://api.myquran.com/v2/sholat/jadwal/1301/${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`;
        const response = await axios.get(url);
        return response.data.data.jadwal;
    } catch (error) {
        console.error("❌ API Error:", error.message);
        return null;
    }
}

// --- 2. Perintah & Respon Chat (Webhook Logic) ---
bot.command('tes', (ctx) => ctx.reply("apadah di tes mulu."));

bot.on('text', (ctx) => {
    const pesan = ctx.message.text.toLowerCase();
    const respon = {
        'halo': 'hi! welcome kata kentut ganteng.',
        'rachel': 'RATU',
        'rahel': 'RATU',
        'ahel': 'RATU',
        'kentut': 'si ganteng kalem',
        'fadli': 'CABUL BANGET, kaya monyet',
        'p': 'p apa',
        'pp': 'p apa',
        'ppp': 'p apa',
        'pppp': 'brisik',
        'el': 'pangeran belegug',
        'yupi': 'gemes cenah',
        'ayaa': 'ayay manis',
        'nay': 'euy',
        'khanza': 'kang ngamuk',
        'kara': 'cool',
        'f': 'cabul'
    };

    if (respon[pesan]) {
        ctx.reply(respon[pesan], { reply_to_message_id: ctx.message.message_id });
    }
});

// --- 3. Handler Utama Vercel ---
module.exports = async (req, res) => {
    try {
        // A. JIKA DIPANGGIL OLEH VERCEL CRON (Cek Jadwal Sholat)
        if (req.headers['x-vercel-cron'] === '1') {
            const jadwal = await getJadwalSholat();
            if (!jadwal) return res.status(500).send('Gagal ambil jadwal');

            const d = new Date();
            const sekarang = new Intl.DateTimeFormat('id-ID', {
                hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Jakarta'
            }).format(d).replace('.', ':');

            const waktuIbadah = {
                'Subuh': jadwal.subuh,
                'Dzuhur': jadwal.dzuhur,
                'Ashar': jadwal.ashar,
                'Maghrib': jadwal.maghrib,
                'Isya': jadwal.isya
            };

            for (const [nama, waktu] of Object.entries(waktuIbadah)) {
                if (sekarang === waktu) {
                    await bot.telegram.sendMessage(targetGroupId, ` /all 📣 **WAKTUNYA ${nama.toUpperCase()}**\n\nUntuk wilayah Jakarta dan sekitarnya, mari menunaikan ibadah.\n\nCc: anggota grup`, { parse_mode: 'Markdown' });
                }
            }
            return res.status(200).send('Cron processed');
        }

        // B. JIKA DIPANGGIL OLEH TELEGRAM (Pesan Masuk)
        if (req.method === 'POST') {
            await bot.handleUpdate(req.body);
            return res.status(200).send('OK');
        }

        // C. AKSES BROWSER BIASA
        res.status(200).send('Bot Journey Online!');
    } catch (err) {
        console.error("Handler Error:", err);
        res.status(500).send('Internal Error');
    }
};

// =============================================================
// BAGIAN PENGETESAN LOKAL (VS CODE)
// HAPUS ATAU KASIH TANDA // DI DEPAN BARIS DI BAWAH INI SEBELUM PUSH KE GITHUB!
// =============================================================
bot.launch().then(() => console.log("🚀 BOT NYALA DI LOKAL! Terminal tidak akan exit."));