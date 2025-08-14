import hitesh from '@/data/personas/hitesh.json';
import piyush from '@/data/personas/piyush.json';

export type FewShotPair = {
  user: string;
  assistant: string;
};

export type PersonaData = {
  id: 'hitesh' | 'piyush';
  displayName: string;
  tone: {
    language: string;
    style: string[];
    catchphrases: string[];
  };
  defaults: {
    stack: string[];
    tools: string[];
    deployment: string[];
  };
  guidelines: string[];
  fewShots: FewShotPair[];
  sources: { label: string; url: string }[];
};

export function getAllPersonas(): PersonaData[] {
  return [hitesh as PersonaData, piyush as PersonaData];
}

export function getPersonaById(id: PersonaData['id']): PersonaData {
  const persona = getAllPersonas().find((p) => p.id === id);
  return persona ?? (hitesh as PersonaData);
}

export function buildSystemPrompt(persona: PersonaData): string {
  const intro = `You are ${persona.displayName}. Reply in the same tone consistently. If a fact is uncertain, say so. Avoid fabricating metrics or claims.`;

  const tone = `Tone: ${persona.tone.style.join(', ')}. Language: ${persona.tone.language}. Catchphrases you may occasionally use: ${persona.tone.catchphrases
    .map((c) => '"' + c + '"')
    .join(', ')}.`;

  const defaults = `Preferred defaults -> Stack: ${persona.defaults.stack.join(', ')}; Tools: ${persona.defaults.tools.join(', ')}; Deployment: ${persona.defaults.deployment.join(', ')}.`;

  const guidelines = `Guidelines:\n- ${persona.guidelines.join('\n- ')}`;

  const structure = `Always structure your reply as:\n1) One-line summary\n2) Steps or minimal runnable snippet\n3) 1-3 practical tips/pitfalls\n4) A tiny action task\n5) Optional reference link (if relevant)\n\nImportant: Do not prefix your response with your name or any labels like "Summary:", "Steps:", "Tips:", "Action:", or "Ref:". Write the content directly (plain sentence for the summary, then bullets or concise lines).`;

  const fewShots = persona.fewShots
    .slice(0, 2)
    .map((pair, idx) => `Example ${idx + 1}:\nUser: ${pair.user}\nAssistant: ${pair.assistant}`)
    .join('\n\n');

  const sources = persona.sources
    .map((s) => `- ${s.label}: ${s.url}`)
    .join('\n');

  return [
    `Persona: ${persona.displayName}`,
    intro,
    tone,
    defaults,
    guidelines,
    structure,
    'Style examples to imitate:',
    fewShots,
    'Reference profiles (for tone, not facts):',
    sources,
  ].join('\n\n');
}
