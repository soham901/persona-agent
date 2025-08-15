"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";

export type YTItem = {
  title: string;
  url: string;
  type: "video" | "playlist" | "channel" | "other";
  snippet?: string | null;
  publishedDate?: string | null;
  duration?: string | null;
  viewCount?: string | null;
};

interface YouTubeEmbedsProps {
  className?: string;
  items: YTItem[] | undefined;
  limit?: number;
  columns?: 1 | 2 | 3 | 4;
  showSnippets?: boolean;
  loading?: boolean;
}

interface EmbeddableItem extends YTItem {
  embedUrl: string;
  videoId?: string;
}

// Enhanced URL parsing with better error handling
function toEmbedUrl(
  url: string,
  type: YTItem["type"],
): { embedUrl: string; videoId?: string } | null {
  try {
    const u = new URL(url);
    const isYouTube =
      /(^|\.)youtube\.com$/i.test(u.hostname) ||
      /(^|\.)youtu\.be$/i.test(u.hostname);

    if (!isYouTube) return null;

    // Video handling with improved ID extraction
    if (type === "video") {
      let videoId: string | null = null;

      if (u.hostname.includes("youtu.be")) {
        videoId = u.pathname.split("/").filter(Boolean)[0] ?? null;
      } else if (u.pathname.startsWith("/shorts/")) {
        videoId = u.pathname.split("/")[2] ?? null;
      } else if (u.pathname.startsWith("/embed/")) {
        videoId = u.pathname.split("/")[2] ?? null;
      } else {
        videoId = u.searchParams.get("v");
      }

      if (!videoId || videoId.length !== 11) return null;

      return {
        embedUrl: `https://www.youtube.com/embed/${videoId}`,
        videoId,
      };
    }

    // Playlist handling
    if (type === "playlist") {
      const listId = u.searchParams.get("list");
      if (!listId) return null;

      return {
        embedUrl: `https://www.youtube.com/embed/videoseries?list=${listId}`,
      };
    }

    return null;
  } catch (error) {
    console.warn("Failed to parse YouTube URL:", url, error);
    return null;
  }
}

// Improved thumbnail generation with multiple fallbacks
function getThumbnailUrl(
  videoId: string,
  quality: "maxres" | "hq" | "mq" | "sd" = "maxres",
): string {
  const qualityMap = {
    maxres: "maxresdefault",
    hq: "hqdefault",
    mq: "mqdefault",
    sd: "sddefault",
  };

  return `https://i.ytimg.com/vi/${videoId}/${qualityMap[quality]}.jpg`;
}

// Enhanced embed URL with better parameters
function createAutoplayEmbedUrl(embedUrl: string): string {
  try {
    const u = new URL(embedUrl);
    const params = new URLSearchParams({
      autoplay: "1",
      playsinline: "1",
      modestbranding: "1",
      rel: "0",
      controls: "1",
      enablejsapi: "1",
      origin: typeof window !== "undefined" ? window.location.origin : "",
    });

    // Preserve existing params
    u.searchParams.forEach((value, key) => {
      if (!params.has(key)) {
        params.set(key, value);
      }
    });

    u.search = params.toString();
    return u.toString();
  } catch {
    return `${embedUrl}${embedUrl.includes("?") ? "&" : "?"}autoplay=1&playsinline=1&modestbranding=1&rel=0&controls=1`;
  }
}

export function YouTubeEmbeds({
  className,
  items,
  limit = 6,
  columns = 2,
  showSnippets = true,
  loading = false,
}: YouTubeEmbedsProps) {
  // Show loading skeleton
  if (loading) {
    return (
      <div className={cn(`grid gap-4 sm:grid-cols-${columns}`, className)}>
        {Array.from({ length: Math.min(limit, 4) }).map((_, idx) => (
          <div key={`skeleton-${idx}`} className="space-y-2">
            <Skeleton className="aspect-video w-full rounded-md" />
            <Skeleton className="h-4 w-3/4" />
            {showSnippets && <Skeleton className="h-3 w-full" />}
          </div>
        ))}
      </div>
    );
  }

  if (!items || items.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No videos available</p>
      </div>
    );
  }

  // Process embeddable items with better error handling
  const embeds = items
    .map((item) => {
      const embedData = toEmbedUrl(item.url, item.type);
      return embedData ? { ...item, ...embedData } : null;
    })
    .filter((item): item is EmbeddableItem => !!item?.embedUrl)
    .slice(0, limit);

  if (embeds.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No embeddable videos found</p>
      </div>
    );
  }

  const gridClass = {
    1: "grid-cols-1",
    2: "grid gap-4 sm:grid-cols-2",
    3: "grid gap-4 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid gap-4 sm:grid-cols-2 lg:grid-cols-4",
  }[columns];

  return (
    <div
      className={cn(gridClass, className)}
      role="region"
      aria-label="YouTube videos"
    >
      {embeds.map((item, idx) => (
        <VideoCard
          key={`yt-${item.videoId || idx}`}
          item={item}
          showSnippet={showSnippets}
        />
      ))}
    </div>
  );
}

interface VideoCardProps {
  item: EmbeddableItem;
  showSnippet?: boolean;
}

function VideoCard({ item, showSnippet = true }: VideoCardProps) {
  const [thumbnailUrl, setThumbnailUrl] = React.useState<string | null>(
    item.videoId ? getThumbnailUrl(item.videoId, "maxres") : null,
  );
  const [thumbnailError, setThumbnailError] = React.useState(false);
  const [isOpen, setIsOpen] = React.useState(false);
  const [imageLoaded, setImageLoaded] = React.useState(false);

  // Enhanced thumbnail fallback logic
  React.useEffect(() => {
    if (!item.videoId || !thumbnailUrl) return;

    const img = new Image();
    img.crossOrigin = "anonymous";

    const handleLoad = () => {
      // Check if maxres is actually available (YouTube serves placeholder for unavailable maxres)
      if (img.naturalHeight < 200 && thumbnailUrl.includes("maxresdefault")) {
        setThumbnailUrl(getThumbnailUrl(item.videoId!, "hq"));
      } else {
        setImageLoaded(true);
      }
    };

    const handleError = () => {
      if (!thumbnailError) {
        setThumbnailError(true);
        if (thumbnailUrl.includes("maxresdefault")) {
          setThumbnailUrl(getThumbnailUrl(item.videoId!, "hq"));
        } else if (thumbnailUrl.includes("hqdefault")) {
          setThumbnailUrl(getThumbnailUrl(item.videoId!, "mq"));
        }
      }
    };

    img.onload = handleLoad;
    img.onerror = handleError;
    img.src = thumbnailUrl;

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [thumbnailUrl, thumbnailError, item.videoId]);

  const autoplayEmbedUrl = React.useMemo(
    () => createAutoplayEmbedUrl(item.embedUrl),
    [item.embedUrl],
  );

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setIsOpen(true);
    }
  };

  return (
    <article className="space-y-3 group">
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <div className="aspect-video w-full overflow-hidden rounded-lg border bg-muted/50 shadow-sm transition-shadow group-hover:shadow-md">
          <DialogTrigger asChild>
            <button
              type="button"
              className="relative h-full w-full focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-lg"
              aria-label={`Play video: ${item.title}`}
              onKeyDown={handleKeyDown}
            >
              {thumbnailUrl ? (
                <div className="relative h-full w-full">
                  {!imageLoaded && (
                    <Skeleton className="absolute inset-0 h-full w-full" />
                  )}
                  <img
                    src={thumbnailUrl || "/placeholder.svg"}
                    alt={`Thumbnail for ${item.title}`}
                    className={cn(
                      "h-full w-full object-cover transition-opacity duration-300",
                      imageLoaded ? "opacity-100" : "opacity-0",
                    )}
                    loading="lazy"
                    onLoad={() => setImageLoaded(true)}
                    onError={() => setThumbnailError(true)}
                  />
                </div>
              ) : (
                <div className="h-full w-full bg-muted flex items-center justify-center">
                  <div className="text-muted-foreground text-sm">
                    No thumbnail
                  </div>
                </div>
              )}

              {/* Play button overlay */}
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-100 transition-all duration-200 group-hover:bg-black/30">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/95 shadow-lg transition-transform duration-200 group-hover:scale-110 group-focus-within:scale-110">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="text-black ml-1"
                    aria-hidden="true"
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </div>

              {/* Duration badge if available */}
              {item.duration && (
                <div className="absolute bottom-2 right-2 rounded bg-black/80 px-2 py-1 text-xs text-white">
                  {item.duration}
                </div>
              )}
            </button>
          </DialogTrigger>
        </div>

        <DialogContent className="sm:max-w-4xl md:max-w-6xl p-0 overflow-hidden">
          <div className="aspect-video w-full bg-black">
            {isOpen && (
              <iframe
                className="h-full w-full"
                src={autoplayEmbedUrl}
                title={item.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
                loading="lazy"
              />
            )}
          </div>
          <div className="p-6 space-y-2">
            <h3 className="font-semibold text-lg leading-tight">
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline focus:underline focus:outline-none"
              >
                {item.title}
              </a>
            </h3>
            {item.snippet && (
              <p className="text-sm text-muted-foreground leading-relaxed">
                {item.snippet}
              </p>
            )}
            {(item.viewCount || item.publishedDate) && (
              <div className="flex gap-4 text-xs text-muted-foreground">
                {item.viewCount && <span>{item.viewCount} views</span>}
                {item.publishedDate && <span>{item.publishedDate}</span>}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Video info below thumbnail */}
      <div className="space-y-2">
        <h3 className="font-medium text-sm leading-tight">
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline focus:underline focus:outline-none line-clamp-2"
          >
            {item.title}
          </a>
        </h3>

        {showSnippet && item.snippet && (
          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
            {item.snippet}
          </p>
        )}

        {(item.viewCount || item.publishedDate) && (
          <div className="flex gap-3 text-xs text-muted-foreground">
            {item.viewCount && <span>{item.viewCount} views</span>}
            {item.publishedDate && <span>{item.publishedDate}</span>}
          </div>
        )}
      </div>
    </article>
  );
}
