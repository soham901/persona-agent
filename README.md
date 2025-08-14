## Persona Agent – Hitesh Choudhary & Piyush Garg

A Next.js website that uses an LLM to mimic the tones of Hitesh Choudhary and Piyush Garg based on their public content styles (YouTube/Twitter). It includes data prep, prompt logic, and sample chats for both personas.

### Demo

- Chat: `/` (switch personas via the selector in the input toolbar)
- Showcase: `/showcase` (data prep, prompt logic, sample chats)

### Setup

1) Install deps

```bash
pnpm install
```

2) Environment variables (choose what you need):

- `OPENAI_API_KEY` for `openai/gpt-4o`
- `DEEPSEEK_API_KEY` for `deepseek/deepseek-r1`
- `PERPLEXITY_API_KEY` if using web search toggle (optional)

Add to `.env.local`:

```bash
OPENAI_API_KEY=sk-...
# Optional
DEEPSEEK_API_KEY=...
PERPLEXITY_API_KEY=...
```

3) Run locally

```bash
pnpm dev
```

Open `http://localhost:3000`.

### Data Prep

Curated tone datasets live in `data/personas/`:

- `data/personas/hitesh.json`
- `data/personas/piyush.json`

Each contains:

- tone: language, style keywords, catchphrases
- defaults: stack/tools/deployment preferences
- guidelines: behavior guardrails (no fabrication, clarity, structure)
- fewShots: 1–2 example Q&A pairs reflecting tone
- sources: public links (for tone reference only)

### Prompt Logic

`lib/personas.ts` builds a consistent system prompt from the datasets via `buildSystemPrompt(persona)`. The API route (`app/api/chat/route.ts`) accepts a `persona` field and injects the generated prompt per request.

### UX

- Smooth persona switching next to the model selector.
- Optional web search toggle.
- Clear response structure and expandable reasoning/sources in the UI.

### Notes

- The personas emulate tone and structure. They do not claim private or unverified facts. If uncertain, the model is instructed to say so.
