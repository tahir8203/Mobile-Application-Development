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

### Signing

Without a key the release APK is signed with the build machine's debug key, which is enough to
install it. To publish updates (or upload to Google Play) use one permanent key by setting the
environment variables `MAD_KEYSTORE_FILE`, `MAD_KEYSTORE_PASSWORD`, `MAD_KEY_ALIAS` and
`MAD_KEY_PASSWORD` when building.

Requires Android 8.0 (API 26) or newer.
