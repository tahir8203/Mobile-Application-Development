# Course Upgrade Brief (refined prompt)

This is a tightened version of the original "Master Project Prompt". It keeps every goal
but turns them into decisions and checkable acceptance criteria, so the work can be
built and verified rather than re-interpreted each time.

## 1. What already exists (audit, Nov 2026)

- Static site, no build step: a single `index.html` deployed on Vercel.
- 16 lectures are complete HTML documents, base64-embedded and loaded into iframes
  ("reading mode"). Each lecture has its own long-form content and styling.
- `CourseApp` (inline script) provides routing (`#lecture-N`, `#glossary` …), progress,
  bookmarks, flashcards, glossary, practice quiz, results, certificate, search and theme,
  stored in `localStorage["madCompleteCourseV1"]`.
- Problems found: 2.5 MB base64 instructor photo inline (slow first load); long scrolling
  pages are unsuitable for a projector; no slide/presentation mode; few concept
  animations; green palette not matching the requested navy/blue/cyan direction.

## 2. Decisions

| Topic | Decision |
|---|---|
| Framework | Keep plain HTML/CSS/JS. No framework, no build step, no animation library. |
| Existing lectures | Keep the reading-mode lectures untouched as the detailed reference. |
| New layer | Add a **Presentation Mode** with hand-written slide decks per lecture. |
| Content | Slide decks are data files `assets/slides/lNN.js`, loaded on demand. |
| Animations | One small engine `assets/present.js` with reusable SVG/CSS widgets driven by a step model (Play / Pause / Step / Reset). |
| Storage | Existing key is never changed. New data lives in `madPresentationV1`. |
| Honesty | Browser demos are labelled *simulations*. Android/Kotlin code is shown with "run it in Android Studio" instructions and expected output, never "executed". |
| Deployment | Work on a branch, Vercel preview first; push/merge only when the instructor authorises it. |

## 3. Slide schema

```js
{ kind: 'title'|'objectives'|'concept'|'code'|'compare'|'mistake'|'quiz'|'summary'|'task',
  title, text,            // one heading + one or two short sentences
  analogy,                // optional real-life analogy
  viz: { type, ...opts }, // optional interactive visual
  code, lang, lines,      // code slides: lines = [[lineNo, explanation], ...]
  output, change,         // expected output, "change one value" note
  takeaway,               // one-line key point
  notes }                 // presenter notes (hidden by default)
```

Rule: **one slide = one learning objective.** If a slide needs two headings, it is two slides.

## 4. Acceptance criteria

1. Every lecture card, lecture page and the lecture library has a "Present" entry point.
2. Presentation: full-screen overlay, large type, progress bar, slide counter,
   Previous/Next, overview grid, direct jump, presenter notes toggle (hidden by default),
   fullscreen toggle, exit button, swipe on touch devices.
3. Keys: → / Space / PageDown next · ← / PageUp previous · Home / End · F fullscreen ·
   Esc exit fullscreen, then exit · N notes · O overview · P play/pause animation ·
   S step animation · R reset animation.
4. Each of the 16 decks contains: objectives, concept slides with visuals, at least one
   code slide with line explanations and expected output, a legacy-vs-modern comparison
   where relevant, a common-mistake slide, a quiz, a practical task/assignment and a
   quick-revision summary. No placeholder slides.
5. Required interactive visuals: variables, data types, if/else, loops, arrays, functions,
   classes/objects, inheritance/polymorphism, Android architecture, build/run workflow,
   XML↔Kotlin, Compose, click event flow, intents with data, permissions, Activity
   lifecycle simulator, storage data-flow, SQL CRUD table, Firebase JSON tree,
   client-server/REST, MediaPlayer states, threads sync vs async, coroutines, service
   lifecycle, broadcast delivery, WorkManager.
6. Progress: resume last lecture + last slide, slide-level progress per lecture, quiz score
   per deck, assignment done toggle; existing progress keeps working.
7. Responsive at 1920×1080, 1366×768, 768×1024, 390×844, 360×800 with no horizontal
   overflow; `prefers-reduced-motion` respected; no console errors.
8. Design: deep navy / near-black surfaces, electric-blue primary, cyan secondary, in both
   light and dark themes.
