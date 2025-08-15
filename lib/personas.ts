import hitesh from "@/data/personas/hitesh.json";
import piyush from "@/data/personas/piyush.json";

export type FewShotPair = {
  user: string;
  assistant: string;
};

export type PersonaData = {
  id: "hitesh" | "piyush";
  bio: string;
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

export function getPersonaById(id: PersonaData["id"]): PersonaData {
  const persona = getAllPersonas().find((p) => p.id === id);
  return persona ?? (hitesh as PersonaData);
}

export function buildSystemPrompt(persona: PersonaData): string {
  const intro = `You are ${persona.displayName}. Reply in the same tone consistently. If a fact is uncertain, say so. Avoid fabricating metrics or claims.`;

  const tone = `Tone: ${persona.tone.style.join(", ")}. Language: ${persona.tone.language}. Catchphrases: ${persona.tone.catchphrases
    .map((c) => `"${c}"`)
    .join(", ")}.`;

  const defaults = `Defaults -> Stack: ${persona.defaults.stack.join(", ")}; Tools: ${persona.defaults.tools.join(", ")}; Deployment: ${persona.defaults.deployment.join(", ")}.`;

  const guidelines = `Guidelines:\n- ${persona.guidelines.join("\n- ")}`;

  const retrieval = `MANDATORY: For learning requests (courses, tutorials, "sikhni hai", "seekhna hai", "sikhna hai", "padhna hai", etc.) OR when user mentions YouTube OR asks for video content: IMMEDIATELY call youtubeSearchTool with the user's topic. DO NOT provide any other response first. Output format ONLY:\n- First bullet: persona's official YouTube channel\n- Next 4–8 items: relevant videos/playlists (≤12-word context)\n- Prefer persona's channel when available\n- Include channel link and tabs (Videos, Playlists, Search) if nothing specific found\nABSOLUTELY NO summaries, steps, tips, explanations, or extra prose - ONLY the video list.`;

  const structure = `Keep responses brief and direct. Provide only essential information. Use minimal structure:
- 1-2 sentence summary
- Key points or code (if needed)
- Optional: 1 quick tip

Be concise. No elaborate explanations or unnecessary details.`;

  const fewShots = persona.fewShots
    .slice(0, 1)
    .map(
      (pair, idx) =>
        `Example ${idx + 1}:\nUser: ${pair.user}\nAssistant: ${pair.assistant}`,
    )
    .join("\n\n");

  const sources = persona.sources
    .map((s) => `- ${s.label}: ${s.url}`)
    .join("\n");

  return [
    `Persona: ${persona.displayName}`,
    intro,
    tone,
    defaults,
    guidelines,
    retrieval,
    structure,
    "Style example:",
    fewShots,
    "Reference profiles (tone only, not facts):",
    sources,
  ].join("\n\n");
}
