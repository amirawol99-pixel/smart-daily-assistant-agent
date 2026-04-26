# Smart Daily Assistant Agent

This project is an MVP agentic assistant that helps users organize daily tasks, prioritize them, and generate a simple action plan.

It works on:

- Web chatbot (Next.js on Vercel)
- Telegram bot (Telegram webhook)

## Features

- Accepts user messages from web UI and Telegram
- Uses one shared AI service for both channels
- Returns a structured response:
  - `goal`
  - `priority`
  - `steps`
  - `missingInformationQuestion`
  - `responseText`
- Basic agentic behavior:
  - understands user goal
  - breaks work into smaller steps
  - prioritizes tasks
  - asks follow-up question when needed

## Tech Stack

- Next.js (App Router, API routes)
- TypeScript
- Tailwind CSS
- Google Gemini API and/or NVIDIA NIM API
- Telegram Bot API
- Vercel deployment

## Architecture

- `src/lib/assistant.ts`
  - Shared assistant logic for all channels
  - Calls selected model provider (`gemini` or `nim`)
  - Normalizes output into one structured schema
- `src/app/api/chat/route.ts`
  - Web chatbot endpoint
- `src/app/api/telegram/webhook/route.ts`
  - Telegram webhook endpoint
- `src/app/api/telegram/set-webhook/route.ts`
  - Helper endpoint to register Telegram webhook
- `src/lib/telegram.ts`
  - Telegram send and webhook setup helpers

Both web and Telegram routes call the same `runAssistant()` function for consistency and reusability.

## Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Set real values in `.env.local`:

- `AI_PROVIDER` = `gemini` or `nim`
- `GEMINI_API_KEY`
- `NVIDIA_NIM_API_KEY`
- `TELEGRAM_BOT_TOKEN`
- `APP_BASE_URL` (your deployed Vercel URL)

## Security Notes

- Secrets are stored only in environment variables.
- No API keys are exposed in frontend code.
- AI and Telegram calls are done server-side in API routes/helpers.
- `.env*` is ignored by git via `.gitignore`.
- `.env.example` includes placeholders only (no real secrets).

## Local Development

Install dependencies and run:

```bash
npm install
npm run dev
```

Then open `http://localhost:3000`.

## Telegram Setup

1. Create bot with [@BotFather](https://t.me/BotFather).
2. Save bot token in `TELEGRAM_BOT_TOKEN`.
3. Deploy app to Vercel.
4. Set `APP_BASE_URL` in Vercel environment variables.
5. Register webhook once:

```bash
curl -X POST https://your-vercel-project-url.vercel.app/api/telegram/set-webhook
```

6. Message your bot in Telegram. Telegram messages are processed by `/api/telegram/webhook`.

## Deployment (Vercel)

1. Push code to GitHub.
2. Import repository to Vercel.
3. Add all environment variables in Vercel project settings.
4. Deploy.
5. Run `/api/telegram/set-webhook` once.

## Submission Checklist

- [ ] Public GitHub repository
- [ ] Vercel deployed web app link
- [ ] Telegram bot username
- [ ] Loom video link (max 5 minutes)
- [ ] No API keys or bot tokens in repository

## Loom Video (Suggested Script)

1. Show web chatbot working
2. Show Telegram bot working
3. Explain shared architecture (`runAssistant()` used by both)
4. Explain secure secret handling with env vars
5. Mention limitations and next improvements
