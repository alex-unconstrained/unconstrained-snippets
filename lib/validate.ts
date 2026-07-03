export interface VideoData {
  url: string;
  poster?: string;
  aspect?: "16:9" | "9:16" | "1:1";
}

export interface SnippetData {
  title: string;
  description?: string;
  language: string;
  course?: string;
  order?: number;
  code: string;
  video?: VideoData;
}

export interface CourseData {
  title: string;
  description?: string;
}

const RESERVED_IDS = new Set(["courses"]);

function asObject(filename: string, data: unknown): Record<string, unknown> {
  if (typeof data !== "object" || data === null || Array.isArray(data)) {
    throw new Error(`${filename}: must be a JSON object`);
  }
  return data as Record<string, unknown>;
}

function checkField(
  filename: string,
  obj: Record<string, unknown>,
  field: string,
  type: "string" | "number",
  required: boolean
): void {
  const value = obj[field];
  if (value === undefined) {
    if (required) throw new Error(`${filename}: missing required field "${field}"`);
    return;
  }
  if (typeof value !== type) {
    throw new Error(`${filename}: field "${field}" must be a ${type}`);
  }
}

const VIDEO_ASPECTS = ["16:9", "9:16", "1:1"];

function checkVideo(filename: string, obj: Record<string, unknown>): void {
  const video = obj.video;
  if (video === undefined) return;
  if (typeof video !== "object" || video === null || Array.isArray(video)) {
    throw new Error(`${filename}: field "video" must be an object`);
  }
  const v = video as Record<string, unknown>;
  if (v.url === undefined) {
    throw new Error(`${filename}: missing required field "video.url"`);
  }
  if (typeof v.url !== "string") {
    throw new Error(`${filename}: field "video.url" must be a string`);
  }
  if (v.poster !== undefined && typeof v.poster !== "string") {
    throw new Error(`${filename}: field "video.poster" must be a string`);
  }
  if (v.aspect !== undefined && !VIDEO_ASPECTS.includes(v.aspect as string)) {
    throw new Error(
      `${filename}: field "video.aspect" must be one of ${VIDEO_ASPECTS.join(", ")}`
    );
  }
}

export function parseJsonFile(filename: string, raw: string): unknown {
  try {
    return JSON.parse(raw);
  } catch (e) {
    throw new Error(`${filename}: invalid JSON — ${(e as Error).message}`);
  }
}

export function validateSnippetData(
  filename: string,
  data: unknown,
  courseSlugs: Set<string>
): SnippetData {
  const obj = asObject(filename, data);
  checkField(filename, obj, "title", "string", true);
  checkField(filename, obj, "language", "string", true);
  checkField(filename, obj, "code", "string", true);
  checkField(filename, obj, "description", "string", false);
  checkField(filename, obj, "course", "string", false);
  checkField(filename, obj, "order", "number", false);
  if (obj.course !== undefined && !courseSlugs.has(obj.course as string)) {
    throw new Error(
      `${filename}: course "${obj.course}" has no matching file in /courses/`
    );
  }
  checkVideo(filename, obj);
  return obj as unknown as SnippetData;
}

export function validateCourseData(filename: string, data: unknown): CourseData {
  const obj = asObject(filename, data);
  checkField(filename, obj, "title", "string", true);
  checkField(filename, obj, "description", "string", false);
  return obj as unknown as CourseData;
}

export function validateSnippetId(filename: string, id: string): void {
  if (RESERVED_IDS.has(id)) {
    throw new Error(`${filename}: "${id}" is a reserved name`);
  }
}
