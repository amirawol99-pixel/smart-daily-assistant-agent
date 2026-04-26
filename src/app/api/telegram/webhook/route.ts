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
  try {
    const update = (await request.json()) as TelegramUpdate;
    const chatId = update.message?.chat?.id;
    const text = update.message?.text?.trim();

    if (!chatId || !text) {
      return Response.json({ ok: true });
    }

    const result = await runAssistant(text);
    const lines = [
      `Goal: ${result.goal}`,
      `Priority: ${result.priority.toUpperCase()}`,
      "",
      "Action Plan:",
      ...result.steps.map((step, index) => `${index + 1}. ${step}`),
    ];

    if (result.missingInformationQuestion) {
      lines.push("", `Follow-up: ${result.missingInformationQuestion}`);
    }

    await sendTelegramMessage({
      chat_id: chatId,
      text: lines.join("\n"),
    });

    return Response.json({ ok: true });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Unexpected error." },
      { status: 500 },
    );
  }
}
