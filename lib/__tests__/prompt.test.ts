import { describe, it, expect } from "vitest";
import { parsePrompt, composePrompt } from "../prompt";

describe("parsePrompt", () => {
  it("classifies line types", () => {
    const { lines } = parsePrompt(
      "# Big\n## Mid\n### Small\n- item\n* item2\n1. first\n\nplain"
    );
    expect(lines.map((l) => l.type)).toEqual([
      "h1", "h2", "h3", "bullet", "bullet", "numbered", "blank", "text",
    ]);
    expect(lines[5].marker).toBe("1.");
  });

  it("indexes placeholders globally across lines", () => {
    const { lines, placeholderCount } = parsePrompt("a {{one}}\nb {{two}}");
    expect(placeholderCount).toBe(2);
    const ph = lines.flatMap((l) => l.segments).filter((s) => s.type === "placeholder");
    expect(ph).toEqual([
      { type: "placeholder", hint: "one", index: 0 },
      { type: "placeholder", hint: "two", index: 1 },
    ]);
  });

  it("parses inline bold", () => {
    const { lines } = parsePrompt("say **hi** now");
    expect(lines[0].segments).toEqual([
      { type: "text", text: "say " },
      { type: "bold", text: "hi" },
      { type: "text", text: " now" },
    ]);
  });

  it("strips list/header markers from segments but keeps content", () => {
    const { lines } = parsePrompt("## What I Need\n- do {{thing}}");
    expect(lines[0].segments).toEqual([{ type: "text", text: "What I Need" }]);
    expect(lines[1].segments[0]).toEqual({ type: "text", text: "do " });
  });
});

describe("composePrompt", () => {
  const code = "Analyze {{your data}} for {{a goal}}.";

  it("keeps literal placeholders when values are blank", () => {
    expect(composePrompt(code, ["", "  "])).toBe(code);
  });

  it("substitutes filled values by position", () => {
    expect(composePrompt(code, ["sales CSV", ""])).toBe(
      "Analyze sales CSV for {{a goal}}."
    );
  });

  it("round-trips text with no placeholders", () => {
    expect(composePrompt("plain ## text", [])).toBe("plain ## text");
  });
});
