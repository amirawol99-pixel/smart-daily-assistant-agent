import { getEnv } from "@/lib/env";

type TelegramSendMessagePayload = {
  chat_id: number;
  text: string;
};

export async function sendTelegramMessage(payload: TelegramSendMessagePayload): Promise<void> {
  const token = getEnv("TELEGRAM_BOT_TOKEN");
  const url = `https://api.telegram.org/bot${token}/sendMessage`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Telegram sendMessage failed: ${errorText}`);
  }
}

export async function setTelegramWebhook(webhookUrl: string): Promise<void> {
  const token = getEnv("TELEGRAM_BOT_TOKEN");
  const url = `https://api.telegram.org/bot${token}/setWebhook`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url: webhookUrl }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Telegram setWebhook failed: ${errorText}`);
  }
}
