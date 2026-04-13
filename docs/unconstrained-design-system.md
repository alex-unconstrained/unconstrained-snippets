# UnconstrainED Design System — Reference for Claude Code

This document defines the visual language for all UnconstrainED web tools. When building or porting any tool under the UnconstrainED brand, follow these specifications exactly to ensure visual consistency across the product suite.

## Tech Stack

All UnconstrainED tools use this stack unless there is a strong reason to deviate:

- **Framework:** Next.js 15+ (App Router)
- **Styling:** Tailwind CSS v4 with `@theme` block for custom tokens
- **Language:** TypeScript
- **Deployment:** Vercel (auto-deploy on push to main/master)
- **Fonts:** Loaded via Google Fonts `@import` in `globals.css`

## Color Palette

### Brand (Orange)

The primary accent color. Used for interactive elements, branding, and emphasis.

| Token       | Hex       | Usage                                      |
|-------------|-----------|---------------------------------------------|
| brand-50    | `#FFFAF0` | Lightest tint, subtle backgrounds           |
| brand-100   | `#FEF3E0` | Light backgrounds                           |
| brand-200   | `#FDE8BF` | Light borders, hover states on light bg     |
| brand-300   | `#FDD48E` | Decorative accents                          |
| brand-400   | `#FBBC5E` | Secondary accent, syntax: functions/types   |
| brand-500   | `#F5A623` | **Primary accent** — buttons, logos, links  |
| brand-600   | `#E07428` | Hover state for brand-500 elements          |
| brand-700   | `#C5392C` | Syntax: keywords                            |
| brand-800   | `#7C3412` | Dark accent                                 |
| brand-900   | `#3D1A00` | Very dark accent                            |
| brand-950   | `#1A0A00` | Text on brand-500 backgrounds (buttons)     |

### Surface (Dark Blue-Gray)

Page backgrounds, cards, borders, and text hierarchy on dark themes.

| Token        | Hex       | Usage                                      |
|--------------|-----------|---------------------------------------------|
| surface-50   | `#F7F8FB` | Light theme background (if needed)          |
| surface-100  | `#EEF0F6` | Light theme secondary background            |
| surface-200  | `#DDE1EC` | Light theme borders                         |
| surface-300  | `#B4BDD1` | **Body text** on dark backgrounds           |
| surface-400  | `#959EB4` | **Secondary text** — descriptions, subtitles|
| surface-500  | `#737F99` | **Muted text** — labels, metadata           |
| surface-600  | `#3D4663` | Subtle borders, syntax: comments            |
| surface-700  | `#252E47` | **Primary borders** — cards, dividers       |
| surface-800  | `#1A1C28` | **Card backgrounds**, code block headers    |
| surface-900  | `#111219` | **Page background**                         |
| surface-950  | `#0A0B14` | **Deep background** — code blocks, header   |

### Segment Colors

Used to distinguish between UnconstrainED audience segments. Apply sparingly — primarily in segment-specific branding or category indicators.

| Token           | Hex       | Usage                           |
|-----------------|-----------|----------------------------------|
| Schools         | `#178A7F` | Schools segment primary          |
| Schools dark    | `#147F74` | Schools hover/active state       |
| Schools bright  | `#2EC4B6` | Schools gradients, syntax: strings |
| Business        | `#5C4ECC` | Business segment primary         |
| Business dark   | `#4A3DB3` | Business hover/active state      |
| Business bright | `#8B7FF0` | Business gradients, syntax: numbers |

## Typography

### Font Families

| Role     | Font           | Fallback              | Tailwind Class  |
|----------|----------------|-----------------------|-----------------|
| Headings | Staatliches    | sans-serif            | `font-heading`  |
| Body     | Anaheim        | sans-serif            | `font-body`     |
| Code     | JetBrains Mono | Fira Code, monospace  | `font-mono`     |

### Loading Fonts

Place this as the **first line** of `app/globals.css` (before `@import "tailwindcss"`):

```css
@import url("https://fonts.googleapis.com/css2?family=Staatliches&family=Anaheim&family=JetBrains+Mono:wght@400;500&display=swap");
```

### Heading Style

- Font: Staatliches
- Color: `#FFFFFF` (white) on dark backgrounds
- Text transform: uppercase
- Letter spacing: `tracking-wide` (1px) or `tracking-wider` (2px) for logo text
- Sizes: `text-3xl` for page titles, `text-xl` for section headers, `text-lg` for card titles

### Body Text Style

- Font: Anaheim
- Primary: surface-300 (`#B4BDD1`)
- Secondary: surface-400 (`#959EB4`)
- Muted: surface-500 (`#737F99`)
- Line height: `leading-relaxed`

## Tailwind Configuration

### globals.css

Every tool must include this `@theme` block in `app/globals.css`:

```css
@import url("https://fonts.googleapis.com/css2?family=Staatliches&family=Anaheim&family=JetBrains+Mono:wght@400;500&display=swap");
@import "tailwindcss";

@theme {
  --color-brand-50: #FFFAF0;
  --color-brand-100: #FEF3E0;
  --color-brand-200: #FDE8BF;
  --color-brand-300: #FDD48E;
  --color-brand-400: #FBBC5E;
  --color-brand-500: #F5A623;
  --color-brand-600: #E07428;
  --color-brand-700: #C5392C;
  --color-brand-800: #7C3412;
  --color-brand-900: #3D1A00;
  --color-brand-950: #1A0A00;

  --color-surface-50: #F7F8FB;
  --color-surface-100: #EEF0F6;
  --color-surface-200: #DDE1EC;
  --color-surface-300: #B4BDD1;
  --color-surface-400: #959EB4;
  --color-surface-500: #737F99;
  --color-surface-600: #3D4663;
  --color-surface-700: #252E47;
  --color-surface-800: #1A1C28;
  --color-surface-900: #111219;
  --color-surface-950: #0A0B14;

  --font-heading: "Staatliches", sans-serif;
  --font-body: "Anaheim", sans-serif;
  --font-mono: "JetBrains Mono", "Fira Code", monospace;
}

body {
  font-family: var(--font-body);
  background-color: var(--color-surface-900);
  color: var(--color-surface-300);
}
```

## Component Patterns

### Page Layout

Every page follows this structure:

```tsx
<div className="min-h-screen flex flex-col">
  <Header />
  <main className="flex-1 max-w-3xl w-full mx-auto px-6 py-10">
    {/* Page content */}
  </main>
  <footer className="py-6 text-center border-t border-surface-700">
    <a
      href="https://unconstrained.dev"
      className="text-surface-600 text-xs tracking-wide hover:text-surface-400 transition-colors"
    >
      unconstrained.dev
    </a>
  </footer>
</div>
```

- Max content width: `max-w-3xl` (48rem / 768px)
- Horizontal padding: `px-6`
- Vertical padding: `py-10`
- Footer always present with link back to main site

### Header / Navigation Bar

```tsx
<header className="flex items-center px-6 py-4 bg-surface-950 border-b border-surface-700">
  <Link href="/" className="flex items-baseline gap-2">
    <span className="font-heading text-xl text-brand-500 tracking-wider">
      UNCONSTRAINED
    </span>
    <span className="text-surface-500 text-xs tracking-widest">
      {TOOL_NAME}
    </span>
  </Link>
</header>
```

- Background: surface-950
- Bottom border: surface-700
- "UNCONSTRAINED" in brand-500 (orange), Staatliches
- Tool name in surface-500 (muted), smaller text
- Replace `{TOOL_NAME}` with the specific tool name (e.g., "SNIPPETS", "GRADER", "DASHBOARD")

### Buttons

**Primary (CTA):**
```
bg-brand-500 hover:bg-brand-600 text-brand-950 px-4 py-1.5 rounded-md text-sm font-semibold tracking-wide transition-colors cursor-pointer
```

**Secondary (subtle):**
```
border border-surface-700 hover:border-brand-500/50 text-surface-300 px-4 py-1.5 rounded-md text-sm transition-colors cursor-pointer
```

### Cards

```tsx
<div className="block p-5 rounded-lg border border-surface-700 bg-surface-800 hover:border-brand-500/50 transition-colors">
  <h2 className="font-heading text-lg text-white tracking-wide mb-1">
    {TITLE}
  </h2>
  <p className="text-surface-400 text-sm line-clamp-2">
    {DESCRIPTION}
  </p>
  <span className="inline-block mt-3 text-xs text-surface-500 uppercase tracking-widest">
    {METADATA}
  </span>
</div>
```

- Background: surface-800
- Border: surface-700, hover to brand-500/50
- Title: white, Staatliches, uppercase
- Description: surface-400
- Metadata/labels: surface-500, uppercase, tracking-widest

### Content Containers (Code Blocks, Panels)

```tsx
<div className="rounded-lg border border-surface-700 overflow-hidden">
  {/* Header bar */}
  <div className="flex items-center justify-between px-4 py-2.5 bg-surface-800 border-b border-surface-700">
    <span className="text-surface-500 text-xs uppercase tracking-widest">
      {LABEL}
    </span>
    {/* Action button goes here */}
  </div>
  {/* Content area */}
  <div className="p-5 bg-surface-950">
    {/* Content */}
  </div>
</div>
```

- Container border: surface-700
- Header: surface-800 background
- Content area: surface-950 background
- Labels in header: surface-500, uppercase, tracking-widest

### Placeholder/Editable Sections

For content with user-replaceable sections (e.g., prompt templates), wrap editable text in:

```tsx
<span className="inline bg-brand-500/15 border border-brand-500/40 text-brand-500 px-1.5 rounded">
  {placeholder text}
</span>
```

Include a legend below the content:

```tsx
<div className="flex items-center gap-2 mt-3 px-4 py-3 bg-surface-800 rounded-lg border border-surface-700">
  <span className="inline-block w-3.5 h-3.5 rounded-sm bg-brand-500/15 border border-brand-500/40" />
  <span className="text-surface-400 text-sm">
    Highlighted sections should be replaced with your own content
  </span>
</div>
```

## Syntax Highlighting Theme

When using Shiki for code syntax highlighting, use this custom theme to match the brand:

```ts
const brandTheme = {
  name: "unconstrained",
  type: "dark" as const,
  settings: [
    { scope: ["keyword", "storage.type"], settings: { foreground: "#C5392C" } },
    { scope: ["entity.name.function", "support.function"], settings: { foreground: "#FBBC5E" } },
    { scope: ["string", "string.quoted"], settings: { foreground: "#2EC4B6" } },
    { scope: ["constant.numeric"], settings: { foreground: "#8B7FF0" } },
    { scope: ["comment", "punctuation.definition.comment"], settings: { foreground: "#3D4663", fontStyle: "italic" } },
    { scope: ["variable.other.object", "support.class"], settings: { foreground: "#F5A623" } },
    { scope: ["variable", "variable.other"], settings: { foreground: "#B4BDD1" } },
    { scope: ["punctuation", "meta.brace"], settings: { foreground: "#737F99" } },
    { scope: ["entity.name.type", "support.type"], settings: { foreground: "#FBBC5E" } },
  ],
  colors: {
    "editor.background": "#0A0B14",
    "editor.foreground": "#B4BDD1",
  },
};
```

| Syntax Element     | Color     | Source Token      |
|--------------------|-----------|-------------------|
| Keywords           | `#C5392C` | brand-700         |
| Functions          | `#FBBC5E` | brand-400         |
| Strings            | `#2EC4B6` | Schools bright    |
| Numbers            | `#8B7FF0` | Business bright   |
| Comments           | `#3D4663` | surface-600       |
| Objects/builtins   | `#F5A623` | brand-500         |
| Variables          | `#B4BDD1` | surface-300       |
| Punctuation        | `#737F99` | surface-500       |

## Layout Metadata

### Root Layout (`app/layout.tsx`)

```tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "UnconstrainED {Tool Name}",
  description: "{Tool description} for UnconstrainED courses",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
```

Do NOT use `next/font` for font loading — use the Google Fonts `@import` in CSS instead for consistency across tools.

## Dark Theme Only

All UnconstrainED tools use dark theme exclusively. Do not implement light mode or `prefers-color-scheme` toggles. The surface-900 background with brand-500 orange accents is the canonical look.

## Reference Implementation

The **UnconstrainED Snippets** project is the reference implementation of this design system:
- **Repo:** https://github.com/alex-unconstrained/unconstrained-snippets
- **Live:** https://unconstrained-snippets.vercel.app

When in doubt about how a pattern should look, check this implementation.
