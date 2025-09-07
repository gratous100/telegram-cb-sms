const TelegramBot = require("node-telegram-bot-api");
const fetch = require("node-fetch");

const BOT_TOKEN = process.env.BOT_TOKEN;
const ADMIN_CHAT_ID = process.env.ADMIN_CHAT_ID;
const APP_URL = process.env.APP_URL;

// Start bot with polling mode
const bot = new TelegramBot(BOT_TOKEN, { polling: true });

// Function to send SMS approval buttons
function sendApprovalRequestSMS(code) {
  const options = {
    parse_mode: "Markdown",
    reply_markup: {
      inline_keyboard: [
        [
          { text: "✅ Ballaa33", callback_data: `accept|${code}` },
          { text: "❌ Nsa Al3fsa", callback_data: `reject|${code}` },
        ],
      ],
    },
  };

  bot.sendMessage(ADMIN_CHAT_ID, "*Ndewech?!*", options);
}

// Handle button clicks
bot.on("callback_query", async (query) => {
  let [action, code] = query.data.split("|");
  code = code.trim();
  const status = action === "accept" ? "accepted" : "rejected";

  try {
    // Update status on backend
    await fetch(`${APP_URL}/update-status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, status }),
    });

    await bot.answerCallbackQuery(query.id, {
      text: `✅ You ${status} ${code}`,
    });

    await bot.editMessageText(
      `🔐 ${code} has been *${status.toUpperCase()}*`,
      {
        chat_id: query.message.chat.id,
        message_id: query.message.message_id,
        parse_mode: "Markdown",
      }
    );
  } catch (err) {
    console.error("❌ Failed to update status:", err);
    bot.sendMessage(ADMIN_CHAT_ID, `⚠️ Error updating status for ${code}`);
  }
});

// Start command
bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, "✅ Bot is running and waiting for SMS approvals.");
});

module.exports = { sendApprovalRequestSMS };
