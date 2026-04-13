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

### File Naming

- Use kebab-case: `auto-grade-setup.json`
- The filename (minus `.json`) becomes the URL slug: `/auto-grade-setup`
- Keep names short and descriptive

## Adding a Prompt Snippet

For LLM prompts with user-editable sections, set `"language": "prompt"` and use `{{placeholder}}` syntax:

```json
{
  "title": "Data Analysis Prompt",
  "description": "Replace the highlighted sections with your own content before pasting into ChatGPT or Claude.",
  "language": "prompt",
  "code": "You are an expert data analyst.\n\n## Context\nI'm working on {{describe your project}} and I have data from {{your data source}}.\n\n## The Data\n{{paste your data here}}"
}
```

Placeholders render as highlighted orange pills on the page so students know what to replace. When copied, placeholders are included as raw `{{text}}` for easy find-and-replace.

## URL Structure

| URL | Page |
|-----|------|
| `/` | Landing page listing all snippets |
| `/{snippet-name}` | Individual snippet page |

## Local Development

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Project Structure

```
/snippets/              -- Snippet JSON files (one per snippet)
/app/
  layout.tsx            -- Root layout with brand fonts + metadata
  page.tsx              -- Landing page listing all snippets
  [id]/page.tsx         -- Snippet view page (dynamic route)
/lib/
  snippets.ts           -- Load and parse snippet JSON files
  highlight.ts          -- Shiki syntax highlighter with brand theme
/components/
  CodeBlock.tsx          -- Syntax-highlighted code + copy button
  PromptBlock.tsx        -- Prompt text with placeholder highlighting + copy
  SnippetCard.tsx        -- Card for landing page list
  Header.tsx             -- Shared branding header
/docs/
  unconstrained-design-system.md  -- Brand design system reference
```

## Tech Stack

- **Next.js 15** (App Router) -- static generation via `generateStaticParams`
- **Tailwind CSS v4** -- brand tokens as CSS variables
- **Shiki** -- build-time syntax highlighting with custom brand theme
- **TypeScript**
- **Vercel** -- auto-deploys on push

## Deployment

The site auto-deploys to Vercel when you push to the `master` branch. No manual deployment steps required.

To deploy manually:
```bash
npx vercel --prod
```

## Design System

See `docs/unconstrained-design-system.md` for the full brand reference (colors, typography, component patterns, Tailwind config, Shiki theme). Use this when building other UnconstrainED tools to maintain visual consistency.
