import type { DemoVideo } from "@/lib/snippets";

const MAX_WIDTH: Record<NonNullable<DemoVideo["aspect"]>, string> = {
  "16:9": "",
  "9:16": "max-w-xs",
  "1:1": "max-w-md",
};

/** Embeds a demo video of the prompt in action (from the demo-video tool). */
export default function DemoVideoBlock({ url, poster, aspect = "16:9" }: DemoVideo) {
  return (
    <div className="mb-8">
      <span className="text-surface-500 text-xs uppercase tracking-widest">
        See it in action
      </span>
      <div
        className={`mt-3 rounded-lg overflow-hidden border border-surface-700 bg-surface-950 ${MAX_WIDTH[aspect]}`}
      >
        <video
          src={url}
          poster={poster}
          controls
          preload="metadata"
          className="w-full h-auto block"
        />
      </div>
    </div>
  );
}
