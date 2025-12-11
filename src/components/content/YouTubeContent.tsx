// Component for displaying YouTube video content

import type { YouTubeContent as YouTubeContentType } from "../../types/calendar";

interface YouTubeContentProps {
  content: YouTubeContentType;
}

export default function YouTubeContent({ content }: YouTubeContentProps) {
  // Build the YouTube embed URL from the video ID
  const embedUrl = `https://www.youtube.com/embed/${content.videoId}`;

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
      <div className="rounded-lg overflow-hidden aspect-video">
        <iframe
          src={embedUrl}
          width="100%"
          height="100%"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          loading="lazy"
          className="w-full h-full"
          title={content.title}
        />
      </div>
    </div>
  );
}
