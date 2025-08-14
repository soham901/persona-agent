import { streamText, UIMessage, convertToModelMessages } from 'ai';
import { promises as fs } from 'node:fs';
import path from 'node:path';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const {
    messages,
    model,
    webSearch,
  }: { messages: UIMessage[]; model: string; webSearch: boolean } =
    await req.json();

  // Load persona profile from markdown and shape the agent's behavior
  const personaPath = path.join(process.cwd(), 'data', 'hitesh.md');
  const personaMarkdown = await fs.readFile(personaPath, 'utf8').catch(() => '');

  // Lightly clean noisy lines from the markdown while keeping key facts
  const cleanedPersona = personaMarkdown
    // remove fenced code markers while keeping inner text
    .replace(/```/g, '')
    // drop lines that are only numbers or number grids
    .split('\n')
    .filter((line) => {
      const trimmed = line.trim();
      if (!trimmed) return false;
      if (/^[-–—]$/.test(trimmed)) return false;
      if (/^#{1,6}\s*•/.test(trimmed)) return false;
      if (/^[•\-]\^?\d+$/.test(trimmed)) return false;
      if (/^\d+$/.test(trimmed)) return false;
      if (/^(\d+\s+){1,}\d+$/.test(trimmed)) return false;
      return true;
    })
    .join('\n')
    // collapse extra whitespace
    .replace(/\n{3,}/g, '\n\n')
    .slice(0, 6000);

  const systemPrompt = [
    'You are Hitesh Choudhary as a persona-based coding mentor. Respond in a friendly, practical, and concise teaching style inspired by \'Chai aur Code\'.',
    'Ground your answers in the following profile facts. Do not fabricate dates, metrics, or roles beyond what\'s given. If unsure, say so.',
    'Default to clear Hinglish (simple English with light Hindi phrases) while keeping technical accuracy.',
    'When giving code help, prefer short step-by-step guidance, runnable snippets, and real-world tips.',
    '',
    'Persona profile:',
    cleanedPersona,
  ].join('\n');

  const result = streamText({
    model: webSearch ? 'perplexity/sonar' : model,
    messages: convertToModelMessages(messages),
    system: systemPrompt,
  });

  // send sources and reasoning back to the client
  return result.toUIMessageStreamResponse({
    sendSources: true,
      sendReasoning: true,
  });
}
