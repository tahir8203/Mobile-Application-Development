# Teacher changelog: Kotlin + XML upgrade

Branch `upgrade-kotlin-xml`. Rollback point: tag `pre-upgrade` (= `main` at commit `61a574a`).
Nothing has been pushed or deployed. One commit per lecture.

## How outputs were verified

- Every program output shown on a slide was produced by a **real Kotlin compiler** (Kotlin 2.2.21, `kotlin-compiler-embeddable` from the Gradle cache on this laptop, run on JDK 17 in `D:\MADBuildTools`).
- A check script loads the deck file, pulls out every `code` slide with `fun main`, every tracer program and every "Try it" answer, then compiles and runs each one. It compares the result character by character with the output on the slide.
- **Lecture 2 result: 27 / 27 programs match.** The grade tracer was compiled for marks 0, 60, 80, 85, 90, 95 and 100.
- **Compiler errors** shown on slides ('val' cannot be reassigned, null into String, `.length` on `String?`, private setter) are the real messages from Kotlin 2.2.21.
- **Tracer states** (line, variables) are hand-authored step by step. Each tracer's console output was compiled and matches.
- **Android-only code** (the Bridge slide) cannot run outside Android. It was type-checked with the real compiler against small stand-in classes (AppCompatActivity, ActivityMainBinding, TextView, Button, Intent). The XML was checked as well-formed, and its ids match the binding fields.

## Engine changes (`assets/present.js`, `assets/present.css`)

All changes are additive and every old deck still works.

- **New animation widgets:**
  - `timeline`: tap a dot or step through it.
  - `tracer`: current line, variables box with changed values highlighted, and a console; an optional input slider regenerates the steps.
  - `nullsafe`: toggle the value between "Ali" and null.
  - `range`: a 0..20 number line with start, kind, end and step inputs.
  - `conveyor`: filter → map → sum.
  - All of them use the existing Play / Back / Step / Reset model, so **S / P / R** and Watch mode work. They also appear in Labs → Animation library.
- **Speed control** (0.5× / 1× / 2×) added to every animation bar.
- **Tooltips:**
  - In deck text, `[[term]]` or `[[term|shown text]]` becomes a tooltip.
  - It opens on hover (mouse), on focus (keyboard) and on tap (touch), and closes on a tap outside or Esc. Esc closes the tooltip first, not the presentation.
  - Definitions come from the deck's `terms`, then from the course glossary.
- **New slide kind `try`:** exercises with a 💡 Hint and a ✅ Answer, using native `<details>` so they are keyboard accessible.
- **Glossary chips:** a `summary` slide can list glossary words as tap/hover chips.
- **New deck options:**
  - `update:false` skips the automatic "In 2026" slide (not used any more; the 25-slide limit was removed).
  - `rev:'…'`: when a deck is rebuilt, saved slide positions, "seen" ticks and slide-quiz answers for **that lecture only** are reset, so old positions no longer point at the wrong slides. Lecture completion, bookmarks and certificates are not touched.
- **Fixes:**
  - Bold text inside bullet points was drawn as a number bubble (`.pz-list li b` changed to `li>b`).
  - Inline code in takeaway boxes broke into vertical letters.
  - Code fonts turned `<=` / `->` / `!=` into ligature symbols (≤ → ≠). Ligatures are now off in code, so students see exactly what to type.
  - At phone width the "LECTURE 02" label overlapped the slide counter.
  - **Old bug:** the "variable" animation (labelled box) never appeared, because its options used the key `type` twice. The data type is now `dtype`. Its error text now matches Kotlin 2.2: *'val' cannot be reassigned*.
- **Cache:** `?v=5` everywhere, and the service worker cache is now `mad-v5`.
- **New widget `studio` (added with Lecture 1):** a simplified Android Studio window — Project panel, code editor, Layout Editor, device menu, Run button and Logcat. Each step highlights one area and dims the rest. It will be reused in Lecture 3.

## Lecture 1: Introduction to Mobile Application Development

**Slides: 23 → 36.** That is 32 body slides plus the automatic title, objectives, Bloom and "In 2026" slides. Baseline: your "Intro to Mobile App Dev Lecture.pdf" (16 pages) and "Lecture 1.pdf" (8 pages, images only — read as pictures).

### What changed

- **Kotlin + XML, not Compose.** The old deck taught Jetpack Compose in 3 places: the `@Composable` code on the comparison slide, the toolbox card and the roadmap. Now:
  - the comparison slide shows an XML layout vs HTML
  - the toolbox lists XML, ViewBinding and ADB
  - the roadmap lists XML + Material Components + ViewBinding
  - Compose appears only as "a good next step after this course" (roadmap and "In 2026" slide)
- **New slides from your PDF that the portal was missing:**
  - why people prefer apps
  - careers
  - web apps (as their own type)
  - Java → Kotlin history
  - the Android Studio tour
  - "UI design ≠ app logic" (XML vs Kotlin, with a live phone)
  - the food-delivery decision slide
- **New slides to explain words that were used but never taught:**
  - what an operating system is
  - the app sandbox
  - your first look at an Android screen (MainActivity, onCreate, setContentView, Log.d / Logcat)
- **Android history:** one short preview slide (6 versions), pointing to the full interactive timeline in Lecture 2. It is not repeated.
- **73 defined terms** (70 of them used as tooltips on the slides), each with a plain meaning, why it exists and an analogy where possible. Examples: APK, AAB, DEX, HAL, ART, ADB, AVD, SDK, IDE, Gradle, Logcat, sandbox, WebView, PWA, Jetpack, ViewModel, Room, Retrofit, WorkManager. 46 of them were added to the portal glossary, which now has 150 terms.
- **Course Outline links:** "Brief introduction of Android OS" now opens "What is Android?", and "Brief introduction of Android Studio" opens the Android Studio tour.

### Verification

- **Kotlin:** "Welcome to Mobile App Development!" was compiled and run with Kotlin 2.2.21.
- **Android screen code:** type-checked with stand-in Android classes. It prints the Logcat line shown on the slide.
- **XML:** the comparison XML is well-formed. The XML on the live-phone slide is a short teaching fragment; its caption says that real files also need a width and height on every view.
- **Browser tests:**
  - All 36 slides open with no errors, and every animation steps to the end.
  - No slide scrolls sideways at 360px.
  - Lecture 2 and all portal pages were re-tested after the engine change.

### Corrections to your PDF

1. **"3B+ Android users":** Google's own figure was about **active devices**, not users: "more than 3 billion active Android devices", announced at Google I/O in May 2021. **UNVERIFIED** — I did not find the official page this session. A secondary source (Wikipedia) now says about 4 billion users. The slide avoids an exact number; the notes give the figure with "please confirm".
2. **Architecture:** your PDF shows 4 layers (Apps, ART, Libraries, Kernel). The official Android diagram has 6: it adds the Hardware Abstraction Layer and the Java API Framework. The slide uses 6 and keeps your university analogy.
3. **Version table:**
   - Oreo's main developer change was notification channels and background limits, not only "faster performance".
   - Android 11 = conversation bubbles **and** one-time permissions.
   - Android 13 = notification permission + photo picker.
   - The table stopped at Android 14; Android 15, 16 and 17 have since been released.
4. **Web apps "require internet":** true for most, but Progressive Web Apps can work offline. This portal is one.
5. **Facebook as a native example:** the Facebook app is mostly native, but Meta also uses its own React Native in parts. WhatsApp is used instead.
6. **"Uber (older versions) was Hybrid":** I could not confirm this from a reliable source, so it is not used.
7. **Flutter vs React Native "Performance: High vs Moderate":** both can be fast today; it depends on the app. The slide does not rank them.
8. **Java "by Sun Microsystems":** correct originally, but Oracle owns Java today. This is in the notes.

## Lecture 2: Kotlin Language Fundamentals

**Slides: 29 → 41.** That is 37 body slides plus 4 automatic ones: title, objectives, Bloom and "In 2026". You removed the 25-slide limit and asked that nothing be left unexplained, so:

- **Every dense slide was split into one idea per slide.** New slides:
  - minSdk / targetSdk / compileSdk (with the Gradle file)
  - how a Kotlin program runs (write → compile → run → output)
  - variables (animated box)
  - data types (7 cards)
  - operators
  - while / do-while / break / continue
  - functions: shortcuts (defaults, named arguments, Unit)
  - lists and arrays (animated)
  - lambdas
  - classes and objects
  - constructors
  - secondary constructors
  - **inheritance and polymorphism**
  - **object and companion object**
  - the XML layout explained line by line
  - the Kotlin Activity explained line by line
  - two classic mistakes
- **Every technical word a student sees is now explained.** A script lists every CamelCase word, acronym and code word on the student-facing parts of each slide. Each one is either explained in the sentence or has a tooltip. There are 123 tooltip words on the slides, and all have plain-English definitions (meaning + why + analogy where possible).
- **The "In 2026" slide is back**, with tooltips for the K2 compiler and coroutines.
- **Glossary:** 104 terms now (44 new from Lecture 2), so they are also in Glossary, Flashcards and search.

### Corrections to your PDF (Lecture_2.pdf, 11 pages)

1. **The symbols were not lost.** The PDF's text layer has `//`, `>=`, `<=`, `==`, `&&`, `->`, `..`, `++` and `%` intact, so no restoring was needed. Every snippet was re-typed and compiled anyway.
2. **Loop outputs are printed one per line**, not "1, 2, 3":
   - `while (i <= 3) { println(i) … }` prints `1`, `2`, `3` on three lines.
   - The same applies to the `for (i in 1..5)`, `1 until 5` and `10 downTo 1 step 2` examples (`println`, not `print`).
3. **"val ensures list reference cannot change" is incomplete.** `val` means the name cannot be re-assigned. If the list is a `MutableList`, its contents can still change. `listOf` is read-only (it has no `add`). `arrayOf` is fixed-size, but its items can be replaced. All of this is now shown with compiled code.
4. **Null safety was promised on the title slide but never taught.** Two slides were added: why null crashes apps, and `?.` / `?:` / `let` / `!!` with an interactive toggle.
5. **The "Encapsulation example" was not encapsulated.** `class BankAccount(var balance: Double)` lets any code write `acc.balance = 1_000_000.0`. It now uses `private set`, and `withdraw` reports a rejected overdraw instead of silently doing nothing.
6. **The Employee secondary-constructor example printed nothing** and used `val e1`/`e2` without using them. A `println` was added and verified. A note was also added: in Kotlin, a primary constructor with a default value (`class Employee(var name: String, var salary: Double = 0.0)`) is preferred.
7. **"Delegation to primary constructor"** (Use Cases box) does not apply to your Employee class, because it has no primary constructor. Delegation with `: this(...)` is only required when a primary constructor exists.
8. **The Data types slide listed only Int, Double, String and Boolean.** Long, Float and Char were added, plus the Int-division trap (`5 / 2 = 2`, `5 / 2.0 = 2.5`) and `toInt()`.
9. **"Functional Programming Support"** was listed as a key feature but never explained. Lambdas and `it` are now defined before `filter` and `map` use them, and the filter → map → sum conveyor (result 140) is verified.
10. **Old portal L2 slides removed or replaced:**
    - "Mistake: comparing strings in Java style" had no string comparison in it.
    - "Loop variations" and "while and do-while loops" overlapped; they are merged into the loop tracer and the Ranges explorer.
    - Inheritance, polymorphism, object and companion object now have their own slides in this lecture.

### Terms added (each with plain meaning + why + analogy, as tooltips and in the portal Glossary/Flashcards)

API level, SDK, Open Handset Alliance, Dalvik, ART, Material Design, runtime permission, notification channel, scoped storage, minSdk, targetSdk, compileSdk, Android Studio, Kotlin Playground, function, main(), println, comment, string template, variable, val, var, type inference, data type, null, NullPointerException, nullable type, safe call, Elvis operator, let, expression, when, range, loop, parameter, return type, Unit, lambda, it, List, MutableList, Set, Map, Array, index, class, object, property, constructor, init block, encapsulation, data class, XML layout, View, ViewBinding, findViewById, Activity, Intent, lateinit, compiler.

That is 59 tooltip terms in the deck, and 38 new entries in the portal glossary (it now has 60).

### New animations and demos

- Two **history timelines**: 13 + 13 stops, each with a version, API level, year, one change, and "for app developers".
- **Grade tracer** with a marks slider.
- **Sum-loop tracer.**
- **BankAccount tracer** (17 steps, including the rejected overdraw).
- **Null-safety toggle.**
- **Ranges explorer.**
- **filter → map → sum conveyor.**
- **Function machine** (existing widget).
- **Try it yourself:** FizzBuzz, temperature converter, BMI. Each has a hint and a verified answer.
- **Three quiz questions:** one predict-the-output, one null, one range. They feed the Practice pool automatically.
- **Recap + glossary chips.**

### Course Outline links

The 12 Lecture 2 topics in `course-data.js` were re-pointed to the new slide titles. All 12 resolve; checked on the Outline page.

### Android history sources (accessed 26 Nov 2026)

| Fact | Source | Type |
|---|---|---|
| Codename ↔ version ↔ API level for every row (1.0 → 17, API 1 → 37) | AOSP "Codenames, tags, and build numbers": https://source.android.com/docs/setup/reference/build-numbers | Official |
| Android 16 = API 36 … Android 2.3 = API 9 (SDK platform list) | https://developer.android.com/tools/releases/platforms | Official |
| Android 14: foreground service types required | https://developer.android.com/about/versions/14/changes/fgs-types-required | Official |
| Android 15: edge-to-edge enforced for apps targeting 35 | https://developer.android.com/about/versions/15/behavior-changes-15 | Official |
| Android 16: orientation/resizability ignored on large screens for apps targeting 36 | https://developer.android.com/about/versions/16/behavior-changes-16 | Official |
| Android 17: app memory limits, background-audio hardening, "adaptive-first" | https://developer.android.com/about/versions/17 and /17/release-notes | Official |
| Android 13: notification permission; photo picker | https://developer.android.com/develop/ui/views/notifications/notification-permission · https://developer.android.com/training/data-storage/shared/photopicker | Official |
| Android 12: SplashScreen API | https://developer.android.com/develop/ui/views/launch/splash-screen | Official |
| Android 11: one-time permissions; Android 6.0: runtime permissions | https://developer.android.com/training/permissions/requesting | Official |
| Android 10: dark theme; scoped storage | https://developer.android.com/about/versions/10/features · https://developer.android.com/about/versions/10/privacy/changes | Official |
| Android 8.0: notification channels; background limits | https://developer.android.com/develop/ui/views/notifications/channels · https://developer.android.com/about/versions/oreo/background | Official |
| Android 7.0: multi-window | https://developer.android.com/guide/topics/ui/multi-window | Official |
| Android 6.0: Doze | https://developer.android.com/about/versions/marshmallow/android-6.0-changes | Official |
| Android 5.0: ART replaces Dalvik | https://developer.android.com/about/versions/lollipop/android-5.0-changes | Official |
| Release **years** for every version; Android 17 released 16 Jun 2026; internal names for 10–17 | Wikipedia "Android version history" (cites Google blog posts) | Secondary |
| Android Inc. founded Oct 2003; Google bought it Jul 2005; Open Handset Alliance 5 Nov 2007; HTC Dream announced 23 Sep 2008 | Wikipedia "Android (operating system)" | Secondary |
| Feature notes for Cupcake → KitKat (widgets, screen sizes, Froyo JIT, NFC, Honeycomb tablets/Fragments, ICS Holo, Project Butter, Project Svelte) | Wikipedia "Android version history" | Secondary |
| Pie: start of gesture navigation | Wikipedia "Android version history" | **Secondary only (not found on an official page)** |

### Open questions for you (Lecture 2)

1. **Android 17 status.**
   - AOSP's table lists Android17 / API 37 with quarterly release "26Q2", and Wikipedia says it was released on 16 Jun 2026.
   - Google's developer release notes page only shows up to Beta 4.1 (June 2026).
   - The slide shows it as the newest release. Please confirm on a Pixel or on developer.android.com.
2. *(Resolved: inheritance, object and companion object are now taught in Lecture 2.)*
3. **Version label.** Your brief asks for "v1.1", but the portal is currently version "2.0" (`portal-data.js`, README "Portal 2.0"). Which label do you want?
4. **Remote fonts.** `index.html` still loads Google Fonts from the internet (this was already there before the upgrade). Your offline rule says "no remote fonts". Should I remove them and use system fonts?
5. **Saved progress reset.** Students who already opened Lecture 2 slides will see its slide ticks and slide-quiz answers reset once (lecture completion is kept). Is that OK? The same will happen for each upgraded lecture.
6. **minSdk.** The notes say "this course uses minSdk 24", following Lecture 3. Keep 24?
