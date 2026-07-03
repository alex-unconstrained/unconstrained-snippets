export type Segment =
  | { type: "text"; text: string }
  | { type: "bold"; text: string }
  | { type: "placeholder"; hint: string; index: number };

export type LineType = "h1" | "h2" | "h3" | "bullet" | "numbered" | "text" | "blank";

export interface PromptLine {
  type: LineType;
  marker?: string;
  segments: Segment[];
}

const PLACEHOLDER_RE = /\{\{([^}]+)\}\}/g;
const INLINE_RE = /(\{\{[^}]+\}\}|\*\*[^*]+\*\*)/g;

function parseInline(text: string, nextIndex: { value: number }): Segment[] {
  const segments: Segment[] = [];
  for (const part of text.split(INLINE_RE)) {
    if (part === "") continue;
    if (part.startsWith("{{") && part.endsWith("}}")) {
      segments.push({
        type: "placeholder",
        hint: part.slice(2, -2),
        index: nextIndex.value++,
      });
    } else if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
      segments.push({ type: "bold", text: part.slice(2, -2) });
    } else {
      segments.push({ type: "text", text: part });
    }
  }
  return segments;
}

export function parsePrompt(code: string): {
  lines: PromptLine[];
  placeholderCount: number;
} {
  const nextIndex = { value: 0 };
  const lines = code.split("\n").map((line): PromptLine => {
    if (line.trim() === "") return { type: "blank", segments: [] };

    const header = line.match(/^(#{1,3}) (.*)$/);
    if (header) {
      const type = (["h1", "h2", "h3"] as const)[header[1].length - 1];
      return { type, segments: parseInline(header[2], nextIndex) };
    }

    const bullet = line.match(/^[-*] (.*)$/);
    if (bullet) return { type: "bullet", segments: parseInline(bullet[1], nextIndex) };

    const numbered = line.match(/^(\d+[.)]) (.*)$/);
    if (numbered) {
      return {
        type: "numbered",
        marker: numbered[1],
        segments: parseInline(numbered[2], nextIndex),
      };
    }

    return { type: "text", segments: parseInline(line, nextIndex) };
  });

  return { lines, placeholderCount: nextIndex.value };
}

export function composePrompt(code: string, values: string[]): string {
  let i = 0;
  return code.replace(PLACEHOLDER_RE, (match) => {
    const value = values[i++];
    return value && value.trim() !== "" ? value : match;
  });
}
