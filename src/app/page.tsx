"use client";

import { FormEvent, useState } from "react";

type AssistantResponse = {
  goal: string;
  priority: "high" | "medium" | "low";
  steps: string[];
  missingInformationQuestion: string | null;
  responseText: string;
};

export default function Home() {
  const [message, setMessage] = useState("");
  const [result, setResult] = useState<AssistantResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setResult(null);

    const trimmed = message.trim();
    if (!trimmed) {
      setError("Please enter your plan request.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed }),
      });
      const data = (await response.json()) as AssistantResponse | { error: string };

      if (!response.ok || "error" in data) {
        setError("error" in data ? data.error : "Something went wrong.");
        return;
      }

      setResult(data);
    } catch {
      setError("Network error while contacting assistant.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 text-slate-900">
      <section className="mx-auto w-full max-w-3xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
        <h1 className="text-2xl font-bold md:text-3xl">Smart Daily Assistant Agent</h1>
        <p className="mt-2 text-sm text-slate-600">
          Describe your day, and the assistant will identify your goal, prioritize tasks, and
          create a clear action plan.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-3">
          <label htmlFor="task-input" className="block text-sm font-medium">
            What do you need help with today?
          </label>
          <textarea
            id="task-input"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Example: I have 3 assignments, a gym session, and calls with two clients."
            className="min-h-32 w-full rounded-xl border border-slate-300 p-3 text-sm outline-none focus:border-slate-500"
          />
          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:opacity-60"
          >
            {loading ? "Planning..." : "Generate Plan"}
          </button>
        </form>

        {error && <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}

        {result && (
          <article className="mt-6 space-y-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-600">Goal</h2>
              <p className="mt-1 text-sm">{result.goal}</p>
            </div>
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-600">
                Priority
              </h2>
              <p className="mt-1 text-sm font-medium">{result.priority.toUpperCase()}</p>
            </div>
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-600">
                Action Plan
              </h2>
              <ol className="mt-1 list-decimal space-y-1 pl-5 text-sm">
                {result.steps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
            </div>
            {result.missingInformationQuestion && (
              <div>
                <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-600">
                  Follow-up Question
                </h2>
                <p className="mt-1 text-sm">{result.missingInformationQuestion}</p>
              </div>
            )}
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-600">
                Assistant Message
              </h2>
              <p className="mt-1 whitespace-pre-line text-sm">{result.responseText}</p>
            </div>
          </article>
        )}
      </section>
    </main>
  );
}
