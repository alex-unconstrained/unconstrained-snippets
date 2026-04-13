import Link from "next/link";
import type { Snippet } from "@/lib/snippets";

export default function SnippetCard({ snippet }: { snippet: Snippet }) {
  return (
    <Link
      href={`/${snippet.id}`}
      className="block p-5 rounded-lg border border-surface-700 bg-surface-800 hover:border-brand-500/50 transition-colors"
    >
      <h2 className="font-heading text-lg text-white tracking-wide mb-1">
        {snippet.title.toUpperCase()}
      </h2>
      {snippet.description && (
        <p className="text-surface-400 text-sm line-clamp-2">
          {snippet.description}
        </p>
      )}
      <span className="inline-block mt-3 text-xs text-surface-500 uppercase tracking-widest">
        {snippet.language}
      </span>
    </Link>
  );
}
