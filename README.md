# About Nutrilite

Nutrilite is a self-contained web app for the Russian-language online course
**«Основы здорового питания»** ("Fundamentals of Healthy Nutrition"). It turns the
course Markdown files in `public/lessons/` into a readable, progress-aware learning
experience.

The project is intentionally dependency-light: course content, navigation, Markdown
rendering, and progress tracking all live in the frontend. There is no backend,
authentication, or database.

## Features

- **Course home page** with the full module list, course stats, and a continue card.
- **Lesson reader** that renders lessons directly from Markdown, with a hero
  illustration for each module.
- **Auto-generated table of contents** from lesson headings.
- **Previous/next lesson navigation** with automatic completion on "next".
- **Reading progress** based on the visible part of the lesson and current scroll
  position.
- **Persistent progress** in `localStorage`, including lesson status, furthest
  reading position, and last visited lesson.
- **Progress dashboard** with per-module status, position, last-visit time, and a
  reset action.
- **Responsive layout** with a collapsible module sidebar on smaller screens.
- **Light/dark color support** based on the user's system preference.
- **Web app manifest** for adding the course to the home screen.
- **Offline support** through a generated service worker that precaches the app
  shell, lessons, and images.

## How progress works

Progress is stored under the `nutrilite.progress` key as a versioned JSON object:

```ts
interface ProgressState {
  version: 1
  lastLessonId: string | null
  lessons: Record<string, {
    status: 'not-started' | 'in-progress' | 'completed'
    scrollPercent: number
    lastVisitedAt: number
    completedAt?: number
  }>
}
```

- Opening a lesson marks it as `in-progress`.
- `scrollPercent` accounts for viewport height, so the portion of the lesson already
  visible in the viewport counts toward progress.
- Reading progress is monotonic: scrolling back up never lowers the recorded value.
- Clicking the next-lesson link marks the current lesson as `completed`. On the final
  lesson, the same action opens the progress page and completes the lesson there.
- Progress is saved with a short debounce and flushed when the page is hidden or closed.
- Progress can be cleared from the progress dashboard.

Progress is local to the browser and is not synchronized between devices.

## Tech stack

- **Vue 3** with `<script setup>` and TypeScript
- **Vite** for development and production builds
- **Custom Markdown parser** for headings, paragraphs, nested lists, task lists,
  tables, blockquotes, code blocks, dividers, and inline formatting
- **Custom hash router** with `#/`, `#/lesson/:id`, and `#/progress` routes
- **`localStorage`** for persistence
- **Generated service worker** with cache-first static assets and an offline app
  shell fallback
- **No runtime UI, Markdown, router, or state-management dependencies**

## Project layout

```text
docs/
  branding.md       Course branding notes
  syllabus.md       Course syllabus and module plan
public/
  images/           Lesson hero illustrations
  lessons/          Course content (Markdown, one file per module)
  logo/             Course logo assets (logo_{size}.png)
  manifest.json     Web app manifest
scripts/
  build-sw.mjs      Generates the service worker and its precache list
  check-content.mjs Validates lesson structure and Markdown parsing
  ssr-check.mjs     Renders lessons and views, checks progress persistence
src/
  components/       Layout, lesson, Markdown, and progress UI
  composables/      Progress state and reading-position logic
  content/          Lesson catalog, repository, and Markdown parser
  router/           Hash-based routing
  services/         localStorage persistence and service worker registration
  styles/           Design tokens, base styles, and Markdown styles
  types/            Shared TypeScript types
  views/            Home, lesson, progress, and not-found views
```

## Getting started

Requirements: Node.js and npm.

```bash
npm install
npm run dev
```

The development server runs at `http://localhost:3000`.

Other commands:

```bash
npm run build        # Type-check and build for production
npm run preview      # Preview the production build
npm run check        # Validate content and render all views
npm run check:content
npm run check:ssr
```

The service worker is registered only in production builds. To test offline behavior,
run `npm run build` and then `npm run preview`.

## Course content

The course contains 12 modules covering nutrition basics, macronutrients,
micronutrients, energy balance, meal planning, food labels, cooking, lifestyle,
special groups, diet myths, eating behavior, and a final personal nutrition plan.

All course copy and UI text are in Russian. Module 13 is reserved in the syllabus as
a future practical module and is not yet authored.
