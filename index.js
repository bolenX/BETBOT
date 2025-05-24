const express = require('express');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

const wallet = process.env.WALLET_ADDRESS;
const telegramToken = process.env.TELEGRAM_BOT_TOKEN;
const telegramChatId = process.env.TELEGRAM_CHAT_ID;

let lastAlertPrice = 0;

async function getGIBPrice() {
  try {
    const response = await axios.get(
      'https://api.geckoterminal.com/api/v2/networks/solana/pools/3aU4u9zxur3YtRVL5mHpGuYoH53wD3LSN8PY8oJ4MTpi',
      { headers: { 'User-Agent': 'Mozilla/5.0' } }
    );
    console.log("✅ GIB Price API response:", response.data);
  } catch (error) {
    console.error("❌ GIB API Error:", error?.response?.status, error?.response?.data || error.message);
  }
} // ✅ <-- this was missing

async function sendTelegramAlert(message) {
  const url = `https://api.telegram.org/bot${telegramToken}/sendMessage`;
  await axios.post(url, { chat_id: telegramChatId, text: message });
}

async function monitor() {
  const price = await getGIBPrice();
  if (!price) return;

  if (price !== lastAlertPrice) {
    lastAlertPrice = price;
    await sendTelegramAlert(`GIB Price Alert: $${price.toFixed(4)}`);
  }
}

setInterval(monitor, 60 * 1000);

app.get('/', (req, res) => res.send('GIB Tracker Bot is running...'));
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
