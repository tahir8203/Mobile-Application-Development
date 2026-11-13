# MAD Course: Web Portal + Android App — Complete Handoff

Last updated: 13 November 2026
Owner / instructor: Muhammad Tahir Mehmood (GitHub: `tahir8203`)

> **New Claude account or new chat?** Read `docs/START-HERE.md` first. It has the exact message to paste.
>
> This file is kept in two places: `docs/PROJECT-HANDOFF.md` in the GitHub repository and
> `D:\Fall 2026\Mobile App Development\MAD-PROJECT-HANDOFF.md` on the instructor's laptop. Paths starting with `D:\` are on that laptop.

This file is the single source of truth for the project. Everything below reflects the final state at the end of the
first Claude account's work. The full chat history is in `docs/CHAT-HISTORY.md` (repository) and `Chat History\` (laptop).

---

## 1. What is in this folder

`D:\Fall 2026\Mobile App Development\`

| Path | What it is |
|---|---|
| `START-HERE.md` | What to give a new Claude chat so it can continue |
| `MAD-PROJECT-HANDOFF.md` | This file |
| `MAD Course Outline.pdf` | Official course outline (CSCP-4063). Scanned: text extraction fails, read it as page images |
| `Project Source\Mobile-Application-Development\` | The full website + Android source, a git clone with all branches, on `main` |
| `APK\MAD-Course.apk` | **Android app 2.0** (968 KB), signed with the release key. This is the current app |
| `APK\MAD-Course-v1.0.apk` | Old app 1.0 (debug key). Kept only for reference |
| `android-signing\mad-course-release.p12` | The app's **permanent signing key** (alias `mad-course`) |
| `android-signing\KEYSTORE-PASSWORD.txt` | Its password |
| `android-signing\debug-v1.keystore` | Backup of the debug key that signed v1.0 |
| `Chat History\conversation.md` | Readable record of the whole chat: every request and every reply |
| `Chat History\session-transcript.jsonl` | The raw Claude Code transcript (machine-readable, 18 MB) |

**Back up `android-signing\` somewhere safe (USB / Google Drive).** Losing it means students cannot update the app;
they would have to uninstall and reinstall. Never put it in git.

Outside this folder on the laptop:
- `D:\MADBuildTools\` (about 7.8 GB): JDK 17, Gradle 8.11.1, Android SDK 35, plus an emulator and Android 11 image
  (about 2 GB) that never booted on this PC and can be deleted (`sdk\emulator`, `sdk\system-images`, `avd`, `emu-home`).
- `C:\Users\Hameed Computers\Downloads\MAD-Course.apk`: a copy of the 2.0 APK.

---

## 2. Links and accounts

| Item | Link |
|---|---|
| Live website | https://mobile-application-development-five.vercel.app |
| GitHub repo (public) | https://github.com/tahir8203/Mobile-Application-Development |
| APK download (public, used by the website button) | https://github.com/tahir8203/Mobile-Application-Development/releases/latest/download/MAD-Course.apk |
| Release page | https://github.com/tahir8203/Mobile-Application-Development/releases/tag/app-v2.0.0 |
| Vercel project | team `tahirs-projects-44e2c3df`, project `mobile-application-development`. Every push to `main` deploys automatically |

- **GitHub:** the `gh` command on this laptop is logged in as `tahir8203`. That login belongs to the laptop, not to the
  Claude account, so a new Claude account can still push, open PRs and publish releases from here.
- **Vercel:** deploys come from GitHub, so no Vercel login is needed to publish. Preview links of pull requests need a
  Vercel sign-in to view; the new Claude account may need its Vercel connector connected again to read deployments.
- **GitHub Actions is blocked:** the GitHub account is locked over a billing issue. Fix it at
  https://github.com/settings/billing if cloud builds are wanted. The local build works without it.
- Repo-local git identity: `tahir8203` / `tahir8203@users.noreply.github.com`.

### Pull requests (all done)

| PR | What | State |
|---|---|---|
| #1 | Presentation Mode, 16 slide decks, navy/blue redesign | Merged |
| #2 | Alignment with the official course outline | Open but **redundant**: all its commits are in #3. It can be closed |
| #3 | Portal 2.0 + Android app 2.0 (includes #2 and the Android project) | **Merged** 13 Nov 2026, commit `9aaa01f`, live and checked |

---

## 3. Course facts (from the official outline)

- **Course:** CSCP-4063 Mobile Application Development, BSCS, 3 credit hours, 16 weeks / 32 sessions, prerequisite Object-Oriented Programming.
- **Instructor details used on the site:** Muhammad Tahir Mehmood, MPhil Computer Science, 10+ years teaching; Principal (Government School),
  Visiting Lecturer, Punjab College Okara, University of Okara.
  (The Compiler Construction site uses newer titles: Lecturer UCP Okara, Headmaster GES 53/2-L Okara, Assistant Director (P&D) DEA Okara.
  Not yet applied here; ask the instructor.)
- **Learning outcomes:** CLO-1 to CLO-5, each linked to lectures and the project.
- **Assignments:** 1–4 in Weeks 3, 6, 11, 14. **Quizzes:** 1–4 in Weeks 4, 7, 12, 15.
- **Exams:** Week 8 revision, Week 9 mid-term, Week 16 project evaluation, Week 17 final.
- **No marks or weightage are invented.** Week 1 says the division of marks is announced by the instructor.

---

## 4. The website (web portal)

Static site, no build step. Open `index.html` directly to use it offline, or serve the folder.

### Features
- **Dashboard home:** greeting, week of the semester (from the start date in Profile), progress ring, XP level, streak,
  continue card, this week's topics, question of the day, coming assessments, tip of the day, badges, animated phone.
- **App shell:** bottom tab bar under 900 px (Home, Learn, Practice, Labs, Me), back button and page title, page transitions,
  confetti on completing a lecture. Compact top bar on desktop.
- **16 lectures** in reading mode (original content, inside iframes), with bookmarks, search, completion and certificate.
- **Presentation Mode:** 16 decks, **373 slides**, built-in animations, Watch mode, presenter notes, overview, presenter window, swipe.
  Every deck has a Bloom's Taxonomy slide (Head / Heart / Hand) and an "In 2026: what changed" slide. Tall slides shrink to fit.
- **Course Outline** (`#outline`): course facts, CLOs, books, the 17-week calendar; all 121 topics link to their slide.
- **Assessments** (`#assessments`): Assignments 1–4, Quizzes 1–4 with scoring, mid-term and final mock exams with model answers, project guide with rubric.
- **Practice** (`#quiz`): Quick 10, Mid-term drill, timed Final drill, My mistakes, one-lecture drills, 50 viva questions.
- **Labs** (`#labs`): eight simulators (Activity lifecycle, Intent builder, Layout lab, Permission helper, SQL playground,
  Notification builder, Main thread vs background, dp to px) and a library of all 146 slide animations.
- **Resources** (`#sheets`): six cheat sheets, 22 common errors with fixes, 12 project ideas, official links.
- **Android in 2026** (`#modern`): each outline API next to what teams use today, old/new code side by side, Play publishing notes.
- **Profile** (`#me`): name, roll number, semester start date, stats, badges, theme, backup and restore of progress, reset, share.
- Glossary, flashcards, lecture check, quiz results, certificate (original features, kept).
- **Installable web app** with offline cache (`manifest.webmanifest`, `sw.js`).

### Presentation keys
→ / Space next · ← previous · Home / End · number + Enter jump · F fullscreen · Esc exit · N notes · O overview ·
S / P / R step, play, reset animation · L light/dark slides · **W Watch mode**

### Routes (URL hash)
`#home`, `#learn`, `#lecture-N`, `#present/N/S`, `#quiz`, `#quiz/quick|mid|final|wrong`, `#quiz/lec/N`, `#quiz/viva[/N]`,
`#labs`, `#labs/<lifecycle|intent|layout|perm|sql|notify|thread|dp>`, `#labs/anim/L/S`, `#sheets[/cheat/<id>|/errors|/projects|/links]`,
`#modern`, `#me`, `#outline`, `#assessments`, `#glossary`, `#flashcards`, `#bookmarks`, `#practice`, `#results`, `#certificate`.

### Files
```
index.html              Original course app (lectures embedded as base64, glossary, quizzes, certificate), ~1.8 MB
assets/theme.css        Design system: navy / electric blue / cyan
assets/present.css      Presentation and animation styles
assets/present.js       Presentation engine, 24 animation types, Watch mode, Bloom and "In 2026" slides, fit()
assets/slides/l01–l16.js  One deck per lecture: MAD.deck(n, {title, subtitle, objectives, bloom, slides})
assets/course-data.js   window.MAD_COURSE: outline, weeks, assignments, quizzes, mock exams, project guide
assets/course.js        Outline and Assessments pages
assets/portal-data.js   window.MAD_PORTAL: levels, tips, per-lecture 2026 updates, modern page, cheat sheets, errors, viva, projects, links, APK URL
assets/portal.js        Portal shell, dashboard, learn filter, practice hub, resources, modern page, profile (window.MADPortal)
assets/labs.js          window.MADLabs: the eight simulators and the animation library
assets/portal.css       Portal styles (.pzv gives slide widgets their colours outside presentations)
assets/icons/           App icons. assets/instructor.webp: instructor photo
manifest.webmanifest, sw.js   Installable web app and offline cache
.vercelignore           Keeps android/ and .github/ off the website
```

### How the code fits together
- Script order: portal-data, present, course-data, course, labs, portal.
- `CourseApp` and `LECTURES` are top-level consts in index.html (not on `window`).
- Wrapping order of `CourseApp.route` / `showView`: present.js, then course.js, then portal.js (outermost).
- **localStorage keys:** `madCompleteCourseV1` (original), `madPresentationV1` (slides, slide quizzes, tasks),
  `madAssessV1` (Assessments page), `madPortalV1` (profile, streak, XP, practice results, viva ratings).
- XP: lectures ×100, slides seen ×3, correct answers ×10, tasks ×25, labs ×20, quiz bonuses. One level = 450 XP.
- **Rule when any file in `assets/` changes:** raise `?v=N` (now **v=2**) in index.html, in `loadDeck` in present.js, and in `sw.js`
  (`VERSION` and its file list), so browsers and the offline cache load the new files.
- **Rule:** the site must never claim Android code runs in the browser. Labs and animations are labelled as simulations.

### Testing done (final state)
- Every route at 1366×768 and 375×812: no console errors, no sideways scrolling.
- All 373 slides at 1366×768: no errors, none needs scrolling (14 are scaled to fit).
- Every quiz mode, all eight labs, the SQL playground, profile and week tracker exercised in the browser.
- The live site was checked after the PR #3 merge: dashboard, tabs, practice, labs, outline and slides load with no console errors.
- **Not tested:** real fullscreen and the presenter window (need a real click); the service worker's offline behaviour on the live site.

---

## 5. The Android app (mobile portal)

| | |
|---|---|
| Name | MAD Course |
| Package | `com.mtahir.madcourse` |
| Version | **2.0** (versionCode 2) |
| Android | 8.0 (API 26) and newer; target and compile SDK 35 |
| Permissions | None. Fully offline |
| APK | `APK\MAD-Course.apk`, 968 KB, also published as GitHub release `app-v2.0.0` |
| Signing | Release key `android-signing\mad-course-release.p12`, alias `mad-course`, certificate SHA-256 `d93b7eef…0216` (CN=Muhammad Tahir Mehmood) |

**Version 1.0 used a different (debug) key: anyone with 1.0 installed must uninstall it before installing 2.0.**

### How it works
- Native Kotlin app, one Activity with a WebView. At build time the Gradle task `copyCourseSite` copies `index.html` and `assets/`
  into the APK, removes the Google Fonts links, and adds `app/android.css` and `app/android.js`. So the app always ships the same content as the website.
- Pages are served from `https://appassets.androidplatform.net/assets/www/index.html` with `WebViewAssetLoader`.
- Page ↔ app messages go through `WebViewCompat.addWebMessageListener` (`window.MADApp`), JSON types:
  `save`, `print`, `printHtml`, `keepAwake`, `open`, `toast`, `haptic`, `share`, `theme`.
  `android.js` exposes `window.MADNative` (`haptic`, `share`, `setTheme`) to the portal.

### What the app adds
Splash screen and adaptive icon; Android back button (closes fullscreen, dialogs, menus, presentation and sidebar first, then pages,
press twice to exit); real fullscreen for slides; screen stays on while presenting; print / Save as PDF for the certificate;
code examples saved to `Downloads/MAD Course`; outside links open in the browser; haptic feedback; status bar follows light/dark theme;
share sheet; file picker for "Restore from backup"; launcher shortcuts (Lectures, Practice, Labs); deep links `madcourse://open#<route>`.

### Android files
```
android/app/build.gradle.kts         Versions, signing (env vars), copyCourseSite task
android/app/src/main/AndroidManifest.xml
android/app/src/main/java/com/mtahir/madcourse/MainActivity.kt   All native code
android/app/src/main/assets/www/app/android.js / android.css      Bridge and app-only styles
android/app/src/main/res/            Theme, strings, icon, shortcuts (res/xml/shortcuts.xml)
android/build-local.sh               Local signed build (see below)
android/ci/smoke-test.sh, .github/workflows/android.yml   Cloud build + emulator test (blocked by GitHub billing)
```
Versions: AGP 8.7.3, Kotlin 2.0.21, Gradle 8.11.1, JDK 17, core-ktx 1.15.0, activity-ktx 1.9.3, webkit 1.12.1, core-splashscreen 1.0.1.

### Build a new APK (on this laptop)
Git Bash, inside `Project Source\Mobile-Application-Development`. The number is the new versionCode; raise it every release:
```bash
bash android/build-local.sh 3
```
It uses `D:\MADBuildTools`, signs with the release key, and writes `D:\Fall 2026\Mobile App Development\APK\MAD-Course.apk`.
The tools live in `D:\MADBuildTools` because the Android SDK manager fails on paths with spaces (`C:\Users\Hameed Computers`).
Also raise `versionName` in `android/app/build.gradle.kts` (now "2.0").

### Publish a new version for students (ask the instructor first, every time)
```bash
gh release create app-v2.0.1 "D:/Fall 2026/Mobile App Development/APK/MAD-Course.apk" -R tahir8203/Mobile-Application-Development --target main --title "MAD Course app 2.0.1" --notes "What changed..."
```
The website's Download button always points to the latest release, so it updates automatically.

### Testing done
- APK builds, signature verifies, package/SDK/permissions correct, portal files inside, bundled pages pass in a browser with a stand-in for the native bridge.
- The published download link serves the identical file.
- **Not tested on a real phone or emulator.** This laptop has no hardware acceleration, so the emulator never booted. The instructor is to test on a phone.

---

## 6. Pending work

1. **Install `APK\MAD-Course.apk` on a phone and test:** home in airplane mode, a presentation with swipe, fullscreen and back,
   Watch mode, a lab, a quiz, Download on a code slide, certificate print, back twice to exit, the theme switch, long-press shortcuts.
2. Close PR #2 on GitHub (redundant).
3. Optional: apply the newer instructor titles from the Compiler Construction site, if the instructor wants.
4. Optional: fix GitHub billing so the cloud build and emulator test run on every change.
5. Optional: delete the unused emulator files in `D:\MADBuildTools` (about 2 GB).
6. Optional: update `docs/UPGRADE-BRIEF.md` in the repo (it describes only the first upgrade).

## 7. Known limitations

- Saved slide positions for students who used Presentation Mode before the new slides were added may be off by one or two slides.
  Completion, bookmarks and certificates are not affected.
- The website has no visible "Print lecture" button, so the app's lecture-printing support is unused.
- `SEND_SMS`, Wi-Fi/Bluetooth toggling, `AsyncTask` and `ProgressDialog` are taught because the outline asks for them; each slide says what replaced them.

## 8. Problems already solved (don't repeat them)

- Scanned outline PDF: read pages as images (PyMuPDF/fitz at 110 dpi).
- Android SDK manager fails on paths with spaces → tools in `D:\MADBuildTools`.
- GitHub Actions blocked by billing → local build script.
- The emulator needs hardware acceleration; it does not boot on this laptop.
- Vercel preview pages need a Vercel login; the vercel.live toolbar throws errors on synthetic keydown events sent to `document` (send them to `document.body`).
- A shared `.cq-o` class made two click handlers fire; course.js now matches only `.cq .cq-o`.
- Claude Code's safety check refuses to merge PRs and publish releases unless the instructor asks for it in the chat.

## 9. Working rules from the instructor

- Never claim Android code runs inside a browser.
- Don't claim something is deployed or live unless it was checked.
- No placeholder content. Keep existing features working.
- Don't stop after writing a plan; do the work.
- Push, merge and publish releases when the instructor asks (the instructor said "push", "merge it", "publish it" for each).
- Same engine and Bloom's Taxonomy format as the sister courses: Compiler Construction (`D:\Fall 2026\Compiler`, repo `tahir8203/Compiler-Construction`)
  and Applications of ICT (`D:\Fall 2026\ICT`, repo `tahir8203/Applications-of-ICT`).
