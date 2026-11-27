# Repository Research: Teaching-Visual Patterns

Date checked: 26 Nov 2026. Facts come from `gh api` (repo metadata, latest commit, releases, contents/README), plus npm registry and jsDelivr file listings for bundle sizes. I treated all repo content as untrusted data. I ran, installed and copied nothing. Target: an offline, no-build, vanilla HTML/CSS/JS portal for 360px phones that already has a Play / Back / Step / Reset step engine.

## Ranking

| # | Repo | Relevance (slide/pattern) | License (GitHub) | Last commit | Archived | Dependency weight |
|---|---|---|---|---|---|---|
| 1 | reshinto/algo_flow | Kotlin tracer: step schema, scrub, speed, mobile tabs, reduced motion | MIT | 2026-04-11 | No | Heavy (React 19, Monaco, mermaid, zustand) |
| 2 | wadekarg/DS-Algo-Playground | Lesson layout, code-trace + variables, quiz | MIT | 2026-08-26 | No | Light: vanilla, vendored CodeMirror; Pyodide from CDN |
| 3 | RohanMukka/CodeThrough | Tracer: snapshot model, variable watch, console, timeline | None reported (README says MIT; no LICENSE file) | 2026-04-09 | No | Heavy (React, React Flow, framer-motion, acorn) |
| 4 | jesselsookha/android-xml-previewer | Later XML→phone preview, validation messages | GPL-3.0 | 2026-02-04 | No | Light: vanilla, CodeMirror 5 + Google Fonts from CDN |
| 5 | algorithm-visualizer/algorithm-visualizer + /algorithms | Tracer commands chunked by line; visuals kept apart from content | MIT / None reported | 2023-11-18 / 2021-03-21 | No / No | Heavy (React 16, Redux, node-sass, chart.js) |
| 6 | EricFinland/graph-algo-visualizer | Data/steps/render separation in vanilla SVG | None reported | 2026-02-15 | No | None (one 10.9 KB ES module) |
| 7 | svgdotjs/svg.js | SVG timeline/animation API ideas | NOASSERTION (LICENSE.txt is MIT text) | 2026-08-04 | No | 93.5 KB min, zero deps |
| 8 | motiondivision/motion | Spring/easing generators, reduced-motion keyword | MIT | 2026-11-24 | No | dist/motion.js 191.6 KB |
| 9 | d3/d3 | Data-join and scale concepts for number line / timeline | ISC | 2026-11-23 | No | d3.min.js 280.6 KB (30 sub-modules) |
| 10 | visjs/vis-timeline | Android version timeline (pan/pinch) | NOASSERTION (LICENSE.md: Apache-2.0 OR MIT) | 2026-11-25 | No | Standalone min 548.3 KB; 9 peer deps |
| 11 | mermaid-js/mermaid | Diagram syntax (timeline/flow/state) | MIT | 2026-11-23 | No | mermaid.min.js 5.54 MB; 22 deps |

---

## 1. jesselsookha/android-xml-previewer
- **URL:** https://github.com/jesselsookha/android-xml-previewer
- **Pattern:** XML editor + simulated device frame. `parseAndroidXml` uses `DOMParser` and checks `parsererror`. A `RENDERERS` map turns each tag into a div: LinearLayout, RelativeLayout, FrameLayout, ConstraintLayout (parent-only), ScrollView, TextView, Button, EditText, CheckBox, Switch, ProgressBar, RecyclerView placeholder and more. `validateAndroidTree` returns friendly warnings (missing layout_width/height, bad dp/sp, bad colour, ScrollView child count, missing constraints). Red errors block rendering; warnings do not.
- **Files inspected:** `README.md`, `index.html`, `scripts.js` (72 KB), `styles.css`.
- **License:** GPL-3.0. Copyleft, so copying code would force GPL on our portal.
- **Last activity:** 2026-02-04 ("created CHANGELOG"). No releases.
- **Weight:** CodeMirror 5.58 and Google Fonts load from CDNs, so the project does not work offline as-is.
- **Mobile/a11y:** Has a viewport meta and breakpoints at 1100px and 800px (one column). I saw no `aria-` attributes in `index.html` and no reduced-motion rule.
- **ADAPT:** A fixed whitelist of tags and attributes. A tag→renderer map. A two-level error vs. warning model with teaching-style messages ("expected dp/sp…").
- **NOT COPY:** Any code (GPL). The CodeMirror dependency. The three-panel desktop layout.

## 2. RohanMukka/CodeThrough
- **URL:** https://github.com/RohanMukka/CodeThrough
- **Pattern:** Each step is a `Snapshot {line, variables, consoleLogs?, callStackDepth?}`. `usePlayback` keeps `currentIndex` plus `previousSnapshot`, and `VariableWatch` compares the two to highlight variables that changed. `Timeline` has a range-input seek, speeds 0.25/0.5/1/2/4 (700 ms base ÷ speed) and a "Step n / N" counter.
- **Files inspected:** `README.md`, `package.json`, `src/types/index.ts`, `src/hooks/usePlayback.ts`, `src/components/Timeline.tsx`, `src/components/VariableWatch.tsx`, `src/lib/tracer.ts` (grep only).
- **License:** GitHub reports none and there is no LICENSE file in the tree. The README's License section says "MIT". Treat it as UNVERIFIED.
- **Last activity:** 2026-04-09. No releases.
- **Weight:** React 18, @xyflow/react, framer-motion, CodeMirror 6, acorn/astring. It runs user JS through `new Function` (5 s and 10,000-snapshot limits).
- **Mobile/a11y:** The timeline bar has `min-w-[500px]`, which breaks at 360px. Buttons are 28–32px. The play button has no title or aria-label. The range input has no label.
- **ADAPT:** The snapshot shape (line, vars, console). Change highlighting found by diffing against the previous step. A seek slider plus a step counter.
- **NOT COPY:** Executing code. The React stack. The fixed-width floating bar.

## 3. algorithm-visualizer/algorithm-visualizer and /algorithms
- **URL:** https://github.com/algorithm-visualizer/algorithm-visualizer, https://github.com/algorithm-visualizer/algorithms
- **Pattern:** Lesson code calls tracer APIs (`tracer.select/patch/depatch`, `logger.println`) and `Tracer.delay()`. In `Player.reset()`, every `delay` command closes a "chunk" tagged with a `lineNumber`, so each step is a batch of visual commands tied to a source line. Speed is `4000 / e^speed` ms. Lesson content lives in its own repo, one folder per algorithm (`README.md`, `code.js`, `Code.java`, `main.cpp`), and visualization blocks are fenced with `// visualize {` comments.
- **Files inspected:** `README.md`, `package.json`, `src/core/tracers/Tracer.jsx`, `src/components/Player/index.js`; algorithms: `README.md`, `package.json`, `Brute Force/Bubble Sort/code.js`.
- **License:** Web app MIT. GitHub reports no license for `algorithms`.
- **Last activity:** Last commit 2023-11-18 (README update), pushed 2024-06-09. `algorithms` last commit 2021-03-21. Effectively dormant.
- **Weight:** React 16, Redux, node-sass, chart.js, Ace, and `bluebird`/`brace` pinned to `latest`. It also needs a server to compile and run code.
- **Mobile/a11y:** I saw nothing specific.
- **ADAPT:** A step is a list of named visual commands plus a line number. Lesson data is kept separate from renderers, as in our hand-authored state files.
- **NOT COPY:** The server/compile model, the React/Redux UI, and any `algorithms` content (no license).

## 4. mermaid-js/mermaid
- **URL:** https://github.com/mermaid-js/mermaid
- **Pattern:** Text→SVG for flowchart, sequence, state, timeline and more (`packages/mermaid/src/docs/syntax/` lists ~37 diagram docs). It adds `aria-roledescription`, and authors can add `accTitle`/`accDescr`.
- **Files inspected:** `packages/mermaid/package.json` (v12.3.0, `files: ["dist/", …]`), releases list, `docs/syntax/` listing, `docs/syntax/timeline.md`, `docs/config/accessibility.md`.
- **License:** MIT. **Last activity:** commit 2026-11-23, release mermaid@12.3.0 on 2026-11-03 (no release assets).
- **Weight:** 22 runtime deps (d3, cytoscape, katex, elkjs, dompurify…). npm unpacked size is 123.6 MB. `dist/mermaid.min.js` is 5,537,838 bytes and `@mermaid-js/tiny` `mermaid.tiny.js` is 2,852,578 bytes (jsDelivr listing).
- **ADAPT:** Diagram vocabulary only (nodes, edges, lifelines, states), plus the `accTitle`/`accDescr` idea as `<title>`/`<desc>` in our SVG.
- **NOT COPY:** The library. At 2.8–5.5 MB it is far too heavy for a phone portal with a handful of fixed diagrams.

## 5. d3/d3
- **URL:** https://github.com/d3/d3
- **Pattern:** `src/index.js` only re-exports 30 modules (d3-scale, d3-selection, d3-axis, d3-transition…). The library is a set of small composable pieces.
- **Files inspected:** `README.md`, `src/index.js`, release v7.9.2 (2026-11-03).
- **License:** ISC. **Last activity:** 2026-11-23 (docs fix).
- **Weight:** `dist/d3.min.js` 280,622 bytes.
- **ADAPT:** The linear-scale idea (`domain→range`) as a few lines of our own code for the range number line and timeline axis. A keyed update for conveyor items.
- **NOT COPY:** The bundle. Our visuals are fixed and hand-authored.

## 6. visjs/vis-timeline
- **URL:** https://github.com/visjs/vis-timeline
- **Pattern:** Interactive time axis. `lib/timeline/Range.js` binds pan (`panstart/panmove/panend`) and `pinch`/`touch` events through a Hammer-based emitter.
- **Files inspected:** `README.md`, `LICENSE.md`, `lib/timeline/` listing, `lib/timeline/Range.js`.
- **License:** GitHub NOASSERTION. `LICENSE.md` says "Apache-2.0 OR MIT". **Last activity:** 2026-11-25 (dependency bump), release v8.5.6 on 2026-10-26.
- **Weight:** standalone UMD min 548,303 bytes. The peer build needs moment, vis-data, vis-util, hammerjs, uuid, xss and others. The README examples load from unpkg.
- **ADAPT:** Pinch/drag on an axis is not needed. A horizontally scrollable `scroll-snap` list of version cards covers 360px better.
- **NOT COPY:** The library.

## 7. svgdotjs/svg.js
- **URL:** https://github.com/svgdotjs/svg.js
- **Pattern:** Chainable SVG API. `src/animation/Timeline.js` offers `play/pause/reverse/seek/speed/schedule`.
- **Files inspected:** `README.md`, `LICENSE.txt`, `src/animation/` listing, `src/animation/Timeline.js` (method list).
- **License:** GitHub NOASSERTION. `LICENSE.txt` is MIT text, and the README says MIT. **Last activity:** "release 3.2.8" on 2026-08-04.
- **Weight:** `dist/svg.min.js` 93,525 bytes, no dependencies. It is the most vendorable library here.
- **ADAPT:** The seek/speed/reverse vocabulary, which our step engine already covers.
- **NOT COPY:** Not needed. CSS transitions on SVG attributes and classes are enough.

## 8. motiondivision/motion
- **URL:** https://github.com/motiondivision/motion
- **Pattern:** Spring/inertia/keyframe generators (`packages/motion-dom/src/animation/generators/spring.ts`, etc.). `scope/media.ts` maps a `reducedMotion` keyword to `(prefers-reduced-motion: reduce)`.
- **Files inspected:** `README.md`, `packages/` and `motion-dom/src/animation` listings, `motion-dom/src/scope/media.ts`.
- **License:** MIT. **Last activity:** 2026-11-24. No GitHub "latest release". npm `motion` is 14.14.0.
- **Weight:** `dist/motion.js` 191,561 bytes. The npm package depends on framer-motion, with React as an optional peer.
- **ADAPT:** Respect `prefers-reduced-motion` with one shared flag. Use a CSS `cubic-bezier` ease-out for the "conveyor" items.
- **NOT COPY:** The library or spring physics. They are unnecessary for teaching steps.

## 9. EricFinland/graph-algo-visualizer
- **URL:** https://github.com/EricFinland/graph-algo-visualizer
- **Pattern:** A `Graph` class produces `steps[]` (`{type:"visit"|"relax"|"settle", node, dist}`). `render()` draws SVG, and `highlightStep()`/`logStep()` replay the steps with `setTimeout`.
- **Files inspected:** `README.md`, `index.html`, `src/main.js`.
- **License:** none reported, so treat it as all rights reserved. **Last activity:** one commit on 2026-02-15.
- **Weight:** zero dependencies.
- **Mobile/a11y:** Interaction uses mouse events only (`mousedown/mousemove/mouseup`) and `prompt()` for weights. It has a 900px breakpoint. I saw no ARIA.
- **ADAPT:** Typed step records feeding a pure render function plus a text log.
- **NOT COPY:** Code (no license). The mouse-only input. `prompt()`.

## 10. wadekarg/DS-Algo-Playground
- **URL:** https://github.com/wadekarg/DS-Algo-Playground
- **Pattern:** Vanilla IIFE modules on `window.DSA`. `js/code-trace.js` wraps a `<pre>` into `span.code-line[data-line]`, toggles `code-line--active`, scrolls the active line to the middle and renders a variables box (`showVariables`). `js/visualization-core.js` has play/pause/step/back/reset, a speed slider (500 ms default), easeInOut tweens and canvas DPR scaling. `js/quiz.js` is a carousel with labelled prev/next buttons. `js/keyboard.js` handles Space and the arrow keys. There are 30 topic pages.
- **Files inspected:** `README.md`, file tree, `js/code-trace.js`, `js/quiz.js`, `js/visualization-core.js`, `js/keyboard.js`, `js/cdn-loader.js`, `js/pyodide-worker.js`, `css/visualization.css` (grep).
- **License:** MIT. **Last activity:** 2026-08-26.
- **Weight:** CodeMirror is vendored under `vendor/codemirror/` (170 KB js). Pyodide still loads from cdn.jsdelivr.net, so "zero-dependency" is only partly true.
- **Mobile/a11y:** Has a 767px breakpoint and quiz aria-labels. I found no `prefers-reduced-motion` in the core or visualization CSS. Visuals are canvas, so they are invisible to screen readers.
- **ADAPT:** The `data-line` span wrapping with an active class and centred scroll. The variables box. The lesson order (explain → viz → code → quiz). One quiz carousel per lesson.
- **NOT COPY:** Canvas rendering (we use SVG/DOM for accessibility). Pyodide/CodeMirror. Verbatim code: MIT allows it, but our engine already exists.

## 11. reshinto/algo_flow
- **URL:** https://github.com/reshinto/algo_flow
- **Pattern:** Step records are precomputed as `ExecutionStep {index, type, description, highlightedLines[], variables, visualState, metrics}`, and `visualState.kind` selects the renderer. Playback runs on `setInterval(BASE/speed)`, with speeds 0.25–4x and keys Space, ←/→, R and 1–5. On mobile (<768px), `MobileLayout` shows one panel at a time behind a `role="tablist"` switcher (Visualize / Code / Steps).
- **Files inspected:** `README.md`, `package.json`, `src/types/execution.ts`, `src/hooks/usePlaybackEngine.ts`, `src/components/playback/PlaybackControls.tsx`, `src/components/layout/MobileLayout.tsx`, `src/index.css`.
- **License:** MIT. **Last activity:** 2026-04-11.
- **Weight:** React 19, Monaco, mermaid, framer-motion, zustand, react-markdown. Needs a Node 22 build.
- **Mobile/a11y:** A 44px touch zone around a slim range track. `aria-label` on "Playback progress" and "Playback speed". A global `prefers-reduced-motion` rule shortens animations and transitions to 0.01ms. The README claims WCAG 2.1 AA, which I did not verify.
- **ADAPT:** A `description` per step shown as narration (aria-live). `highlightedLines` as an array. Tabs for Visual/Code/Console at 360px. 44px controls. A global reduced-motion rule. Number keys for speed.
- **NOT COPY:** The stack (React/Monaco/zustand). The 40+ StepType union is overkill for us.

---

## Recommendation

**Vendor nothing. Build everything with native SVG, CSS and vanilla JS on our existing step engine.**

- Each planned visual (version timeline, tracer, null-safety toggle, range number line, filter→map→sum conveyor, XML preview) is a fixed, hand-authored scene with a small number of states. None of them needs a layout engine, data joins or physics.
- The candidates are heavy for a phone portal: mermaid 2.8–5.5 MB, vis-timeline 548 KB plus peers, d3 281 KB, motion 192 KB. The only small one is svg.js at 94 KB, and it duplicates what CSS transitions and our engine already do.
- Offline with no CDN rules out the Pyodide, CodeMirror and Google Fonts patterns used by several repos.
- Our own SVG/DOM keeps text accessible, which canvas and generated SVG do not.
- Licensing: we adapt ideas only. That avoids the GPL-3.0 XML previewer and the three repos with no license reported (CodeThrough, algorithms, graph-algo-visualizer).

The one fallback is svg.js (MIT, zero dependencies, ~94 KB) if we later need complex path morphing.

Extend our step schema to `{line, vars, changed[], console[], narration, visual}`. Add a seek slider, a speed control, mobile tabs, 44px targets, aria-live narration and a global `prefers-reduced-motion` rule.
