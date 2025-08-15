"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export type YTItem = {
  title: string;
  url: string;
  type: "video" | "playlist" | "channel" | "other";
  snippet?: string | null;
  publishedDate?: string | null;
};

function toEmbedUrl(url: string, type: YTItem["type"]): string | null {
  try {
    const u = new URL(url);
    const isYouTube = /(^|\.)youtube\.com$/i.test(u.hostname) || /(^|\.)youtu\.be$/i.test(u.hostname);
    if (!isYouTube) return null;

    // Video: youtube.com/watch?v=ID, youtube.com/shorts/ID, youtu.be/ID
    if (type === "video") {
      let id: string | null = null;
      if (u.hostname.includes("youtu.be")) {
        id = u.pathname.split("/").filter(Boolean)[0] ?? null;
      } else if (u.pathname.startsWith("/shorts/")) {
        id = u.pathname.split("/")[2] ?? null;
      } else {
        id = u.searchParams.get("v");
      }
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }

    // Playlist: youtube.com/playlist?list=PLID
    if (type === "playlist") {
      const list = u.searchParams.get("list");
      return list ? `https://www.youtube.com/embed/videoseries?list=${list}` : null;
    }

    // Channel: no direct embed; return channel url for linking
    if (type === "channel") return null;

    return null;
  } catch {
    return null;
  }
}

export function YouTubeEmbeds({
  className,
  items,
  limit = 6,
}: {
  className?: string;
  items: YTItem[] | undefined;
  limit?: number;
}) {
  if (!items || items.length === 0) return null;

  // Build a list of embeddable items only (videos/playlists)
  const embeds = items
    .map((it) => ({ ...it, embed: toEmbedUrl(it.url, it.type) }))
    .filter((it) => it.embed)
    .slice(0, limit) as Array<YTItem & { embed: string }>;

  if (embeds.length === 0) return null;

  return (
    <div className={cn("grid gap-4 sm:grid-cols-2", className)}>
      {embeds.map((it, idx) => (
        <div key={`yt-${idx}`} className="space-y-2">
          <div className="aspect-video w-full overflow-hidden rounded-md border bg-muted">
            <iframe
              className="h-full w-full"
              src={it.embed}
              title={it.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          </div>
          <div className="text-sm">
            <a
              href={it.url}
              target="_blank"
              rel="noreferrer"
              className="font-medium text-primary underline"
            >
              {it.title}
            </a>
            {it.snippet ? (
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{it.snippet}</p>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  );
}
