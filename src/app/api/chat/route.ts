import { runAssistant } from "@/lib/assistant";

type ChatBody = {
  message?: string;
};

export async function POST(request: Request): Promise<Response> {
  try {
    const body = (await request.json()) as ChatBody;
    const message = body.message?.trim();

    if (!message) {
      return Response.json({ error: "Message is required." }, { status: 400 });
    }

    const result = await runAssistant(message);
    return Response.json(result, { status: 200 });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Unexpected error." },
      { status: 500 },
    );
  }
}
