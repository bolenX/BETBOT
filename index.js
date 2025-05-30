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
      'https://api.geckoterminal.com/api/v2/networks/solana/pools/G384jB8BvBVBMMyy7ZopdUjk7t4GsnDiWJKxG1eEM8bD',
      { headers: { 'User-Agent': 'Mozilla/5.0' } }
    );
    const price = parseFloat(response.data.data.attributes.base_token_price_usd);
    console.log("✅ GIB Price:", price);
    return price;
  } catch (error) {
    console.error("❌ GIB API Error:", error?.response?.status, error?.response?.data || error.message);
    return null;
  }
}

async function sendTelegramAlert(message) {
  const url = `https://api.telegram.org/bot${telegramToken}/sendMessage`;
  await axios.post(url, { chat_id: telegramChatId, text: message });
}

async function monitor() {
  const price = await getGIBPrice();
  if (!price) return;

  if (price !== lastAlertPrice) {
    lastAlertPrice = price;
    await sendTelegramAlert(`GIB Price Alert: $${price.toFixed(8)}`);
  }
}

setInterval(monitor, 5 * 60 * 1000);

app.get('/', (req, res) => res.send('GIB Tracker Bot is running...'));
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
