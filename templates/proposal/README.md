# Proposal template (v2)

Interactive client proposals served from `/a/<slug>` on the snippets site. First used for
`public/a/charting-our-direction-v2-4f999d/` (International School of Curitiba). Use that page as the working example.

## Files

- `proposal.css`: layout and components. Load it after the brand `tokens.css` and `components.css`.
- `proposal.js`: interactions. No dependencies and no tracking.

## Components

| Component | Markup hook | Notes |
|---|---|---|
| Hero | `.hero` + `.hero-art` | Use a drawn SVG in `.hero-art` (e.g. the route map). No client photos and no AI renders of the client. |
| Chapter | `section.chapter` (dark) / `section.chapter.paper` (warm paper) | Alternate the two for rhythm. |
| Before/after slider | `[data-compare]` with `.side.before`, `.side.after`, a range input and `.handle` | Keep the same footprint on both sides so the split cuts one object. |
| Journey | `[data-journey]` with `role=tab` buttons and `role=tabpanel` panels | Set `--cols` on `.track` so column widths match phase length. |
| Scripted demo | `[data-demo]`, question buttons with `data-q`, `<template data-a>` answers | Always label it "Illustrative demo · sample content". |
| Reaction bar | an empty `<div data-react="chapter-id" class="react">` | Sends to `PROPOSAL.feedbackEndpoint` if set, otherwise opens a pre-filled email to `PROPOSAL.contacts`. |
| Feature panel | `.outward` (two-column panel inside a chapter) | Use for one big idea that sits beside the main flow. |
| Investment | `.invest` with `.fee` rows and `.fee.total` | Label indicative pricing as indicative. |
| Internal notes | `details.review` | Remove before the client sees it. It's also hidden when printed. |
| Gaps | `span.todo` | Dashed amber highlight for anything still to fill in. |

## Publishing a proposal

1. Create `public/a/<name>-<6 hex>/` and copy in `tokens.css`, `components.css`, `assets/` (fonts and logo),
   `proposal.css` and `proposal.js`.
2. Write `index.html`. Use absolute asset paths (`/a/<slug>/...`), add `<meta name="robots" content="noindex, nofollow">`,
   and set `window.PROPOSAL = { id, title, contacts, sendTo, feedbackEndpoint }`.
3. In `next.config.ts`, add a rewrite from `/a/<slug>` to `/a/<slug>/index.html`, plus the noindex headers block.
4. Push to `master`. Vercel deploys it automatically.

Keep earlier versions at their own slug so links people already have keep working.
