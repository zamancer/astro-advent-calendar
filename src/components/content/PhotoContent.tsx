// Component for displaying photo content

import type { PhotoContent as PhotoContentType } from "../../types/calendar";

interface PhotoContentProps {
  content: PhotoContentType;
}

export default function PhotoContent({ content }: PhotoContentProps) {
  return (
    <div className="space-y-4">
      <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
        <img
          src={content.imageUrl || "/placeholder.svg"}
          alt={content.alt}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.src = "/placeholder.svg";
          }}
        />
      </div>
      <p className="text-lg text-center text-foreground leading-relaxed">
        {content.caption}
      </p>
    </div>
  );
}
