import {
  streamText,
  UIMessage,
  convertToModelMessages,
  tool,
  stepCountIs,
} from "ai";
import { buildSystemPrompt, getPersonaById } from "@/lib/personas";
import Exa from "exa-js";
import { z } from "zod";

export const maxDuration = 30;

const exa = new Exa(process.env.EXA_API_KEY);

const webSearchTool = tool({
  description: "Search the web for up-to-date information",
  inputSchema: z.object({
    query: z.string().min(1).max(100).describe("The search query"),
  }),
  execute: async ({ query }) => {
    const { results } = await exa.searchAndContents(query, {
      livecrawl: "always",
      numResults: 3,
    });
    return results.map((result) => ({
      title: result.title,
      url: result.url,
      content: result.text.slice(0, 1000), // take just the first 1000 characters
      publishedDate: result.publishedDate,
    }));
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
  const system = buildSystemPrompt(personaData);

  // YouTube-first search tool prioritized for the current persona's official channel
  const youtubeSearchTool = tool({
    description:
      "Find relevant YouTube videos and playlists, prioritizing the current persona's official channel. Returns channel link first, then curated items.",
    inputSchema: z.object({
      query: z
        .string()
        .min(1)
        .max(160)
        .describe("User's topic to search on YouTube"),
      maxResults: z
        .number()
        .int()
        .min(1)
        .max(15)
        .default(8)
        .describe("Maximum number of items to return"),
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
      };
      const youtubeSource = personaData.sources.find((s) =>
        s.label.toLowerCase().includes("youtube"),
      );

      const channelUrl = youtubeSource?.url;
      const channelHandle = channelUrl?.includes("/@")
        ? `@${channelUrl.split("/@")[1]}`
        : undefined;

      const queries: string[] = [];
      // 1) Persona channel focused
      if (channelHandle) {
        queries.push(
          `${query} ${channelHandle} playlist OR video site:youtube.com`,
        );
      }
      if (channelUrl) {
        queries.push(
          `${query} ${channelUrl} playlist OR video site:youtube.com`,
        );
      }
      // 2) General YouTube as fallback
      queries.push(`${query} playlist OR video site:youtube.com`);

      const seen = new Set<string>();
      const items: Array<{
        title: string;
        url: string;
        type: "video" | "playlist" | "channel" | "other";
        snippet?: string;
        publishedDate?: string | null;
      }> = [];

      // If EXA key is missing, short-circuit to only channel link with a note
      if (!process.env.EXA_API_KEY) {
        return {
          channel: channelUrl ?? null,
          items: channelUrl
            ? [
                {
                  title: `${personaData.displayName} — Official YouTube Channel`,
                  url: channelUrl,
                  type: "channel" as const,
                  snippet: undefined,
                  publishedDate: null,
                },
              ]
            : [],
          note: "EXA_API_KEY is not set. Set it to enable YouTube search results beyond the channel link.",
        };
      }

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

      for (const q of queries) {
        // Try lightweight search first for better reliability on YouTube
        const resultsA = await fetchViaSearch(q, maxResults);
        // If still light, try search+contents as a secondary attempt
        let resultsB: ExaContentResult[] = [];
        if (resultsA.length < Math.max(3, Math.floor(maxResults / 2))) {
          try {
            const resp = (await exa.searchAndContents(q, {
              livecrawl: "always",
              numResults: Math.max(5, maxResults),
            })) as { results: ExaContentResult[] };
            resultsB = resp.results;
          } catch {
            resultsB = [];
          }
        }

        const merged: Array<{
          title: string;
          url: string;
          text?: string;
          publishedDate?: string | null;
        }> = [
          ...resultsA.map((r) => ({
            title: r.title,
            url: r.url,
            publishedDate: r.publishedDate ?? null,
          })),
          ...resultsB,
        ];

        for (const r of merged) {
          const url = r.url;
          if (seen.has(url)) continue;
          if (!/youtube\.com\//i.test(url)) continue;
          let type: "video" | "playlist" | "channel" | "other" = "other";
          if (/\/watch\?v=/.test(url) || /shorts\//.test(url)) type = "video";
          else if (/\/playlist\?list=/.test(url)) type = "playlist";
          else if (
            /youtube\.com\/@/.test(url) ||
            /youtube\.com\/channel\//.test(url)
          )
            type = "channel";

          // Prefer persona channel matches by boosting them to the front
          const isPersonaChannelHit = channelHandle
            ? url.includes(channelHandle)
            : channelUrl
              ? url.includes(channelUrl)
              : false;

          const item = {
            title: r.title,
            url,
            type,
            snippet: ("text" in r && r.text ? r.text : "").slice(0, 220),
            publishedDate: r.publishedDate ?? null,
          };

          if (isPersonaChannelHit) {
            items.unshift(item);
          } else {
            items.push(item);
          }
          seen.add(url);
          if (items.length >= maxResults) break;
        }
        if (items.length >= maxResults) break;
      }

      // Always surface the official channel link first if known
      const channelEntry = channelUrl
        ? [
            {
              title: `${personaData.displayName} — Official YouTube Channel`,
              url: channelUrl,
              type: "channel" as const,
              snippet: undefined,
              publishedDate: null,
            },
          ]
        : [];

      // De-duplicate if the channel already appears in items
      const filteredItems = items.filter((it) => it.url !== channelUrl);

      // If still empty, add helpful fallbacks for quick navigation
      if (filteredItems.length === 0 && channelUrl) {
        const base = channelUrl.replace(/\/$/, "");
        const handleOrPath = channelHandle
          ? channelHandle.replace(/^@/, "")
          : undefined;
        const channelBase = base.includes("/@")
          ? base
          : handleOrPath
            ? `https://www.youtube.com/@${handleOrPath}`
            : base;

        filteredItems.push(
          {
            title: "Videos tab",
            url: `${channelBase}/videos`,
            type: "other",
            snippet: undefined,
            publishedDate: null,
          },
          {
            title: "Playlists tab",
            url: `${channelBase}/playlists`,
            type: "other",
            snippet: undefined,
            publishedDate: null,
          },
          {
            title: `Search on channel: ${query}`,
            url: `${channelBase}/search?query=${encodeURIComponent(query)}`,
            type: "other",
            snippet: undefined,
            publishedDate: null,
          },
        );
      }

      return {
        channel: channelUrl ?? null,
        items: [...channelEntry, ...filteredItems].slice(0, maxResults),
        note:
          filteredItems.length === 0
            ? "No specific videos/playlists found via search. Showing the channel. Try a broader or different topic keyword."
            : undefined,
      };
    },
  });

  const result = streamText({
    model: webSearch ? "perplexity/sonar" : model,
    messages: convertToModelMessages(messages),
    system,
    tools: {
      webSearchTool,
      youtubeSearchTool,
    },
    stopWhen: stepCountIs(5),
  });

  return result.toUIMessageStreamResponse({
    sendSources: true,
    sendReasoning: true,
  });
}
