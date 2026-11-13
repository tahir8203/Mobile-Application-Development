# MAD Course — Android app

A native Android app (Kotlin) that ships the complete Mobile Application Development course:
all 16 lectures, the slide decks with animations, quizzes, the course outline, assessments,
glossary and certificate. Everything is bundled inside the APK and works **offline**; the app
asks for **no permissions**.

## What the app adds to the website

| Feature | How |
|---|---|
| Offline course | `index.html` and `assets/` are copied into the APK at build time (`copyCourseSite` Gradle task) and served from a private `https://appassets.androidplatform.net` origin with `WebViewAssetLoader`. |
| Back button | Closes the presentation, dialogs, menus and sidebar first, then goes back through pages; press twice to exit. |
| Fullscreen presentations | The **F** key / fullscreen button hides the status and navigation bars. |
| Keep screen on | The screen stays on while a presentation is open. |
| Print / Save as PDF | Certificate and lecture printing open Android's print dialog ("Save as PDF"). |
| Save code examples | The **Download** button on code slides saves to `Downloads/MAD Course` (Android 10+) or opens the share sheet. |
| Outside links | Kotlin Playground and other websites open in the phone's browser. |
| Deep links | `madcourse://open#outline`, `madcourse://open#present/4/3`, … open a page directly. |

Version 2.0 adds: touch feedback (haptics), a status bar that follows the light or dark theme, the Android
share sheet, a file picker for "Restore from backup", and home-screen shortcuts (long-press the icon:
Lectures, Practice, Labs).

Progress, quiz answers and bookmarks are stored on the phone, separately from the website.
The presenter (second-screen) window is a desktop-browser feature and is hidden in the app.

Note: the app shows Android code and explains how to run it in Android Studio; it does not run
student Android code itself.

## Build

Requirements: JDK 17 and the Android SDK (API 35). Open the `android/` folder in Android Studio,
or run:

```
gradle -p android assembleRelease
```

The APK is written to `android/app/build/outputs/apk/release/app-release.apk`.

GitHub Actions (`.github/workflows/android.yml`) builds the APK on every change to the app or the
course content, installs it on an Android 14 emulator, opens the main pages, takes screenshots and
fails on crashes or JavaScript errors. Download the APK from the run's **MAD-Course-APK** artifact.

### Build on the instructor's PC

```
bash android/build-local.sh 3
```

The argument is the version code; raise it by one for every release. The script uses the tools in
`D:\MADBuildTools`, signs with the release key and writes
`D:\Fall 2026\Mobile App Development\APK\MAD-Course.apk`.

### Signing

Releases are signed with the key `mad-course-release.p12` (alias `mad-course`), kept outside the repository
in `D:\Fall 2026\Mobile App Development\android-signing` with its password file. Every update must use
this same key or phones refuse the update. Never commit the key. The build reads it from the environment
variables `MAD_KEYSTORE_FILE`, `MAD_KEYSTORE_PASSWORD`, `MAD_KEY_ALIAS` and `MAD_KEY_PASSWORD`; without them
it falls back to the debug key.

Version 1.0 was signed with a debug key, so it must be uninstalled before installing 2.0.

Requires Android 8.0 (API 26) or newer.
