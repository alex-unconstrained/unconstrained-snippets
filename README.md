# UnconstrainED Snippets

A brand-aligned code snippet and prompt sharing tool for [UnconstrainED](https://unconstrained.dev) courses. Instructors add snippets as JSON files, students access them via shareable links and copy with one click.

**Live:** https://unconstrained-snippets.vercel.app

## Adding a Code Snippet

Create a JSON file in the `/snippets/` directory:

```json
{
  "title": "Auto Grade Setup",
  "description": "Paste this into your Google Apps Script editor to enable automatic grading.",
  "language": "javascript",
  "code": "function onFormSubmit(e) {\n  const sheet = SpreadsheetApp.getActiveSpreadsheet();\n  // ...\n}"
}
```

Push to GitHub. Vercel auto-deploys in ~30 seconds. The snippet is live at `unconstrained-snippets.vercel.app/{filename}`.

### Snippet Fields

| Field         | Type   | Required | Notes                                              |
|---------------|--------|----------|----------------------------------------------------|
| `title`       | string | Yes      | Displayed as page heading (renders uppercase)       |
| `description` | string | No       | Context shown above the code block                  |
| `language`    | string | Yes      | `"javascript"` for code, `"prompt"` for LLM prompts |
| `code`        | string | Yes      | The raw content. Use `\n` for newlines, `\"` for quotes |
| `course`      | string | No       | Slug of a course file in `/courses/` — groups the snippet under that course |
| `order`       | number | No       | Position within the course listing (unordered snippets sort last, alphabetically) |
| `video`       | object | No       | Optional demo video: `{ "url": "/videos/x.mp4", "poster": "...", "aspect": "16:9" }` |

All fields are validated at build time — a typo or missing field fails the build with the filename and field in the error message, so broken snippets never deploy.

### File Naming

- Use kebab-case: `auto-grade-setup.json`
- The filename (minus `.json`) becomes the URL slug: `/auto-grade-setup`
- Keep names short and descriptive (`courses` is reserved)

## Adding a Prompt Snippet

For LLM prompts with user-editable sections, set `"language": "prompt"` and use `{{placeholder}}` syntax:

```json
{
  "title": "Data Analysis Prompt",
  "description": "Fill in the highlighted fields, then copy.",
  "language": "prompt",
  "code": "You are an expert data analyst.\n\n## Context\nI'm working on {{describe your project}} and I have data from {{your data source}}.\n\n## The Data\n{{paste your data here}}"
}
```

On the page, placeholders render as **editable orange fields** — students type their content directly into the prompt, a "N blanks left" counter tracks progress, and "Copy Prompt" copies the completed text. Unfilled placeholders copy as literal `{{text}}`.

Prompt display supports light markdown: `#`/`##`/`###` headers, `-`/`*` bullets, `1.` numbered lists, and `**bold**` render styled. Copying always produces the raw text.

Each prompt page also has **Open in Claude** / **Open in ChatGPT** buttons that launch the AI with the composed prompt pre-filled (disabled for very long prompts — use Copy instead).

## Courses

Group snippets by course so each client organization gets one shareable link. Create a JSON file in `/courses/`:

```json
{
  "title": "AI Foundations",
  "description": "Core prompts and exercises for the AI Foundations workshop."
}
```

Then reference it from snippets with `"course": "<filename-without-json>"`. The course page lives at `/courses/<slug>`, lists its snippets in `order`, and the homepage groups snippets by course (course-less snippets appear under "General").

Every snippet and course page has a **QR button** — pop it on a projector and a room of participants can jump to the page from their phones.

## URL Structure

| URL | Page |
|-----|------|
| `/` | Landing page, snippets grouped by course |
| `/{snippet-name}` | Individual snippet page |
| `/courses/{slug}` | Course page — the link you share with an organization |

## Local Development

```bash
npm install
npm run dev    # local server
npm test       # unit tests (validation, parsing)
npm run build  # full static build — also validates all snippet/course JSON
```

Open http://localhost:3000.

## Project Structure

```
/snippets/              -- Snippet JSON files (one per snippet)
/courses/               -- Course metadata JSON files (one per course)
/app/
  layout.tsx            -- Root layout with brand fonts + metadata
  page.tsx              -- Landing page, grouped by course
  [id]/page.tsx         -- Snippet view page (dynamic route)
  courses/[slug]/page.tsx -- Course page (dynamic route)
/lib/
  snippets.ts           -- Load, validate, sort, and group snippets/courses
  validate.ts           -- Build-time JSON validation
  prompt.ts             -- Prompt parsing: placeholders + light markdown
  highlight.ts          -- Shiki syntax highlighter with brand theme
  qr.ts                 -- Build-time QR code SVG generation
/components/
  CodeBlock.tsx          -- Syntax-highlighted code + copy button
  PromptBlock.tsx        -- Interactive prompt: editable placeholders, markdown, open-in buttons
  DemoVideoBlock.tsx     -- Optional demo video player
  QrToggle.tsx           -- QR code reveal button
  SnippetCard.tsx        -- Card for landing/course page lists
  Header.tsx             -- Shared branding header
  Footer.tsx             -- Shared footer
/docs/
  unconstrained-design-system.md  -- Brand design system reference
```

## Tech Stack

- **Next.js 16** (App Router) -- static generation via `generateStaticParams`
- **Tailwind CSS v4** -- brand tokens as CSS variables
- **Shiki** -- build-time syntax highlighting with custom brand theme
- **TypeScript** + **vitest** for the pure logic (validation, prompt parsing)
- **qrcode** -- build-time QR SVG generation
- **Vercel** -- auto-deploys on push

## Deployment

The site auto-deploys to Vercel when you push to the `master` branch. No manual deployment steps required.

To deploy manually:
```bash
npx vercel --prod
```

Set `NEXT_PUBLIC_SITE_URL` if the canonical domain ever changes — QR codes embed it at build time.

## Design System

See `docs/unconstrained-design-system.md` for the full brand reference (colors, typography, component patterns, Tailwind config, Shiki theme). Use this when building other UnconstrainED tools to maintain visual consistency.
