@AGENTS.md

# UnconstrainED Snippets

## Project Overview

A static pastebin for UnconstrainED courses. Instructors add code snippets and LLM prompts as JSON files in `/snippets/`, students access them via shareable links. Snippets can be grouped into courses (`/courses/` metadata files) so each client organization gets one shareable course page.

- **Live:** https://unconstrained-snippets.vercel.app
- **Repo:** https://github.com/alex-unconstrained/unconstrained-snippets
- **Deploys:** Auto on push to `master` via Vercel

## Architecture

- Static Next.js 16 (App Router) site — all pages pre-rendered at build time
- No database, no auth, no API routes
- Snippets are JSON files in `/snippets/`, courses in `/courses/`, read at build time via `generateStaticParams`
- All JSON is validated at build time (`lib/validate.ts`) — bad files fail the build with filename + field in the message
- Shiki handles syntax highlighting at build time with a custom brand theme
- QR codes are generated at build time as inline SVG (`lib/qr.ts`, `qrcode` package)
- Client-side JS: copy buttons, editable prompt placeholders, QR toggle, video player
- Unit tests with vitest (`npm test`) cover the pure logic: validation, sorting/grouping, prompt parsing

## Key Files

- `lib/snippets.ts` — read/validate snippets and courses; `sortSnippets`, `groupSnippets`
- `lib/validate.ts` — build-time JSON validation (snippet, course, video shapes)
- `lib/prompt.ts` — `parsePrompt` (placeholders + light markdown into lines/segments), `composePrompt` (substitute filled values)
- `lib/highlight.ts` — Shiki highlighter with custom "unconstrained" theme
- `lib/qr.ts` — `SITE_URL` constant and build-time QR SVG generation
- `app/[id]/page.tsx` — Snippet view page, branches on `language === "prompt"` vs code
- `app/courses/[slug]/page.tsx` — Course page (title, description, ordered snippet list)
- `components/PromptBlock.tsx` — Interactive prompt: editable placeholder pills, blanks counter, markdown display, Copy, Open in Claude/ChatGPT
- `components/CodeBlock.tsx` — Shiki HTML + copy button
- `components/DemoVideoBlock.tsx` — optional demo video player (demo-video tool integration)
- `components/QrToggle.tsx` — QR reveal button on snippet/course pages

## Snippet Types

1. **Code snippets** (`language: "javascript"`) — Shiki syntax highlighting, "Copy Code" button
2. **Prompt snippets** (`language: "prompt"`) — `{{placeholder}}` renders as an editable field students fill in on the page; light markdown (`##`, lists, `**bold**`) renders styled; Copy produces the composed raw text; unfilled placeholders copy as `{{hint}}`

## Snippet JSON Fields

Required: `title`, `language`, `code`. Optional: `description`, `course` (slug of a `/courses/` file), `order` (number, position within course), `video` (`{ url, poster?, aspect? }`).

Course JSON (`/courses/<slug>.json`): required `title`, optional `description`.

The filename becomes the URL slug: `my-snippet.json` → `/my-snippet` (`courses` is a reserved name).

## Brand Design System

Full reference in `docs/unconstrained-design-system.md`. Key points:

- Dark theme only (surface-900 `#111219` background)
- Brand orange accent (brand-500 `#F5A623`)
- Fonts: Staatliches (headings), Anaheim (body), JetBrains Mono (code)
- All colors defined as Tailwind v4 `@theme` tokens in `app/globals.css`

## Common Tasks

- **Add a snippet:** Create JSON in `/snippets/`, push
- **Add a course:** Create JSON in `/courses/`, set `"course": "<slug>"` on its snippets
- **Edit a snippet:** Modify the JSON file, push
- **Change brand colors:** Edit `@theme` block in `app/globals.css`
- **Add a language:** Shiki supports many languages — just use the language name in the JSON. Add the language to the `langs` array in `lib/highlight.ts` if it's not already loaded.
- **Run checks:** `npm test` (unit), `npm run lint`, `npm run build` (also validates all JSON)
- **Canonical domain change:** set `NEXT_PUBLIC_SITE_URL` (QR codes embed it at build time)
