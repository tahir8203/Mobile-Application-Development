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
- **Cache:** `?v=10` everywhere, and the service worker cache is now `mad-v10`.
- **New widget `studio` (added with Lecture 1):** a simplified Android Studio window — Project panel, code editor, Layout Editor, device menu, Run button and Logcat. Each step highlights one area and dims the rest. It will be reused in Lecture 3.

## Lecture 7: Animations, Images & Notifications (+ Wi-Fi, Bluetooth, camera)

**Slides: 25 → 39.** That is 35 body slides plus the automatic title, objectives, Bloom and "In 2026" slides. Baseline: your "Lecture 7.docx". The slides keep its order: images → animations → notifications → Wi-Fi → Bluetooth → camera, ending with your "App → Permission → System service → Hardware → Result → Screen" model.

### What changed

- **Compose removed** (the old "Animation in Compose" slide). Every screen uses ViewBinding.
- **Two new live widgets:**
  - **scaleType lab** (`scaletype`): one wide picture in a square ImageView, with centerCrop / fitCenter / centerInside / fitXY. The browser uses the matching CSS rules (cover / contain / scale-down / fill).
  - **Animation lab** (`animlab`): choose alpha / translate / scale / rotate and a duration. It shows the exact res/anim XML and plays it, with a live timer. With "reduce motion" on, it shows only the end state.
- **New slides:**
  - image formats, including vector drawables
  - naming rules
  - adding an image
  - common image mistakes
  - view animation vs property animation (`view.animate()`)
  - notification types
  - how a notification travels
  - a channel slide
  - a build-and-post slide with the permission check
  - asking the permission in context
  - the manifest
  - your hardware model
  - the Wi-Fi settings panel
  - Bluetooth permissions with maxSdkVersion
  - camera with TakePicturePreview
  - the "CAMERA declared but not granted" crash
  - your error table with modern reasons
- **61 defined terms.** Examples: resource id, scaleType, WebP, vector drawable, view vs property animation, pivot, fillAfter, local vs push notification, channel importance, PendingIntent, FLAG_IMMUTABLE, system service, SSID, settings panel, scan throttling, BLUETOOTH_CONNECT, maxSdkVersion, TakePicturePreview, Bitmap, CameraX. 50 were added to the portal glossary, which now has 345 terms.
- **Cache:** `?v=10` / `mad-v10`.
- **Course Outline:** all 10 Lecture 7 topics land on the matching slides.

### Verification

All Kotlin was compiled with Kotlin 2.2.21 against stand-in Android classes, with simulated taps.

- **Image and animations:** the image swap works; the XML fade and move animations and `view.animate()` run.
- **Notifications:**
  - the channel is created
  - Android 13, permission denied → "Notifications are off"
  - allowed → the notification is posted
  - Android 12 → posted without asking
- **Wi-Fi:** the settings panel opens on API 29+, and Wi-Fi settings on API 28. The scan asks for location first, then lists network names; empty names are filtered out.
- **Bluetooth:** asks BLUETOOTH_CONNECT, shows the enable dialog, then lists paired device names.
- **Camera:** a photo is shown; cancel → "No photo taken".
- **A real fix found by the compiler:** `getSystemService(...)` can return null, so the slides now use `manager?.`, `wifi?.` and `?: emptyList()`.
- **XML:** all 5 XML snippets are well-formed (the two anim files checked separately).
- **Facts checked on developer.android.com (26 Nov 2026):**
  - `WifiManager.setWifiEnabled`: "Starting with Q, applications are not allowed to enable/disable Wi-Fi … this API will always fail and return false".
  - `startScan()` was deprecated in API 28. Android 10+ scanning needs ACCESS_FINE_LOCATION; a foreground app may scan 4 times per 2 minutes (develop/connectivity/wifi/wifi-scan).
  - `BluetoothAdapter.disable()`: deprecated in API 33; apps targeting 13+ cannot enable or disable Bluetooth.
  - Legacy Bluetooth permissions should use `maxSdkVersion="30"` (develop/connectivity/bluetooth/bt-permissions).
  - `MediaStore.ACTION_IMAGE_CAPTURE`: if the app declares CAMERA and it is not granted, using the action throws a SecurityException.

### Corrections to your notes

1. **"Pushing a notification" = `notify()`.** In Android vocabulary notify() *posts* a local notification; a push notification comes from a server (Firebase Cloud Messaging). Your own types table already separates them.
2. **POST_NOTIFICATIONS is requested in `onCreate`** with requestPermissions, before the user knows why, and the answer is ignored. It is now asked on the button tap with the Activity Result API (Lecture 6), and `notify()` runs only when allowed.
3. **Wi-Fi Enable/Disable buttons:** since Android 10 these always fail, yet the notes' code still shows "Wi-Fi Enabled". Replaced with the Wi-Fi settings panel.
4. **Wi-Fi scan:** the notes ask for location in onCreate and read results without checking the answer. `startScan()` is deprecated and throttled. NEARBY_WIFI_DEVICES does not replace location for listing networks.
5. **Bluetooth Disable button:** `disable()` always fails on Android 13+. The legacy BLUETOOTH / BLUETOOTH_ADMIN permissions need `maxSdkVersion="30"`, and the manifest listed Wi-Fi and location permissions this example does not need. The rest of your Bluetooth code was already modern. 👍
6. **Camera:**
   - `result.data?.extras?.get("data") as Bitmap` uses a method deprecated on Android 13 and crashes if no picture comes back. It is replaced with TakePicturePreview.
   - Declaring CAMERA and launching the camera Intent after the user denied it throws a SecurityException; there is a mistake slide on this.
7. **scaleType table:** "centerInside → keeps original size" is more exactly "shrinks a large picture to fit, never enlarges a small one".
8. **Image names:** besides lowercase and no spaces, names must not use dashes or start with a digit.

## Lecture 6: Android Permissions

**Slides: 20 → 32.** That is 28 body slides plus the automatic title, objectives, Bloom and "In 2026" slides. Baseline: your "Lecture 6.docx". Lecture 5 previews this topic; this lecture teaches it in full (your decision).

### What changed

- **Your notes' structure is kept:**
  - what a permission is
  - types
  - manifest vs runtime
  - writing the manifest permission
  - the full camera example
  - common mistakes
  - "what if denied?"
- **Both request styles are taught.** Your notes' `requestPermissions` + `onRequestPermissionsResult` code is shown and explained, marked as deprecated. Then the modern Activity Result API, then a short side-by-side comparison.
- **New permission life-cycle demo** (new `permlife` widget):
  - students tap Allow or Don't allow and see the 1st request, the rationale, the 2nd request, then "no more pop-ups" and the Settings path
  - a live table shows granted, times denied, `shouldShowRequestPermissionRationale` and whether the dialog still appears
  - this answers your notes' exam idea: "What happens if permission is denied?"
- **New slides:**
  - why permissions exist (sandbox)
  - three kinds (normal / runtime / special)
  - the rationale dialog
  - opening App info settings
  - location precise vs approximate
  - several permissions at once
  - notification permission with a version check
  - photos and the photo picker (no permission)
  - "Android takes permissions back" (one-time, auto-reset)
  - two mistake slides (the second is your notes' mistake list)
  - a corrected lab task
- **41 defined terms.** Examples: normal / runtime / special / signature permission, `uses-permission`, `Manifest.permission`, checkSelfPermission, request code, launcher, rationale, App info settings, precise / approximate / background location, POST_NOTIFICATIONS, READ_MEDIA_IMAGES, photo picker, PickVisualMedia, one-time permission, auto-reset, SecurityException. 25 were added to the portal glossary, which now has 295 terms.
- **Engine:** the new `permlife` widget; cache is now `?v=9` / `mad-v9`.
- **Course Outline:** all 4 Lecture 6 topics land on the matching slides.

### Verification

All Kotlin was compiled with Kotlin 2.2.21 against stand-in Android classes, with simulated answers.

- **Your notes' older code** (converted to ViewBinding): deny → "Permission Denied"; allow → "Permission Granted"; tap again → "Permission Already Granted".
- **Modern code:** deny → "Camera permission denied"; allow → "Camera ready"; tap again → "Camera ready" with no pop-up.
- **Rationale:** the explanation dialog appears on the 2nd request.
- **Settings:** the Intent opens `package:com.example.first`.
- **Location:** approximate only → "Approximate location on"; both → "Precise location on"; none → "Location off — enter your city by hand".
- **Notifications:** API 36 asks POST_NOTIFICATIONS; API 31 starts reminders directly.
- **Photo picker:** a chosen photo is shown in the ImageView; cancel → "No photo chosen".
- **XML:** the manifest is well-formed.
- **Facts checked on developer.android.com (26 Nov 2026):**
  - `onRequestPermissionsResult` was "Deprecated in 1.2.0 … in favor of using the Activity Result API" (reference/androidx/activity/ComponentActivity).
  - If the user taps Deny more than once, the system dialog is no longer shown (training/permissions/requesting).
  - Requesting FINE + COARSE gives the user a Precise / Approximate choice on Android 12+ (develop/sensors-and-location/location/permissions/runtime).
  - Android 13 added the READ_MEDIA_* permissions (about/versions/13/behavior-changes-13).
  - The permission types are install-time, runtime and special (guide/topics/permissions/overview).

### Corrections to your notes

1. **`onRequestPermissionsResult` is deprecated** (AndroidX Activity 1.2.0). It is still shown so students can read it, next to the Activity Result API.
2. **Lab task "Request Storage permission":** on Android 13+ the old storage permission gives no access to photos. Use READ_MEDIA_IMAGES or, better, the photo picker, which needs no permission. The lab task was changed.
3. **The manifest** still has `package="com.example.first"` (it now lives in build.gradle.kts as `namespace`), and the launcher activity has no `android:exported="true"`, which Android 12+ requires.
4. **Denials:** the notes say "user responds → app handles result" but not what happens after repeated denials. Since Android 11, two denials stop the dialog, so the app must offer Settings. A demo slide and a code slide were added.
5. **Types:** the notes list normal and dangerous only. The official overview also has special permissions (Settings screen) and signature permissions; both are mentioned.

## Lecture 5: Activities, Intents, GSM & Permissions

**Slides: 22 → 31.** That is 27 body slides plus the automatic title, objectives, Bloom and "In 2026" slides. Baseline: your "Lecture 5.docx".

**Your decision:** keep Lectures 5 and 6 separate. Lecture 5 only **previews** runtime permissions (the SmsManager slides and one "first look" animation that points to Lecture 6).

### What changed

- **Every screen uses ViewBinding** (ActivityMainBinding, ActivitySecondBinding). The old deck used findViewById and undeclared variables.
- **New slides following your notes:**
  - creating a second Activity with the wizard
  - SecondActivity's layout + Kotlin
  - **every screen in the manifest**
  - sending data
  - receiving data with a default (`?: "Guest"`)
  - keys kept in a `companion object`
  - a **back stack animation** (new `backstack` widget: push, push, push, then pop back to the home screen)
  - what "GSM services" means
  - dial vs call
  - **SMS through the SMS app**
  - SmsManager and why it is limited
  - SmsManager code
  - email
  - more everyday intents (web, map, share)
  - two mistake slides (no app found; keys that do not match)
- **Kept and improved:** the explicit and implicit Intent animations, the result-back comparison, and the permission animation (now with SEND_SMS).
- **50 defined terms.** Examples: explicit/implicit Intent, `::class.java`, extra, key, back stack, Activity Result API, Uri, ACTION_DIAL / CALL / SENDTO / VIEW, GSM, SmsManager, dangerous permission, Google Play policy, `Build.VERSION.SDK_INT`, deprecated, ActivityNotFoundException, package visibility, PendingIntent. 35 were added to the portal glossary, which now has 270 terms.
- **Engine:**
  - new `backstack` widget
  - headings and quiz answers now wrap inside long code words, so nothing scrolls sideways at 360px
  - cache is now `?v=8` / `mad-v8`
- **Course Outline:** all 9 Lecture 5 topics land on the matching slides.

### Verification

All Kotlin was compiled with Kotlin 2.2.21 against stand-in Android classes, with simulated taps.

- **Two-screen app:**
  - "Ali" travels with key USERNAME → "Welcome Ali"
  - opened with no extra → "Welcome Guest"
- **SmsManager flow:**
  - deny → "SMS permission denied"
  - allow → the SMS is sent at once
  - the version check works on API 36 and API 24
- **Intents:**
  - `smsto:`, `mailto:`, web, `geo:`, share chooser, dial and call each build the right Intent
  - the empty-email check shows its Toast
  - a missing app shows "No SMS / email app found" instead of crashing
  - the Activity Result API returns the city "Okara"
- **XML:** the manifest and activity_second.xml are well-formed.
- **Facts checked on official pages (26 Nov 2026):**
  - `SmsManager.getDefault()` was deprecated in API 31; use `getSystemService(SmsManager.class)` (developer.android.com/reference/android/telephony/SmsManager).
  - Google Play allows SMS and call-log permissions only for default SMS, Phone or Assistant handlers, with rare temporary exceptions (support.google.com/googleplay/android-developer/answer/10208820).
  - The common-intents guide uses `mailto:`, `smsto:` and ACTION_DIAL (developer.android.com/guide/components/intents-common).
- **Browser tests:**
  - All 31 slides open with no errors, and every animation steps to the end.
  - No slide scrolls sideways at 360px.

### Corrections to your notes

1. **The title says "Lecture 4"**; in the portal this is Lecture 5 (Lecture 4 is Views).
2. **SecondActivity was never added to the manifest** in the notes. Without it the app crashes when opening the screen. There is a slide on this.
3. **`"Welcome $name"` with a nullable name** shows "Welcome null" when the extra is missing. It now uses `?: "Guest"`.
4. **SmsManager:**
   - The explanation says `SmsManager.getDefault()` but the code uses `getSystemService(SmsManager::class.java)`, which exists only on API 31+. With minSdk 24 a version check is needed.
   - The variable is `smsPermissionCode` in the code but `SMS_PERMISSION_CODE` in the explanation.
   - After the user taps Allow, the notes' code did not send the SMS; the user had to tap again.
   - `requestPermissions` + `onRequestPermissionsResult` is the older pattern; the slide uses the Activity Result API, and Lecture 6 compares both.
5. **"Google Play may reject it"** → more exact: Play allows SMS permissions only for the default SMS / Phone / Assistant app.
6. **The SMS alternative** used ACTION_VIEW with `sms:`. Google's guide uses ACTION_SENDTO with `smsto:`. Both usually work; the slide follows the guide.
7. **Email:**
   - `type = "message/rfc822"` with ACTION_SEND also offers non-email apps; ACTION_SENDTO with `mailto:` limits it to email apps.
   - The notes' Kotlin file repeats `package com.example.first` twice, which is a compile error.
8. **ACTION_CALL** needs CALL_PHONE requested **at run time** too, not only in the manifest, or it throws a SecurityException. The slide recommends ACTION_DIAL, which needs no permission.
9. **Manifests** still use `<manifest package=…>` (see Lecture 3).

## Lecture 4: Android Views — XML + Kotlin

**Slides: 26 → 36.** That is 32 body slides plus the automatic title, objectives, Bloom and "In 2026" slides. Baseline: your "Lecture 4.docx" (Steps 0–10). The slides follow the same step order.

### What changed

- **Compose removed.** "The same screen in Jetpack Compose" and "Compose state in action" are gone, and the "In 2026" slide no longer shows Compose code. XML is no longer labelled "Legacy".
- **findViewById first, then ViewBinding.** Your complete MainActivity (package, imports, findViewById) is explained line by line. Then ViewBinding does the same job more safely, and every later slide uses `binding.viewId`. The old deck used undeclared view names such as `btnDelete` and `tvStatus`; every snippet now uses ids that exist in the layout.
- **New live widgets:**
  - **Layout lab** (`attrlab`): change orientation, gravity, textSize, button width and layout_weight. The XML and the phone update together, and changed lines turn green. Weights are exact: 1:1 equal, and 1:2 exactly double, both horizontally and vertically (measured in the browser).
  - **Auto-complete demo** (`autocomplete`): type, change the threshold, and tap a suggestion. It uses ArrayAdapter's matching rule: an item matches if it, or one of its words, starts with the typed text, ignoring capitals.
  - The "Try the click" phone is kept.
- **New slides:**
  - size (wrap_content / match_parent / dp)
  - the core flow (XML → id → find → variable → screen)
  - events and listeners
  - Toast vs Snackbar vs AlertDialog
  - what an adapter is
  - your final concept map
  - two mistake slides (toInt crash; forgetting setContentView or `.show()`)
  - a homework app that combines Steps 3–10
- **75 defined terms.** Examples: View/ViewGroup, xmlns, app namespace, gravity, padding/margin, layout_weight, constraint, generic type, import, package, event, listener, main thread, Context, `this`, builder, method chaining, `_` parameters, `finish()`, adapter, threshold, `android.R.layout.simple_list_item_1`, RecyclerView. 36 were added to the portal glossary, which now has 235 terms.
- **Engine:**
  - the attribute lab and the auto-complete widget were added
  - the phone widget's text boxes support grey hints and number keyboards
  - cache is now `?v=7` / `mad-v7`
- **Course Outline:** all 12 Lecture 4 topics land on the matching slides.

### Verification

- **Kotlin snippets:** all 9 were compiled with Kotlin 2.2.21 against stand-in Android classes. Taps were simulated with these results:
  - findViewById version → "Welcome Students"
  - greet with "Ali" → "Hello Ali"
  - long click returning true → "Long Click Detected"
  - Toast → "Welcome!"
  - dialog "Yes" → `finish()` called
  - AutoCompleteTextView threshold → 1
  - ListView row 2 → "You tapped Sara"
  - calculator 5 + 3 → "Result: 8"; empty box → "Enter valid numbers" Toast
- **XML:** every XML snippet is well-formed, including the XML written inside comments.
- **Browser tests:**
  - All 36 slides open with no errors, and every animation steps to the end.
  - No slide scrolls sideways at 360px.
  - Lectures 1–3 and all portal pages were re-tested.
- **Not checked by running Android:** the stand-in classes model these rules, which come from Android's documented behaviour; please confirm them on a real phone in class:
  - a long-click lambda returning false lets the normal click run too
  - AutoCompleteTextView's default threshold is 2

### Corrections to your notes

1. **AutoCompleteTextView "Typing P → Pakistan appears":** only true with `threshold = 1`. The default threshold is 2 letters, so the slide adds `binding.autoText.threshold = 1`, and the demo shows both.
2. **AlertDialog "Yes → closes app":** `finish()` closes the current **screen**. With one screen the user lands on the home screen, but the app's process may stay alive for a while.
3. **"onCreate() runs when app starts":** it runs when **this screen** is created; a second screen has its own `onCreate`.
4. **"Bundle → stores data when activity starts":** it holds the saved state when the screen is re-created (for example after a rotation), and is null the first time.
5. **Long click `true`** was in your code but not explained. The slide explains it (handled, so the normal click does not also run) and suggests changing it to `false` as an experiment.
6. **`gravity="center"`** was in your base layout but not explained. It is explained now, and it can be tried in the layout lab.
7. **Output typo:** "IHello Ali" → "Hello Ali".
8. **Old portal slide:** the ConstraintLayout example had no `xmlns:android` / `xmlns:app`, so its `app:` attributes would not build. Fixed.

## Lecture 3: Android Development Environment & First App

**Slides: 23 → 39.** That is 35 body slides plus the automatic title, objectives, Bloom and "In 2026" slides. Baseline: your "Lecture 3.docx" / "Lecture 3.pdf". "Lecture 3 pdf LLM.pdf" is image-only and matches the same content.

### What changed

- **XML + ViewBinding, not Compose.** The old deck used the Compose template, `setContent`, `ComponentActivity`, and an `activity-compose` dependency, and it labelled XML "Legacy". Now:
  - every screen is an XML layout with `setContentView`
  - `findViewById` is shown first (you will see it in old tutorials), then **ViewBinding**, which students write
  - Compose appears only in the "wrong template" mistake slide and in tooltips
- **Your notes' structure is kept** (what it is → why it exists → how it works → example). There is now one idea per slide:
  - toolkit
  - Android Studio (with the window tour)
  - what Run does
  - SDK
  - SDK Manager
  - API levels
  - emulator
  - creating an AVD
  - third-party emulators
  - real phone
  - Gradle
  - dependencies
  - the Gradle file
  - Gradle sync
  - new project
  - project structure
  - manifest
  - layout
  - resources and the R class
  - MainActivity
  - findViewById vs ViewBinding
  - calculator code
  - **a working calculator demo** (type two numbers, tap Add)
  - the full 7-step flow
  - Run
  - Logcat
  - three mistakes
- **85 defined terms** (84 used as tooltips). Examples: API, API level, system image, AVD, hardware acceleration, ADB, USB/Wireless debugging, Gradle sync, Maven repository, version catalog, namespace, applicationId, versionCode, intent-filter, `android:exported`, Bundle, `super`, R class, inflate, toIntOrNull, NumberFormatException. 49 were added to the portal glossary, which now has 199 terms.
- **Engine:** the XML-to-phone widget's button can now run a small calculation from the text boxes. That powers the calculator demo; it supports number keyboards and grey hints. Cache is now `?v=6` / `mad-v6`.
- **Course Outline links:** all 11 Lecture 3 topics land on the matching new slides.

### Verification

- **Calculator (ViewBinding version):** compiled with Kotlin 2.2.21 against stand-in Android classes, and a button click was simulated:
  - 12 + 30 → `Result: 42`
  - an empty box → `Please enter two numbers`
  - "abc" → `Please enter two numbers`
- **The browser demo uses the same rules as Kotlin's `toIntOrNull`.** Checked against the real compiler: "+5" → 5, " 7" → null, "99999999999" → null.
- **Your original findViewById calculator** was also compiled and clicked with an empty box. It crashes with `NumberFormatException: For input string: ""`; this is the "crashing on empty input" mistake slide.
- **Logcat demo:** prints `D/FirstApp: onCreate called` and `D/FirstApp: total = 5`.
- **XML:** the manifest, the layout and the mistake snippets are all well-formed.
- **Library versions:** checked on Google's Maven repository on 26 Nov 2026 — AppCompat 1.8.0, Material Components 1.14.0.
- **Android Studio:** the current stable version on developer.android.com/studio/releases is **Rabbit 2 (2026.2.2)**. It is mentioned only in the notes, not on slides.
- **Browser tests:**
  - All 39 slides open with no errors, and every animation steps to the end.
  - No slide scrolls sideways at 360px.
  - Lectures 1 and 2 and all portal pages were re-tested.

### Corrections to your notes

1. **"New Project → Empty Activity"** now creates a **Jetpack Compose** project; Google's create-project page says Empty Activity includes Compose. For XML choose **"Empty Views Activity"**. There is a mistake slide on this.
2. **Minimum SDK "API 21"** → this course uses **API 24** (Android 7.0), as in Lectures 2–3.
3. **Manifest `<manifest package="com.example.firstapp">`** is the old way. The package now lives in `build.gradle.kts` as `namespace` (developer.android.com/build/configure-app-module).
4. **Your activity had no `android:exported`.** Apps targeting Android 12+ must set it on any screen with an intent-filter, or the app will not install (developer.android.com/about/versions/12/behavior-changes-12).
5. **The calculator layout** had no `layout_width` / `layout_height` (the build fails without them) and no `xmlns:android`. Both were added, plus `inputType="number"`.
6. **The calculator code used `toInt()`**, which crashes when a box is empty (verified). It now uses `toIntOrNull()` with a null check, and ViewBinding instead of findViewById.
7. **The Gradle example** `implementation 'androidx.appcompat:appcompat:1.6.1'` is the older Groovy style with an old version. It is now shown in Kotlin DSL with the current versions, and the version catalog form is mentioned.

### Open questions (Lecture 3)

1. **Template name.** "Empty Views Activity" is the name used by recent Android Studio versions, but the official create-project page does not list it by name. Please confirm the name on the lab PCs' Android Studio.
2. **Lab PCs.** Do they have virtualization (hardware acceleration) turned on? If not, students should use real phones; the AVD slide says so.

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
