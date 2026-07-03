"use client";

import { useMemo, useState } from "react";
import { composePrompt, parsePrompt, type PromptLine, type Segment } from "@/lib/prompt";

const MAX_OPEN_IN_URL = 8000;

const LINE_CLASSES: Record<PromptLine["type"], string> = {
  h1: "font-heading text-xl text-white tracking-wide mt-4 mb-1",
  h2: "font-heading text-lg text-white tracking-wide mt-4 mb-1",
  h3: "font-heading text-base text-surface-200 tracking-wide mt-3 mb-1",
  bullet:
    "pl-5 relative before:content-['•'] before:absolute before:left-1 before:text-surface-500",
  numbered: "pl-5 relative",
  text: "",
  blank: "h-4",
};

export default function PromptBlock({ code }: { code: string }) {
  const { lines, placeholderCount } = useMemo(() => parsePrompt(code), [code]);
  const [values, setValues] = useState<string[]>(() =>
    Array(placeholderCount).fill("")
  );
  const [copied, setCopied] = useState(false);

  const blanksLeft = values.filter((v) => v.trim() === "").length;
  const composed = composePrompt(code, values);

  function setValue(index: number, value: string) {
    setValues((prev) => prev.map((v, i) => (i === index ? value : v)));
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(composed);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const encoded = encodeURIComponent(composed);
  const tooLong = encoded.length > MAX_OPEN_IN_URL;

  function renderSegment(seg: Segment, key: number) {
    if (seg.type === "bold") {
      return (
        <strong key={key} className="font-semibold text-surface-100">
          {seg.text}
        </strong>
      );
    }
    if (seg.type === "placeholder") {
      const value = values[seg.index] ?? "";
      const width = Math.min(Math.max(seg.hint.length, value.length, 6) + 1, 60);
      return (
        <input
          key={key}
          type="text"
          value={value}
          onChange={(e) => setValue(seg.index, e.target.value)}
          placeholder={seg.hint}
          aria-label={seg.hint}
          style={{ width: `${width}ch` }}
          className="inline-block max-w-full align-baseline bg-brand-500/15 border border-brand-500/40 text-brand-400 placeholder:text-brand-500/70 px-1.5 py-0.5 rounded text-sm font-mono focus:outline-none focus:border-brand-500 focus:bg-brand-500/25 transition-colors"
        />
      );
    }
    return <span key={key}>{seg.text}</span>;
  }

  return (
    <div>
      <div className="rounded-lg border border-surface-700 overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 bg-surface-800 border-b border-surface-700">
          <span className="text-surface-500 text-xs uppercase tracking-widest">
            Prompt
          </span>
          <div className="flex items-center gap-3">
            {placeholderCount > 0 && blanksLeft > 0 && (
              <span className="text-surface-500 text-xs">
                {blanksLeft} blank{blanksLeft === 1 ? "" : "s"} left
              </span>
            )}
            <button
              onClick={handleCopy}
              className="bg-brand-500 hover:bg-brand-600 text-brand-950 px-4 py-2 rounded-md text-sm font-semibold tracking-wide transition-colors cursor-pointer"
            >
              {copied ? "Copied!" : "Copy Prompt"}
            </button>
          </div>
        </div>
        <div className="p-5 bg-surface-950 font-mono text-sm leading-relaxed text-surface-300">
          {lines.map((line, i) => (
            <div key={i} className={LINE_CLASSES[line.type]}>
              {line.type === "numbered" && (
                <span className="absolute left-0 text-surface-500">{line.marker}</span>
              )}
              {line.segments.map(renderSegment)}
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 mt-3">
        <OpenIn name="Claude" href={`https://claude.ai/new?q=${encoded}`} disabled={tooLong} />
        <OpenIn name="ChatGPT" href={`https://chatgpt.com/?q=${encoded}`} disabled={tooLong} />
        {tooLong && (
          <span className="text-surface-500 text-xs">
            Prompt too long for a link — use Copy instead
          </span>
        )}
      </div>

      {placeholderCount > 0 && (
        <div className="flex items-center gap-2 mt-3 px-4 py-3 bg-surface-800 rounded-lg border border-surface-700">
          <span className="inline-block w-3.5 h-3.5 rounded-sm bg-brand-500/15 border border-brand-500/40 shrink-0" />
          <span className="text-surface-400 text-sm">
            Fill in the highlighted fields, then copy — unfilled fields are copied as-is
          </span>
        </div>
      )}
    </div>
  );
}

function OpenIn({ name, href, disabled }: { name: string; href: string; disabled: boolean }) {
  if (disabled) {
    return (
      <span className="px-4 py-2 rounded-md text-sm border border-surface-700 text-surface-600 cursor-not-allowed">
        Open in {name}
      </span>
    );
  }
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="px-4 py-2 rounded-md text-sm border border-surface-700 text-surface-300 hover:border-brand-500/50 hover:text-white transition-colors"
    >
      Open in {name}
    </a>
  );
}
