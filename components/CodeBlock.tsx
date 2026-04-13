"use client";

import { useState } from "react";

interface CodeBlockProps {
  html: string;
  rawCode: string;
  language: string;
}

export default function CodeBlock({ html, rawCode, language }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(rawCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="rounded-lg border border-surface-700 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2.5 bg-surface-800 border-b border-surface-700">
        <span className="text-surface-500 text-xs uppercase tracking-widest">
          {language}
        </span>
        <button
          onClick={handleCopy}
          className="bg-brand-500 hover:bg-brand-600 text-brand-950 px-4 py-1.5 rounded-md text-sm font-semibold tracking-wide transition-colors cursor-pointer"
        >
          {copied ? "Copied!" : "Copy Code"}
        </button>
      </div>
      <div
        className="p-5 overflow-x-auto text-sm leading-relaxed font-mono [&_pre]:!bg-transparent [&_code]:!bg-transparent"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}
