// Component for displaying Spotify embed content

import type { SpotifyContent as SpotifyContentType } from "../../types/calendar";

interface SpotifyContentProps {
  content: SpotifyContentType;
}

export default function SpotifyContent({ content }: SpotifyContentProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-2xl font-serif font-bold text-foreground text-center">
        {content.title}
      </h3>
      {content.description && (
        <p className="text-muted-foreground text-center leading-relaxed">
          {content.description}
        </p>
      )}
      <div className="rounded-lg overflow-hidden">
        <iframe
          src={content.embedUrl}
          width="100%"
          height="352"
          frameBorder="0"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
          className="w-full"
        />
      </div>
    </div>
  );
}
