import { runAssistant } from "@/lib/assistant";
import { sendTelegramMessage } from "@/lib/telegram";

type TelegramUpdate = {
  message?: {
    text?: string;
    chat?: {
      id: number;
    };
  };
};

export async function POST(request: Request): Promise<Response> {
  let chatId: number | undefined;
  try {
    const update = (await request.json()) as TelegramUpdate;
    chatId = update.message?.chat?.id;
    const text = update.message?.text?.trim();

    if (!chatId || !text) {
      return Response.json({ ok: true });
    }

    const lines: string[] = [];
    try {
      const result = await runAssistant(text);
      lines.push(
        `Goal: ${result.goal}`,
        `Priority: ${result.priority.toUpperCase()}`,
        "",
        "Action Plan:",
        ...result.steps.map((step, index) => `${index + 1}. ${step}`),
      );

      if (result.missingInformationQuestion) {
        lines.push("", `Follow-up: ${result.missingInformationQuestion}`);
      }
    } catch (assistantError) {
      console.error("Telegram assistant failure:", assistantError);
      lines.push(
        "I received your message, but I hit a temporary AI error.",
        "Please try again in a moment.",
      );
    }

    await sendTelegramMessage({
      chat_id: chatId,
      text: lines.join("\n"),
    });

    return Response.json({ ok: true });
  } catch (error) {
    console.error("Telegram webhook failure:", error);
    if (chatId) {
      try {
        await sendTelegramMessage({
          chat_id: chatId,
          text: "I could not process your request right now. Please try again.",
        });
      } catch (sendError) {
        console.error("Telegram fallback send failure:", sendError);
      }
    }

    return Response.json(
      { error: error instanceof Error ? error.message : "Unexpected error." },
      { status: 500 },
    );
  }
}
