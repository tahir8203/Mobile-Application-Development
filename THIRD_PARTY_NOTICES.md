# Third-party notices

As of the Kotlin + XML upgrade (branch `upgrade-kotlin-xml`, November 2026), **no third-party code or library is bundled** in the portal.

- All new widgets in `assets/present.js` (timeline, code tracer, null-safety toggle, range explorer, filter→map→sum conveyor, tooltips, speed control) are written from scratch in vanilla JavaScript, CSS and inline HTML.
- Several public repositories were studied for **ideas only** (interaction patterns such as step snapshots, changed-variable highlighting and speed control). No source code was copied from them. See `docs/REPOSITORY_RESEARCH.md` for the list, their licences and what was or was not adapted.
- The portal makes no runtime requests to CDNs, remote fonts, analytics or third-party APIs from the new code.

If a library is vendored in a later lecture, its name, exact version, licence and source URL will be added here.
