import { getOptionalEnv } from "@/lib/env";
import { setTelegramWebhook } from "@/lib/telegram";

export async function POST(): Promise<Response> {
  try {
    const appUrl = getOptionalEnv("APP_BASE_URL");
    if (!appUrl) {
      return Response.json(
        { error: "APP_BASE_URL is required to set Telegram webhook." },
        { status: 400 },
      );
    }

    const webhookUrl = `${appUrl.replace(/\/$/, "")}/api/telegram/webhook`;
    await setTelegramWebhook(webhookUrl);

    return Response.json({ success: true, webhookUrl });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Unexpected error." },
      { status: 500 },
    );
  }
}
