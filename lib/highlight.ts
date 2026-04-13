import { createHighlighter, type BundledLanguage } from "shiki";

const brandTheme = {
  name: "unconstrained",
  type: "dark" as const,
  settings: [
    { scope: ["keyword", "storage.type"], settings: { foreground: "#C5392C" } },
    { scope: ["entity.name.function", "support.function"], settings: { foreground: "#FBBC5E" } },
    { scope: ["string", "string.quoted"], settings: { foreground: "#2EC4B6" } },
    { scope: ["constant.numeric"], settings: { foreground: "#8B7FF0" } },
    { scope: ["comment", "punctuation.definition.comment"], settings: { foreground: "#3D4663", fontStyle: "italic" } },
    { scope: ["variable.other.object", "support.class"], settings: { foreground: "#F5A623" } },
    { scope: ["variable", "variable.other"], settings: { foreground: "#B4BDD1" } },
    { scope: ["punctuation", "meta.brace"], settings: { foreground: "#737F99" } },
    { scope: ["entity.name.type", "support.type"], settings: { foreground: "#FBBC5E" } },
  ],
  colors: {
    "editor.background": "#0A0B14",
    "editor.foreground": "#B4BDD1",
  },
};

let highlighterPromise: ReturnType<typeof createHighlighter> | null = null;

function getHighlighter() {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighter({
      themes: [brandTheme],
      langs: ["javascript"],
    });
  }
  return highlighterPromise;
}

export async function highlightCode(
  code: string,
  language: string
): Promise<string> {
  const highlighter = await getHighlighter();
  return highlighter.codeToHtml(code, {
    lang: language as BundledLanguage,
    theme: "unconstrained",
  });
}
