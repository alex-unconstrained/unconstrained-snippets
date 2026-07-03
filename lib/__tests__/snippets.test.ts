import { describe, it, expect } from "vitest";
import { sortSnippets, groupSnippets, type Snippet, type Course } from "../snippets";

function snip(over: Partial<Snippet>): Snippet {
  return { id: "x", title: "X", language: "prompt", code: "", ...over };
}

describe("sortSnippets", () => {
  it("orders by order asc, unordered after ordered alphabetically", () => {
    const s = [
      snip({ id: "b", title: "Bravo" }),
      snip({ id: "a", title: "Alpha" }),
      snip({ id: "c", title: "Charlie", order: 2 }),
      snip({ id: "d", title: "Delta", order: 1 }),
    ];
    expect(sortSnippets(s).map((x) => x.id)).toEqual(["d", "c", "a", "b"]);
  });
});

describe("groupSnippets", () => {
  const courses: Course[] = [
    { slug: "ai-101", title: "AI 101" },
    { slug: "empty", title: "Empty Course" },
  ];

  it("groups by course, general holds course-less snippets, empty courses omitted", () => {
    const s = [
      snip({ id: "a", course: "ai-101", order: 1 }),
      snip({ id: "b" }),
      snip({ id: "c", course: "ai-101", order: 2 }),
    ];
    const { groups, general } = groupSnippets(s, courses);
    expect(groups).toHaveLength(1);
    expect(groups[0].course.slug).toBe("ai-101");
    expect(groups[0].snippets.map((x) => x.id)).toEqual(["a", "c"]);
    expect(general.map((x) => x.id)).toEqual(["b"]);
  });
});
