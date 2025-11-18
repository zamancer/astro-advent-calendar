// Component for displaying message with optional image

import type { MessageContent as MessageContentType } from "../../types/calendar";

interface MessageContentProps {
  content: MessageContentType;
}

export default function MessageContent({ content }: MessageContentProps) {
  return (
    <div className="space-y-6">
      <h3 className="text-3xl font-serif font-bold text-foreground text-center">
        {content.title}
      </h3>

      {content.imageUrl && (
        <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
          <img
            src={content.imageUrl || "/placeholder.svg"}
            alt={content.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <p className="text-lg text-foreground leading-relaxed text-center px-4">
        {content.message}
      </p>
    </div>
  );
}
