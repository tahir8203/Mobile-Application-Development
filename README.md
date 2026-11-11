# Mobile Application Development

A complete interactive course website containing all 16 Mobile Application Development lectures.

Instructor: Muhammad Tahir Mehmood

Open `index.html` directly to use the course locally (works offline). The site is a static site deployed on Vercel; no build step.

## Presentation Mode (classroom projector)

Every lecture has a slide deck built on one rule: **one screen = one concept**.
Open it from a lecture card (**Present**), the lecture toolbar (**Present slides**), the lesson map, or the URL `#present/<lecture>/<slide>` (for example `#present/9/3`).

| Key | Action |
|---|---|
| → / Space / PageDown | Next slide |
| ← / PageUp | Previous slide |
| Home / End | First / last slide |
| number + Enter | Jump to that slide |
| F | Fullscreen |
| Esc | Exit fullscreen, then exit the presentation |
| N | Presenter notes (hidden by default) |
| O | Slide overview |
| S / P / R | Step, play/pause, reset the slide's animation (S also steps through code lines) |
| L | Light / dark slide theme |

The 🖥 button opens a **presenter window** (notes, next slide, timer) for a second screen; it stays in sync with the projector window.
Swipe left/right on phones and tablets.

## Project structure

```
index.html              Original course app (home, lectures in reading mode, glossary, quizzes, certificates)
assets/theme.css        Design system: navy / electric blue / cyan
assets/present.css      Presentation mode + animation widgets
assets/present.js       Presentation engine, animation widgets, integration with the course app
assets/slides/lNN.js    Slide deck for lecture NN (content only — no UI code)
assets/instructor.webp  Instructor photo
docs/UPGRADE-BRIEF.md   Refined project brief and acceptance criteria
```

## Adding or editing slides

Each deck calls `MAD.deck(n, { title, subtitle, objectives, slides: [...] })`. Slide kinds:
`concept` (default), `code`, `compare`, `mistake`, `quiz`, `task`, `summary`.
A concept slide may include `viz: { type, ... }` with one of the built-in animations:
`flow`, `stack`, `cards`, `variable`, `decision`, `loop`, `array`, `func`, `classobj`, `inherit`,
`machine` (lifecycle / state machines), `intent`, `perm`, `threads`, `storage`, `broadcast`,
`table` (SQL CRUD), `tree`, `xmlphone`, `recycler`, `gps`, `progress`, `notify`.
Add `notes` for presenter notes and `ask` for a class question. Browser visuals are labelled as simulations;
Android code is shown with instructions for running it in Android Studio.

Progress is stored per browser: the original key `madCompleteCourseV1` is unchanged; slide progress,
quiz answers and task status use `madPresentationV1`.
