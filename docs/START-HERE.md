# START HERE

This repository holds everything for the **Mobile Application Development (CSCP-4063)** course by Muhammad Tahir Mehmood:
the web portal (live at https://mobile-application-development-five.vercel.app) and the offline Android app.
This page tells a person, or a new Claude chat, how to pick up the work from here.

## What to read

| File | What it gives you |
|---|---|
| [docs/PROJECT-HANDOFF.md](PROJECT-HANDOFF.md) | **The full project state**: every feature, file, route, storage key, build and publish step, pending work, solved problems and the instructor's working rules |
| [docs/CHAT-HISTORY.md](CHAT-HISTORY.md) | The complete earlier chat with Claude (all requests and replies), from the first prompt to the final release |
| [docs/MAD-Course-Outline.pdf](MAD-Course-Outline.pdf) | The official course outline the site follows (scanned; read it as images) |
| [README.md](../README.md) | Short technical overview of the site |
| [android/README.md](../android/README.md) | The Android app: how it works, how to build and sign it |

## Continue with Claude Code

1. Get the code:
   - On the instructor's laptop it is already at `D:\Fall 2026\Mobile App Development\Project Source\Mobile-Application-Development`.
   - On any other computer: `git clone https://github.com/tahir8203/Mobile-Application-Development.git`
2. In the Claude desktop app (Code tab), start a new session with that folder as the project folder.
3. Paste this as the first message:

> I am Muhammad Tahir Mehmood, instructor of Mobile Application Development (CSCP-4063). I am continuing this project from another Claude account.
> First read `docs/START-HERE.md`, `docs/PROJECT-HANDOFF.md` and, if you need more detail, `docs/CHAT-HISTORY.md` in this repository.
> The website is live at https://mobile-application-development-five.vercel.app and the Android app 2.0 is published as the GitHub release `app-v2.0.0`.
> Follow the "Working rules" in the handoff file. After reading, tell me in a few lines what the project is and what is pending, then wait for my request.

4. Then write your request, for example: "I tested the APK; these things don't work: …", "Add a lecture on …", or "Build and publish app 2.0.1".

## What is NOT in this repository (on purpose)

- **The app signing key and its password.** They are secret and this repository is public.
  The instructor keeps them in `D:\Fall 2026\Mobile App Development\android-signing\` and a backup copy.
  Every app update must be signed with that key; without it students must uninstall the app before installing a new build.
- **APK files.** The current APK is attached to the GitHub release:
  https://github.com/tahir8203/Mobile-Application-Development/releases/latest/download/MAD-Course.apk
- **Build tools** (JDK 17, Gradle 8.11.1, Android SDK 35). On the instructor's laptop they are in `D:\MADBuildTools`.
  On another computer install Android Studio, or see [android/README.md](../android/README.md).

## Accounts the project uses

- **GitHub** `tahir8203`: code, pull requests and APK releases. GitHub Actions is currently blocked by a billing lock on the account.
- **Vercel**: deploys the website automatically whenever `main` changes. No manual deploy step.
