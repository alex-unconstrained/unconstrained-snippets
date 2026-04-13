@AGENTS.md

# UnconstrainED Snippets

## Project Overview

A static pastebin for UnconstrainED courses. Instructors add code snippets and LLM prompts as JSON files in `/snippets/`, students access them via shareable links.

- **Live:** https://unconstrained-snippets.vercel.app
- **Repo:** https://github.com/alex-unconstrained/unconstrained-snippets
- **Deploys:** Auto on push to `master` via Vercel

## Architecture

- Static Next.js 15 (App Router) site — all pages pre-rendered at build time
- No database, no auth, no API routes
- Snippets are JSON files in `/snippets/` read at build time via `generateStaticParams`
- Shiki handles syntax highlighting at build time with a custom brand theme
- Only client-side JS is the copy-to-clipboard button

## Key Files

- `lib/snippets.ts` — `getAllSnippets()` and `getSnippetById(id)` read from `/snippets/`
- `lib/highlight.ts` — Shiki highlighter with custom "unconstrained" theme
- `app/[id]/page.tsx` — Snippet view page, branches on `language === "prompt"` vs code
- `components/CodeBlock.tsx` — Client component: Shiki HTML + copy button
- `components/PromptBlock.tsx` — Client component: `{{placeholder}}` parsing + copy button

## Snippet Types

1. **Code snippets** (`language: "javascript"`) — Shiki syntax highlighting, "Copy Code" button
2. **Prompt snippets** (`language: "prompt"`) — Plain text with `{{placeholder}}` rendered as highlighted pills, "Copy Prompt" button, legend below

## Brand Design System

Full reference in `docs/unconstrained-design-system.md`. Key points:

- Dark theme only (surface-900 `#111219` background)
- Brand orange accent (brand-500 `#F5A623`)
- Fonts: Staatliches (headings), Anaheim (body), JetBrains Mono (code)
- All colors defined as Tailwind v4 `@theme` tokens in `app/globals.css`

## Adding Content

Create a JSON file in `/snippets/`:

```json
{
  "title": "Snippet Title",
  "description": "Optional description shown above the code.",
  "language": "javascript",
  "code": "// your code here"
}
```

For prompts, use `"language": "prompt"` and `{{editable sections}}` in the code field.

The filename becomes the URL slug: `my-snippet.json` → `/my-snippet`

## Common Tasks

- **Add a snippet:** Create JSON in `/snippets/`, push
- **Edit a snippet:** Modify the JSON file, push
- **Change brand colors:** Edit `@theme` block in `app/globals.css`
- **Add a language:** Shiki supports many languages — just use the language name in the JSON. Add the language to the `langs` array in `lib/highlight.ts` if it's not already loaded.
