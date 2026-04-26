type RequiredKey =
  | "AI_PROVIDER"
  | "GEMINI_API_KEY"
  | "NVIDIA_NIM_API_KEY"
  | "TELEGRAM_BOT_TOKEN";

export function getEnv(key: RequiredKey): string {
  const value = process.env[key];
  if (!value || value.trim().length === 0) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export function getOptionalEnv(key: string): string | undefined {
  const value = process.env[key];
  if (!value || value.trim().length === 0) {
    return undefined;
  }
  return value;
}

export function getAiProvider(): "gemini" | "nim" {
  const provider = getOptionalEnv("AI_PROVIDER")?.toLowerCase() ?? "gemini";
  if (provider !== "gemini" && provider !== "nim") {
    throw new Error('AI_PROVIDER must be either "gemini" or "nim".');
  }
  return provider;
}
