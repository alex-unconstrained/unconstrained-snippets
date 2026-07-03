import { describe, it, expect } from "vitest";
import {
  validateSnippetData,
  validateCourseData,
  validateSnippetId,
  parseJsonFile,
} from "../validate";

const COURSES = new Set(["ai-foundations"]);

const valid = {
  title: "T",
  language: "prompt",
  code: "hello",
};

describe("validateSnippetData", () => {
  it("accepts a minimal valid snippet", () => {
    expect(validateSnippetData("snippets/a.json", valid, COURSES)).toEqual(valid);
  });

  it("accepts all optional fields", () => {
    const full = { ...valid, description: "d", course: "ai-foundations", order: 2 };
    expect(validateSnippetData("snippets/a.json", full, COURSES)).toEqual(full);
  });

  it("rejects missing required field with filename and field name", () => {
    const noTitle = { language: valid.language, code: valid.code };
    expect(() => validateSnippetData("snippets/a.json", noTitle, COURSES)).toThrow(
      'snippets/a.json: missing required field "title"'
    );
  });

  it("rejects wrong-typed field", () => {
    expect(() =>
      validateSnippetData("snippets/a.json", { ...valid, order: "1" }, COURSES)
    ).toThrow('snippets/a.json: field "order" must be a number');
  });

  it("rejects unknown course", () => {
    expect(() =>
      validateSnippetData("snippets/a.json", { ...valid, course: "nope" }, COURSES)
    ).toThrow('snippets/a.json: course "nope" has no matching file in /courses/');
  });

  it("accepts a valid video field", () => {
    const withVideo = {
      ...valid,
      video: { url: "/videos/a.mp4", poster: "/p.png", aspect: "16:9" },
    };
    expect(validateSnippetData("snippets/a.json", withVideo, COURSES)).toEqual(withVideo);
  });

  it("rejects video without url", () => {
    expect(() =>
      validateSnippetData("snippets/a.json", { ...valid, video: {} }, COURSES)
    ).toThrow('snippets/a.json: missing required field "video.url"');
  });

  it("rejects invalid video aspect", () => {
    expect(() =>
      validateSnippetData(
        "snippets/a.json",
        { ...valid, video: { url: "/v.mp4", aspect: "4:3" } },
        COURSES
      )
    ).toThrow('snippets/a.json: field "video.aspect" must be one of 16:9, 9:16, 1:1');
  });

  it("rejects non-object data", () => {
    expect(() => validateSnippetData("snippets/a.json", [], COURSES)).toThrow(
      "snippets/a.json: must be a JSON object"
    );
  });
});

describe("validateCourseData", () => {
  it("accepts valid course", () => {
    expect(validateCourseData("courses/c.json", { title: "C" })).toEqual({ title: "C" });
  });

  it("rejects missing title", () => {
    expect(() => validateCourseData("courses/c.json", {})).toThrow(
      'courses/c.json: missing required field "title"'
    );
  });
});

describe("validateSnippetId", () => {
  it("rejects reserved id 'courses'", () => {
    expect(() => validateSnippetId("snippets/courses.json", "courses")).toThrow(
      'snippets/courses.json: "courses" is a reserved name'
    );
  });

  it("accepts normal ids", () => {
    expect(() => validateSnippetId("snippets/a.json", "a")).not.toThrow();
  });
});

describe("parseJsonFile", () => {
  it("reports filename on malformed JSON", () => {
    expect(() => parseJsonFile("snippets/bad.json", "{oops")).toThrow(
      /snippets\/bad\.json: invalid JSON/
    );
  });
});
