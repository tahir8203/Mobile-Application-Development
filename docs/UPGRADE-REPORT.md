# MAD Portal — Kotlin + XML Upgrade: Final Report

*26 Nov 2026 · branch `upgrade-kotlin-xml` (17 commits ahead of `main`) · nothing pushed, merged or deployed*

All 16 lectures were rebuilt in place for **Kotlin + XML Views + ViewBinding**. The rest of this report covers:

- what changed, lecture by lecture, with counts
- how everything was verified, and what could **not** be verified
- the result of today's portal check
- the decisions that are yours
- the exact steps to publish

The lecture-by-lecture detail, with every correction to your notes, is in `TEACHER_CHANGELOG.md`.

---

## 1. Totals

| | Before (`main`) | After |
|---|---|---|
| Body slides | 309 | **538** |
| Slides including the automatic title / objectives / Bloom / "In 2026" slides | 373 | **602** |
| Terms with a tooltip (deck definitions) | — | **833** |
| Portal glossary entries | 22 | **588** |
| Interactive widget types in the slide engine | 23 | **63** |
| Cache version | `mad-v9` | **`mad-v19`** (`?v=19` everywhere) |

The 25-slide limit was removed at your request ("topic should be explained in easy wording, nothing not explained").

## 2. Per lecture

The columns:

- **Body old → new:** slides written for the lecture.
- **Total:** body slides plus the 4 automatic ones.
- **Terms:** words with a tooltip.
- **Widget slides:** animations and labs.
- **Code / compare / mistake:** slides built around code.
- **Quiz:** in-deck quiz slides.

| # | Lecture | Body old → new | Total | Terms | Widget slides | Code / compare / mistake | Quiz | Commit |
|---|---|---|---|---|---|---|---|---|
| 1 | Introduction to Mobile Application Development | 19 → 32 | 36 | 73 | 21 | 4 | 4 | `539dec0` |
| 2 | Kotlin Language Fundamentals | 25 → 37 | 41 | 128 | 13 | 19 | 3 | `83f4480`, `616de15` |
| 3 | Android Development Environment & First App | 19 → 35 | 39 | 85 | 18 | 10 | 4 | `a7efe8d` |
| 4 | Android Views — XML + Kotlin | 22 → 32 | 36 | 75 | 13 | 13 | 4 | `595a3f0` |
| 5 | Activities, Intents, GSM & Permissions | 18 → 27 | 31 | 50 | 9 | 12 | 4 | `feab8d2` |
| 6 | Android Permissions | 16 → 28 | 32 | 41 | 11 | 11 | 4 | `cf8ff7a` |
| 7 | Animations, Images & Notifications | 21 → 35 | 39 | 61 | 12 | 17 | 4 | `ac371af` |
| 8 | Android Data Storage | 15 → 30 | 34 | 32 | 11 | 13 | 4 | `6fb5c94` |
| 9 | Activity Life Cycle & Splash Screen | 23 → 39 | 43 | 39 | 18 | 14 | 5 | `c2ad3dd` |
| 10 | Lists, Location & Geocoder | 20 → 40 | 44 | 39 | 12 | 21 | 5 | `b48a830` |
| 11 | SQLite in Android | 19 → 38 | 42 | 39 | 15 | 16 | 5 | `2cfca92` |
| 12 | Firebase in Android | 16 → 40 | 44 | 39 | 13 | 19 | 6 | `33b2ed1` |
| 13 | MySQL, PHP & Android | 21 → 37 | 41 | 41 | 13 | 16 | 6 | `8516927` |
| 14 | Audio Management in Android | 16 → 30 | 34 | 30 | 11 | 11 | 6 | `7b513a6` |
| 15 | Threads in Android | 19 → 29 | 33 | 29 | 10 | 11 | 6 | `92faf00` |
| 16 | Services & Broadcast Receivers | 20 → 29 | 33 | 32 | 8 | 13 | 6 | `e575129` |

### Headline changes per lecture

- **L1:** Android version timeline, the Android Studio tour widget, every term explained.
- **L2:** Kotlin history, null safety and range widgets, code tracers (live variable boxes), the collection conveyor belt.
- **L3:** Empty *Views* Activity (the "Empty Activity" template now creates Compose), the `namespace` in Gradle, `exported` on Android 12+.
- **L4:** a live XML-attribute lab, an AutoCompleteTextView demo, ViewBinding throughout.
- **L5:** the back-stack widget; permissions only previewed (taught in L6).
- **L6:** a deny/allow life-cycle widget; the Activity Result API instead of `onRequestPermissionsResult`; SMS policy; Android 13 media permissions.
- **L7:** a scaleType lab, an animation lab, notifications with POST_NOTIFICATIONS, the Wi-Fi settings panel instead of `setWifiEnabled`, Bluetooth `maxSdkVersion`, the camera with TakePicturePreview.
- **L8:** a live SharedPreferences demo next to the real XML file, a storage chooser, `toIntOrNull`, DataStore, and why EncryptedSharedPreferences is deprecated.
- **L9:** a fixed lifecycle simulator (Android 12+ Back), a rotation / process-death lab, a splash timeline, the SplashScreen API.
- **L10:** a getView recycling lab, a latitude/longitude map, the location flow, fused `getCurrentLocation`, Geocoder with its Android 13 listener.
- **L11:** a Cursor walker, a filter builder with `?` placeholders, a SQL-injection demo, the Database Inspector, Room.
- **L12:** a JSON tree, a two-phone live-sync demo, the auth flow, a Security Rules checker; BoM 35.2.0; the database-URL rule.
- **L13:** a phone → PHP → MySQL → JSON round trip, a table-to-JSON encoder, a thread lab, an XAMPP panel; PHP 8.1 exception handling; cleartext allowed only for 10.0.2.2; AsyncTask (outline) and coroutine versions of the app.
- **L14:** an audio-focus phone, the MediaPlayer state machine, storage drawers, a real browser recorder; a leak-free player; too-short recordings deleted.
- **L15:** freeze vs smooth (ANR), the thread life cycle, a workers slider, a race-condition step-through; all examples run for real; coroutines and WorkManager.
- **L16:** a Service lab (started / foreground / bound), a broadcast lab; a coroutine DownloadService, a foreground MusicService with its type, a complete bound service; export flags.

### Engine additions (`assets/present.js`, `assets/present.css`)

- **Tooltips:** `[[term|label]]`; they open on hover, focus and tap, and close with Esc or an outside tap.
- **New slide kinds and options:**
  - the `try` slide kind
  - glossary chips on summary slides
  - a speed control on every animation
  - `rev` (resets that lecture's saved slide ticks once)
  - `update:false`
- **40 new widgets**, all offline (inline SVG/CSS/JS, no CDN). They respect "reduce motion" and fit 360 px.

---

## 3. How it was verified — and the limits

**Done for every lecture:**

- **Kotlin:** all code compiled with Kotlin 2.2.21 (JDK 17). Android classes were small stand-ins written for each lecture; taps, permissions, lifecycles and system events were simulated. The code tested was always pulled **directly from the slide files**.
- **Real runs:** where the code is plain Kotlin/Java it was **run for real**:
  - L2's Kotlin examples
  - L15's threads, thread pool, race condition and coroutines (kotlinx-coroutines 1.11.0)
  - L13's HTTP code against a local test server
  - L14's file code on real files
- **SQL (L11)** ran on real SQLite (Node's built-in `node:sqlite`).
- **XML and JSON** were checked as well-formed or parsed.
- **Every tooltip term** has a definition, and every Course Outline topic opens the right slide.
- **Browser:** no script errors, and no sideways scrolling at 360 px on any slide.
- **Facts:** every changed fact was checked on developer.android.com, firebase.google.com, php.net, sqlite.org or Google Cloud docs on 26 Nov 2026, with quotes in the slide notes.

**Not verified (please keep in mind):**

- **Not on a real device or emulator.** The stand-ins follow the documentation, but no APK of these examples was run.
- **PHP (L13) was not executed** — there is no PHP or XAMPP on this PC, and nothing was downloaded without your OK. It was checked against the php.net manual, and its behaviour was imitated by the test server.
- **MySQL statements (L13)** were not run; the same logic was run on SQLite.
- **Room (L11), DataStore (L8), WorkManager (L16) and the Firebase SDK (L12):** the code compiles against stand-ins, but those libraries themselves were not run.
- **The in-browser recorder (L14):** its UI and permission-denied path were tested; actual recording needs a microphone and your permission.

---

## 4. Portal check (26 Nov 2026)

| Feature | Result |
|---|---|
| All 16 lectures in presentation mode | ✅ open and reach the summary slide; 602 slides; no script errors |
| Glossary | ✅ 588 entries (e.g. ViewBinding, goAsync) |
| Flashcards | ✅ 588 cards, filter per lecture (L16: 30), flip and "Mark known" work |
| Lecture check → Quiz results | ✅ answering updates the score (1 of 1, 100%) |
| Search | ✅ finds slides, glossary and reading pages (e.g. "Concurrency and parallelism" → L15, "installSplashScreen" → L9) |
| Bookmarks, Certificate, Course outline, Assessments, Android in 2026 | ✅ all open; the certificate stays locked until 16/16 |
| Practice questions (16) and assessments | ✅ reviewed; answers still correct; AsyncTask only where the outline requires it |
| Offline cache | ✅ `sw.js` lists 30 files, all present, all at `?v=19`. ⚠️ The service worker registers only on HTTPS outside localhost (by design), so **offline mode can only be confirmed on the live site** after deploying |
| Remote requests | ⚠️ only the Google Fonts links in `index.html` (they were there before; see decision 3) |

---

## 5. Decisions for you

1. **Version label:** your brief says "v1.1"; the portal currently says "2.0" (`portal-data.js`, README). Which one?
2. **Android 17 status:** AOSP lists Android 17 / API 37 (26Q2); Google's release-notes page shows Beta 4.1. L1 shows it as the newest release — please confirm.
3. **Google Fonts:** `index.html` loads Inter and JetBrains Mono from the internet. Remove them (system fonts) to meet your offline rule?
4. **Saved progress reset:** each rebuilt lecture resets its slide ticks and slide-quiz answers once (lecture completion, bookmarks and the certificate are kept). OK?
5. **minSdk 24:** the course says minSdk 24 everywhere (the splash compat library needs 23+). Keep it?
6. **Template name:** "Empty Views Activity" — please confirm the exact name in the lab PCs' Android Studio.
7. **Lab PCs:** is virtualization enabled for the emulator? If not, students should use phones (the slides say so).
8. **The "3 billion devices" figure (L1)** could not be verified on an official page. Keep it with "about", or remove it?
9. **⚠️ Reading pages still show your original notes.** "Read a lecture" and search use your original HTML notes, stored inside `index.html`. They still contain issues the slides now correct, for example:
   - L8's `toInt()` crash
   - L10's `provider.uppercase()` compile error
   - `usesCleartextTraffic` for all addresses (L8/L13)

   Options:
   - **(a)** keep them as your notes, plus a banner "see the slides / TEACHER_CHANGELOG for 2026 corrections"
   - **(b)** let me apply the same corrections inside the notes
   - **(c)** leave them as they are
10. **Lecture 10's title:** the portal list says "Custom Lists, GPS & Progress"; the slides say "Lists, Location & Geocoder". Which one should both use?
11. **PHP check:** may I download a portable PHP (for this test only) to run L13's `db_connect.php` / `insert.php` / `fetch.php` for real?
12. **Android app (APK):** the APK carries its own copy of the site, so it still has the old lectures until it is rebuilt (step 6 below). Rebuild it as app 2.1?

---

## 6. Publish steps (when you say so)

Nothing below has been run. Vercel deploys **every push to `main`** automatically (`docs/PROJECT-HANDOFF.md`).

1. **Push the branch** (Git Bash, in `Project Source\Mobile-Application-Development`):
   ```bash
   git push -u origin upgrade-kotlin-xml
   ```
2. **Open a pull request** to `main`:
   ```bash
   gh pr create --base main --head upgrade-kotlin-xml --title "Kotlin + XML upgrade of all 16 lectures" --body-file docs/UPGRADE-REPORT.md
   ```
3. **Review the Vercel preview link** on the PR (it needs a Vercel sign-in). Check a few lectures on a phone.
4. **Merge the PR** on GitHub. Vercel deploys `main` to https://mobile-application-development-five.vercel.app within a minute or two.
5. **Check the live site:**
   - open it twice (the new service worker `mad-v19` takes over on the second load)
   - then turn on airplane mode and reload to confirm offline mode
6. **Android app (optional, decision 12):**
   - raise `versionName` in `android/app/build.gradle.kts` (e.g. "2.1")
   - run `bash android/build-local.sh 3`; the output is `APK\MAD-Course.apk`, signed with the release key
   - publish it:
     ```bash
     gh release create app-v2.1.0 "/d/Fall 2026/Mobile App Development/APK/MAD-Course.apk" --title "MAD Course app 2.1" --notes "All 16 lectures upgraded to Kotlin + XML"
     ```
     The website's download button always points to the latest release.

*GitHub Actions is blocked on this account (billing), so builds stay local.*

---

## 7. Files touched

- `assets/slides/l01.js` … `l16.js`
- `assets/present.js`, `assets/present.css`
- `assets/portal-data.js` ("In 2026" lines)
- `assets/course-data.js` (outline links)
- `index.html` (glossary, cache version)
- `sw.js`
- `TEACHER_CHANGELOG.md`, `THIRD_PARTY_NOTICES.md`, `docs/REPOSITORY_RESEARCH.md`
- this report

Screenshots: `D:\Fall 2026\Mobile App Development\Lecture1-screenshots` … `Lecture16-screenshots`.
