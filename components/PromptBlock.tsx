"use client";

import { useState } from "react";

interface PromptBlockProps {
  code: string;
}

function renderPromptWithPlaceholders(code: string): React.ReactNode[] {
  const parts = code.split(/(\{\{[^}]+\}\})/g);
  return parts.map((part, i) => {
    if (part.startsWith("{{") && part.endsWith("}}")) {
      const text = part.slice(2, -2);
      return (
        <span
          key={i}
          className="inline bg-brand-500/15 border border-brand-500/40 text-brand-500 px-1.5 rounded"
        >
          {text}
        </span>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

export default function PromptBlock({ code }: PromptBlockProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div>
      <div className="rounded-lg border border-surface-700 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2.5 bg-surface-800 border-b border-surface-700">
          <span className="text-surface-500 text-xs uppercase tracking-widest">
            Prompt
          </span>
          <button
            onClick={handleCopy}
            className="bg-brand-500 hover:bg-brand-600 text-brand-950 px-4 py-1.5 rounded-md text-sm font-semibold tracking-wide transition-colors cursor-pointer"
          >
            {copied ? "Copied!" : "Copy Prompt"}
          </button>
        </div>
        <div className="p-5 overflow-x-auto bg-surface-950">
          <pre className="text-sm leading-relaxed font-mono whitespace-pre-wrap break-words text-surface-300">
            {renderPromptWithPlaceholders(code)}
          </pre>
        </div>
      </div>
      <div className="flex items-center gap-2 mt-3 px-4 py-3 bg-surface-800 rounded-lg border border-surface-700">
        <span className="inline-block w-3.5 h-3.5 rounded-sm bg-brand-500/15 border border-brand-500/40" />
        <span className="text-surface-400 text-sm">
          Highlighted sections should be replaced with your own content
        </span>
      </div>
    </div>
  );
}
