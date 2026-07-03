import fs from "fs";
import path from "path";
import {
  parseJsonFile,
  validateCourseData,
  validateSnippetData,
  validateSnippetId,
  type VideoData,
} from "./validate";

export type DemoVideo = VideoData;

export interface Snippet {
  id: string;
  title: string;
  description?: string;
  language: string;
  course?: string;
  order?: number;
  code: string;
  /** Optional demo video of this prompt in action (from the demo-video tool). */
  video?: DemoVideo;
}

export interface Course {
  slug: string;
  title: string;
  description?: string;
}

const SNIPPETS_DIR = path.join(process.cwd(), "snippets");
const COURSES_DIR = path.join(process.cwd(), "courses");

export function getAllCourses(): Course[] {
  if (!fs.existsSync(COURSES_DIR)) return [];
  const files = fs.readdirSync(COURSES_DIR).filter((f) => f.endsWith(".json"));

  return files
    .map((file) => {
      const filename = `courses/${file}`;
      const raw = fs.readFileSync(path.join(COURSES_DIR, file), "utf-8");
      const data = validateCourseData(filename, parseJsonFile(filename, raw));
      return { slug: file.replace(/\.json$/, ""), ...data };
    })
    .sort((a, b) => a.title.localeCompare(b.title));
}

export function getCourseBySlug(slug: string): Course | undefined {
  return getAllCourses().find((c) => c.slug === slug);
}

export function getAllSnippets(): Snippet[] {
  const courseSlugs = new Set(getAllCourses().map((c) => c.slug));
  const files = fs.readdirSync(SNIPPETS_DIR).filter((f) => f.endsWith(".json"));

  return files.map((file) => {
    const filename = `snippets/${file}`;
    const id = file.replace(/\.json$/, "");
    validateSnippetId(filename, id);
    const raw = fs.readFileSync(path.join(SNIPPETS_DIR, file), "utf-8");
    const data = validateSnippetData(filename, parseJsonFile(filename, raw), courseSlugs);
    return { id, ...data };
  });
}

export function getSnippetById(id: string): Snippet | undefined {
  const filePath = path.join(SNIPPETS_DIR, `${id}.json`);
  if (!fs.existsSync(filePath)) return undefined;
  return getAllSnippets().find((s) => s.id === id);
}

export function sortSnippets(snippets: Snippet[]): Snippet[] {
  return [...snippets].sort((a, b) => {
    const ao = a.order ?? Number.POSITIVE_INFINITY;
    const bo = b.order ?? Number.POSITIVE_INFINITY;
    if (ao !== bo) return ao - bo;
    return a.title.localeCompare(b.title);
  });
}

export function groupSnippets(
  snippets: Snippet[],
  courses: Course[]
): { groups: { course: Course; snippets: Snippet[] }[]; general: Snippet[] } {
  const groups = courses
    .map((course) => ({
      course,
      snippets: sortSnippets(snippets.filter((s) => s.course === course.slug)),
    }))
    .filter((g) => g.snippets.length > 0);
  const general = sortSnippets(snippets.filter((s) => !s.course));
  return { groups, general };
}
