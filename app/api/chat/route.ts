import { buildSystemPrompt } from "@/lib/personas";
import { getPersonaById } from "@/lib/personas";
import { createOpenAI } from "@ai-sdk/openai";
import { streamText, tool } from "ai";
import { z } from "zod";
import { exa } from "exa-js";

const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const youtubeSearchTool = tool({
  description:
    "Find relevant YouTube videos and playlists, prioritizing the current persona's official channel",
  parameters: z.object({
    query: z
      .string()
      .min(1)
      .max(160)
      .describe("User's topic to search on YouTube"),
    maxResults: z
      .number()
      .min(1)
      .max(20)
      .default(10)
      .describe("Maximum number of results to return"),
  }),
  execute: async ({ query, maxResults }) => {
    type ExaContentResult = {
      title: string;
      url: string;
      text: string;
      publishedDate?: string | null;
    };
    type ExaSearchResult = {
      title: string;
      url: string;
      publishedDate?: string | null;
      author?: string | null;
    };

    async function fetchViaSearch(q: string, limit: number) {
      try {
        const { results } = (await exa.search(q, {
          numResults: Math.max(5, limit),
          includeDomains: ["youtube.com"],
          useAutoprompt: true,
        })) as { results: ExaSearchResult[] };
        return results;
      } catch {
        return [] as ExaSearchResult[];
      }
    }

    const results = await fetchViaSearch(query, maxResults);

    // Format results as bullet points with context
    const formattedResults = results
      .slice(0, maxResults)
      .map((result, index) => {
        // Extract video ID from URL
        const videoId = result.url.split("v=")[1]?.split("&")[0];
        const thumbnailUrl = videoId
          ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`
          : "";

        // Create context from title and author
        const context = result.author
          ? `${result.title} by ${result.author}`
          : result.title;

        return `- ${context}`;
      })
      .join("\n");

    return formattedResults;
  },
});

export async function POST(req: Request) {
  const {
    messages,
    model,
    webSearch,
    persona = "hitesh",
  }: {
    messages: UIMessage[];
    model: string;
    webSearch: boolean;
    persona?: "hitesh" | "piyush";
  } = await req.json();

  const personaData = getPersonaById(persona);
  const systemPrompt = buildSystemPrompt(personaData);

  const result = await streamText({
    model: openai(model),
    system: systemPrompt,
    messages: messages.map((message: UIMessage) => ({
      role: message.role === "user" ? "user" : "assistant",
      content: message.parts
        .map((part) => {
          if (part.type === "text") return part.text;
          return "";
        })
        .join(""),
    })),
    tools: {
      youtubeSearchTool,
    },
    maxSteps: 5,
    temperature: 0.7,
    topP: 0.9,
  });

  return result.toDataStreamResponse();
}

export type UIMessage = {
  id: string;
  role: "user" | "assistant";
  parts: Array<{ type: "text" } | { type: "source-url"; url: string }>;
};
