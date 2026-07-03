import fs from "fs";
import path from "path";

export interface DemoVideo {
  /** URL of the demo MP4 (e.g. /videos/<id>.mp4 committed to /public). */
  url: string;
  poster?: string;
  aspect?: "16:9" | "9:16" | "1:1";
}

export interface Snippet {
  id: string;
  title: string;
  description?: string;
  language: string;
  code: string;
  /** Optional demo video of this prompt in action (from the demo-video tool). */
  video?: DemoVideo;
}

const SNIPPETS_DIR = path.join(process.cwd(), "snippets");

export function getAllSnippets(): Snippet[] {
  const files = fs.readdirSync(SNIPPETS_DIR).filter((f) => f.endsWith(".json"));

  return files.map((file) => {
    const raw = fs.readFileSync(path.join(SNIPPETS_DIR, file), "utf-8");
    const data = JSON.parse(raw);
    return {
      id: file.replace(/\.json$/, ""),
      title: data.title,
      description: data.description,
      language: data.language,
      code: data.code,
      video: data.video,
    };
  });
}

export function getSnippetById(id: string): Snippet | undefined {
  const filePath = path.join(SNIPPETS_DIR, `${id}.json`);
  if (!fs.existsSync(filePath)) return undefined;

  const raw = fs.readFileSync(filePath, "utf-8");
  const data = JSON.parse(raw);
  return {
    id,
    title: data.title,
    description: data.description,
    language: data.language,
    code: data.code,
    video: data.video,
  };
}
