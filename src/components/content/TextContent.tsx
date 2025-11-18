// Component for displaying text-only content

import type { TextContent as TextContentType } from "../../types/calendar";

interface TextContentProps {
  content: TextContentType;
}

export default function TextContent({ content }: TextContentProps) {
  return (
    <div className="py-8 space-y-6">
      {/* Decorative quote mark */}
      <div className="text-6xl text-accent opacity-20 font-serif leading-none">
        "
      </div>

      <p className="text-xl md:text-2xl text-foreground leading-relaxed text-center font-serif italic px-4">
        {content.message}
      </p>

      {content.author && (
        <p className="text-right text-muted-foreground font-medium">
          — {content.author}
        </p>
      )}

      {/* Decorative element */}
      <div className="flex justify-center pt-4">
        <div className="w-16 h-1 bg-gradient-to-r from-transparent via-accent to-transparent rounded-full" />
      </div>
    </div>
  );
}
