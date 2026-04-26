import { getAiProvider, getEnv } from "@/lib/env";

export type AssistantResult = {
  goal: string;
  priority: "high" | "medium" | "low";
  steps: string[];
  missingInformationQuestion: string | null;
  responseText: string;
};

const AGENT_PROMPT = `
You are Smart Daily Assistant.
Your job:
1) Understand the user's goal.
2) Break it into small actionable steps.
3) Prioritize the work.
4) Ask one follow-up question if important information is missing.

Return ONLY valid JSON in this shape:
{
  "goal": "short goal summary",
  "priority": "high | medium | low",
  "steps": ["step 1", "step 2", "step 3"],
  "missingInformationQuestion": "question or null",
  "responseText": "friendly concise message with plan"
}
`;

export async function runAssistant(userMessage: string): Promise<AssistantResult> {
  const provider = getAiProvider();
  if (provider === "nim") {
    return runWithNim(userMessage);
  }
  return runWithGemini(userMessage);
}

async function runWithGemini(userMessage: string): Promise<AssistantResult> {
  const apiKey = getEnv("GEMINI_API_KEY");
  const model = process.env.GEMINI_MODEL ?? "gemini-2.0-flash";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [
        {
          role: "user",
          parts: [{ text: `${AGENT_PROMPT}\n\nUser message: ${userMessage}` }],
        },
      ],
      generationConfig: {
        temperature: 0.3,
        responseMimeType: "application/json",
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini request failed: ${errorText}`);
  }

  const data = (await response.json()) as {
    candidates?: Array<{
      content?: { parts?: Array<{ text?: string }> };
    }>;
  };

  const raw = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!raw) {
    throw new Error("Gemini returned an empty response.");
  }

  return normalizeAssistantResult(raw);
}

async function runWithNim(userMessage: string): Promise<AssistantResult> {
  const apiKey = getEnv("NVIDIA_NIM_API_KEY");
  const model = process.env.NVIDIA_NIM_MODEL ?? "meta/llama-3.1-70b-instruct";

  const response = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: 0.3,
      messages: [
        { role: "system", content: AGENT_PROMPT },
        { role: "user", content: userMessage },
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`NVIDIA NIM request failed: ${errorText}`);
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const raw = data.choices?.[0]?.message?.content;
  if (!raw) {
    throw new Error("NVIDIA NIM returned an empty response.");
  }

  return normalizeAssistantResult(raw);
}

function normalizeAssistantResult(raw: string): AssistantResult {
  const parsed = safeJsonParse(raw);
  const goal = typeof parsed.goal === "string" ? parsed.goal : "General daily planning";
  const priority = asPriority(parsed.priority);
  const steps = Array.isArray(parsed.steps)
    ? parsed.steps.filter((item): item is string => typeof item === "string").slice(0, 6)
    : [];
  const missingInformationQuestion =
    typeof parsed.missingInformationQuestion === "string"
      ? parsed.missingInformationQuestion
      : null;
  const responseText =
    typeof parsed.responseText === "string"
      ? parsed.responseText
      : buildFallbackResponse(goal, priority, steps, missingInformationQuestion);

  return {
    goal,
    priority,
    steps: steps.length > 0 ? steps : ["Clarify your top priority for today."],
    missingInformationQuestion,
    responseText,
  };
}

function safeJsonParse(input: string): Record<string, unknown> {
  try {
    return JSON.parse(input) as Record<string, unknown>;
  } catch {
    const sanitized = input.replace(/^```json\s*/i, "").replace(/```$/, "").trim();
    return JSON.parse(sanitized) as Record<string, unknown>;
  }
}

function asPriority(value: unknown): "high" | "medium" | "low" {
  if (value === "high" || value === "medium" || value === "low") {
    return value;
  }
  return "medium";
}

function buildFallbackResponse(
  goal: string,
  priority: "high" | "medium" | "low",
  steps: string[],
  missingQuestion: string | null,
): string {
  const stepLines = steps.map((step, index) => `${index + 1}. ${step}`).join("\n");
  const followUp = missingQuestion ? `\nFollow-up: ${missingQuestion}` : "";
  return `Goal: ${goal}\nPriority: ${priority}\nPlan:\n${stepLines}${followUp}`;
}
