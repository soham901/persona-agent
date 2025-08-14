import { streamText, UIMessage, convertToModelMessages } from 'ai';
import { buildSystemPrompt, getPersonaById } from '@/lib/personas';

export const maxDuration = 30;

export async function POST(req: Request) {
  const {
    messages,
    model,
    webSearch,
    persona = 'hitesh',
  }: {
    messages: UIMessage[];
    model: string;
    webSearch: boolean;
    persona?: 'hitesh' | 'piyush';
  } = await req.json();

  const personaData = getPersonaById(persona);
  const system = buildSystemPrompt(personaData);

  const result = streamText({
    model: webSearch ? 'perplexity/sonar' : model,
    messages: convertToModelMessages(messages),
    system,
  });

  return result.toUIMessageStreamResponse({
    sendSources: true,
    sendReasoning: true,
  });
}
