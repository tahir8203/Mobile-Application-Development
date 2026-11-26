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
- **Cache:** `?v=19` everywhere, and the service worker cache is now `mad-v19`.
- **New widget `studio` (added with Lecture 1):** a simplified Android Studio window — Project panel, code editor, Layout Editor, device menu, Run button and Logcat. Each step highlights one area and dims the rest. It will be reused in Lecture 3.
- **Class rename:** the Lecture 7 scaleType lab now uses `.vsc*` classes, because `.vst` was already used by the storage widget and the two clashed.

## Lecture 16: Services & Broadcast Receivers

**Slides: 33 in total.** That is 29 body slides plus the automatic title, objectives, Bloom and "In 2026" slides. Baseline: your "Lecture 16 Android_Services_and_Broadcast_Receivers.html", in the order of its 9 sections:
1. What is a Service
2. Service vs Activity
3. Creating
4. Running
5. Stopping
6. Broadcast Receiver
7. Signals
8. Registering
9. Unregistering

Your Test Yourself questions are included. Your notes were already modern and accurate (Android 12 foreground limits, Android 8 manifest limits, export flags), so the changes are mostly completion and widgets. **Java versions were dropped**, because the course is Kotlin-only.

### What changed

- **Two new live widgets** (replacing your notes' seven small animations):
  - **Service lab** (`svclab`): Activity and Service lanes with startService / startForegroundService / bindService / unbindService / Close Activity / stopService. It follows the real rules: onCreate once, onStartCommand with a new startId per start, a foreground notification, a bound-only service ending on the last unbind, and "started + bound" needing both stop and unbind.
  - **Broadcast lab** (`bcastlab`): register, send signals (power, battery low, boot), stop the screen with and without unregistering (stale delivery), and the double-unregister error.
- **Code your notes only sketched, completed:**
  - DownloadService does its work in a coroutine and calls stopSelf(startId).
  - The bound service now has its full LocalBinder + ServiceConnection; your notes used `connection` without defining it.
  - A complete foreground MusicService uses ServiceCompat.startForeground with the mediaPlayback type, plus the manifest lines.
  - A WorkManager worker with constraints.
  - A BootReceiver that reads a saved alarm (Lecture 8).
  - A custom broadcast sent with setPackage and received with RECEIVER_NOT_EXPORTED.
- **New slides:**
  - three kinds of Service
  - "A Service is NOT a thread"
  - modern background limits (Android 8 / 12 / 14 / 15)
  - Service or WorkManager?
  - manifest vs code registration
  - long work in onReceive (mistake)
- **32 defined terms.** Examples: Service, started/foreground/bound service, onStartCommand, onBind, IBinder, ServiceConnection, startId, START_NOT_STICKY, foreground service type, ServiceCompat.startForeground, background execution limits, WorkManager, CoroutineWorker, BroadcastReceiver, onReceive, IntentFilter, implicit broadcast, RECEIVER_EXPORTED/NOT_EXPORTED, unregisterReceiver, BOOT_COMPLETED, goAsync(). 28 were added to the portal glossary, which now has 588 terms.
- **Cache:** `?v=19` / `mad-v19`.
- **Course Outline:** all 8 Lecture 16 topics already land on matching slides.

### Verification

- **Kotlin:** all 6 Kotlin code slides plus the Kotlin halves of the two compare slides were taken straight from the deck. They were compiled together with Kotlin 2.2.21 against stand-in Android classes and run with a stand-in "system" that follows the documented service and broadcast rules.
- **DownloadService (real coroutines):** onCreate once; onStartCommand #1 and #2; **stopSelf(1) ignored because #2 is newer**; onDestroy after the last download. The Start/Stop buttons work.
- **MusicService:** the foreground notification with the mediaPlayback type; tapping Play twice still creates only **one** player; stop releases it.
- **Bound TimerService:** bind → onBind → timer ready; unbind → the service ends, and timer is cleared.
- **WorkManager:** the unique periodic work is enqueued (compile and call only — WorkManager itself was a stand-in).
- **BootReceiver:** no saved alarm → nothing; "07:30" saved → re-scheduled; a fake action is ignored.
- **ChargingActivity:**
  - plug → 🔌 Charging, unplug → 🔋 On battery
  - Home → unregistered, so a later plug-in is not delivered
  - a second onStop is safe thanks to the flag
  - unregistering a receiver that was never registered → IllegalArgumentException
- **Custom broadcast:** delivered to the NOT_EXPORTED receiver with file = notes.pdf.
- **XML:** the service declaration and the boot-receiver manifest are well-formed.
- **Browser:** no script errors; all 33 slides have no sideways scrolling at 360 px; both widgets tested by script.
- **Final course check:** all 16 lectures (602 slides) open and reach their summary slide with no script errors.
- **Facts checked on developer.android.com (26 Nov 2026):**
  - **Broadcasts overview:**
    - RECEIVER_EXPORTED for system/other-app broadcasts, RECEIVER_NOT_EXPORTED for your own
    - manifest receivers for system broadcasts use exported="true"
    - Android 8 manifest restriction on most implicit broadcasts
    - the process can be killed after onReceive returns; goAsync must finish "under 10 seconds"
  - **Android 14 behaviour changes:** context-registered receivers must specify a flag (exception: only system broadcasts); every foreground service needs a type.
  - **Restrictions on starting a foreground service from the background:** Android 12+ → ForegroundServiceStartNotAllowedException.
  - **Background Execution Limits (Android 8):** idle apps' background services are stopped; startForeground() must be called within five seconds of startForegroundService().
  - **Foreground service types:** mediaPlayback → FOREGROUND_SERVICE_MEDIA_PLAYBACK; Android 15 BOOT_COMPLETED restrictions for mediaPlayback and dataSync.
  - **Declare foreground services:** FOREGROUND_SERVICE + the type permission, and foregroundServiceType on `<service>`.
  - **Launch a foreground service:** ServiceCompat.startForeground(…, id ≠ 0, …, type on API 30+).

### Corrections and additions to your notes

1. **The bound-service example used `connection` without defining it.** The full LocalBinder + ServiceConnection pattern was added, unbinding in the matching callback. onServiceDisconnected is only called on a crash, so the reference is cleared manually.
2. **`onStartCommand` only had a comment, "Move slow work off the main thread".** It now shows how (a coroutine on Dispatchers.IO), with stopSelf(startId) so an early finish cannot cut off a newer request.
3. **The foreground service** was only an idea in your notes (startForeground(NOTIFICATION_ID, buildNotification())). Added:
   - the notification channel
   - ServiceCompat.startForeground with its type
   - the three manifest lines (FOREGROUND_SERVICE, FOREGROUND_SERVICE_MEDIA_PLAYBACK, foregroundServiceType)
   - the 5-second rule
   - the Android 14 type requirement
   - the Android 15 boot restriction
4. **Java examples removed** (Kotlin-only course). Everything else in your notes — the analogies, the tables, the export-flag guidance and the registration pairs — is kept.

## Lecture 15: Threads in Android

**Slides: 33 in total.** That is 29 body slides plus the automatic title, objectives, Bloom and "In 2026" slides. Baseline: your "Lecture 15 _Threads_in_Android.html", in the order of its 5 sections:
1. Thread
2. Runnable
3. Thread vs Runnable
4. Writing a thread
5. Multiple threads

Your 6 Test Yourself questions are all included. Your notes deliberately had **no code**; the new deck adds real, runnable code for every idea, then coroutines (today's way).

### What changed

- **Four new live widgets** (your notes had five animations):
  - **Freeze vs smooth** (`anrdemo`): the same 6-second job on the main thread (spinner freezes, tap ignored, ANR dialog) and on a worker thread (spinner keeps spinning, result handed back). It shows main and worker lanes.
  - **Thread life cycle** (`threadlife`): NEW → RUNNABLE → TERMINATED, start() vs run() (the work lands on the MAIN lane), and start() twice → IllegalThreadStateException.
  - **More workers** (`workers`): 6 tasks with a 1–4 worker slider. It shows that 4 workers are no faster than 3 for 6 equal tasks (2 rounds either way).
  - **Race condition** (`racelab`): two threads doing count++ (read, add, write) lose an update (6 instead of 7); with synchronized/Atomic → 7.
- **New code slides:**
  - Thread & Runnable
  - start() vs run()
  - back to the UI thread (runOnUiThread)
  - a thread pool (Executors)
  - a real race condition (AtomicInteger)
  - withContext
  - async
  - the refresh button with lifecycleScope
- **New concept slides:**
  - the two threading rules
  - concurrency vs parallelism
  - coroutines and dispatchers
  - which tool when (coroutines / Thread / Handler / WorkManager / AsyncTask)
  - two mistake slides
- **29 defined terms.** Examples: thread, main thread, UI toolkit, ANR, Runnable, start(), run(), IllegalThreadStateException, thread pool, Executor, concurrency, parallelism, race condition, synchronized, AtomicInteger, runOnUiThread, Handler, coroutine, suspend, Dispatchers.IO/Main, withContext, async, lifecycleScope, WorkManager, StrictMode. 20 were added to the portal glossary, which now has 560 terms.
- **Cache:** `?v=18` / `mad-v18`.
- **Course Outline:** all 3 Lecture 15 topics land on matching slides. "Running code in multiple threads" now opens "Concurrency and parallelism".

### Verification

- **Everything was RUN for real, not simulated.** The six plain-Kotlin examples were taken straight from the deck, compiled with Kotlin 2.2.21 and run on the JVM with real threads and real kotlinx-coroutines 1.11.0. The outputs on the slides are from those runs:
  - the sums 500000500000 on "counter" and "worker-1" (the order changes between runs)
  - work on main / work on worker / IllegalThreadStateException
  - 8 jobs: 4137 ms with 1 thread vs 1045 ms with 4
  - race: unsafe 189235, **200000 (correct by luck)** and 173059 over three runs, while AtomicInteger was always 200000
  - withContext hopping to DefaultDispatcher-worker-1 and back
  - async: sum 30 in 1098 ms
- **Android code:** the two Android slides (Thread + runOnUiThread, lifecycleScope + withContext) were compiled and run on a stand-in "main" thread with its own queue. The views were set on that thread and the download ran on another.
- **Browser:**
  - no script errors, and all 33 slides have no sideways scrolling at 360 px
  - the four widgets were tested by script
  - the workers widget's explanation was corrected to "rounds × ticks"
  - Lecture 13–14 widgets were re-checked
- **Facts checked on developer.android.com (26 Nov 2026):**
  - **ANR page:** "Input dispatching timed out: If your app has not responded to an input event (such as a key press or screen touch) within 5 seconds"; StrictMode catches I/O on the main thread.
  - **Processes and threads:**
    - "There are two rules to Android's single-thread model: Don't block the UI thread. Don't access the Android UI toolkit from outside the UI thread."
    - runOnUiThread / View.post / View.postDelayed
  - **Kotlin coroutines on Android:** "Coroutines are the recommended solution for asynchronous programming on Android."
  - **Task scheduling:** WorkManager "lets tasks persist across app restarts and device reboots".

### Corrections and additions to your notes

1. **"If the main thread is blocked for roughly 5 seconds, Android shows the ANR":** more exactly, an ANR happens when the app does not respond to an **input event** (a tap or key) within 5 seconds. A blocked thread with no input does not by itself show the dialog, but the screen is still frozen. The slides use Google's wording.
2. **"Redraw the UI about 60 times every second":** many phones now refresh 90 or 120 times a second, so the frame budget is even smaller.
3. **The second threading rule was missing:** your notes cover "don't block the main thread" but not "don't touch views from other threads" (CalledFromWrongThreadException). There is a slide, a mistake slide and runOnUiThread code.
4. **Thread life-cycle names:** Java's real states are NEW, RUNNABLE, BLOCKED, WAITING, TIMED_WAITING and TERMINATED. "Started/Running" in your animation are both RUNNABLE. Also, a thread can be started only once.
5. **Race condition fixes:** your notes say "synchronise access". The slides show it running (AtomicInteger) and mention synchronized.
6. **Added for 2026:** coroutines (Dispatchers, withContext, async, lifecycleScope) as Google's recommended approach, and WorkManager for work that must survive closing the app. Your Thread/Runnable foundation is kept in full — it explains what coroutines do underneath.

## Lecture 14: Audio Management in Android

**Slides: 34 in total.** That is 30 body slides plus the automatic title, objectives, Bloom and "In 2026" slides. Baseline: your "Lecture 14 _Audio_Management_Android.html", in its order:
1. AudioManager & audio focus
2. Playing (MediaPlayer)
3. Recording (MediaRecorder)
4. ROM & SD card
5. The complete AudioRecorderPlayerApp
6. Test Yourself (your 5 questions + 1)

Your notes were already modern (MediaRecorder(Context), getExternalFilesDir, Android 8 focus API), so the changes are mostly fixes and widgets.

### What changed

- **Four new live widgets:**
  - **Audio focus phone** (`focuslab`): a music app reacts to a call (LOSS_TRANSIENT → pause/resume), a notification (ducked) and another music app (LOSS → stop), with a volume slider and a log of the focus constants.
  - **MediaPlayer state machine** (`mpstate`): buttons for setDataSource / prepare / start / pause / stop / reset / release. Illegal calls throw IllegalStateException, as in the official state diagram (e.g. start() after stop()).
  - **Storage drawers** (`storagelab`): internal (filesDir), app-specific external (getExternalFilesDir) and shared (MediaStore). "Uninstall" shows that both app folders are deleted and only shared files stay.
  - **Real browser recorder** (`micrec`, as in your notes): asks for the microphone, records, saves a clip and plays it back. It is released when you leave the slide.
- **The code was split into small classes:** AudioFocusHelper, SimplePlayer, VoiceRecorder and StorageExample. The complete MainActivity is shown in three parts (setup/volume/list, recording, playback/clean-up) and uses VoiceRecorder.
- **New slides:**
  - AudioManager & streams
  - request *and abandon* focus
  - the "new player on every tap" mistake
  - audio and the life cycle
  - the recording recipe
  - recording in the background
  - how to run the app
  - MediaPlayer vs Media3 ExoPlayer
- **30 defined terms.** Examples: AudioManager, audio stream, STREAM_MUSIC, audio focus, AudioFocusRequest, ducking, AUDIOFOCUS_LOSS_TRANSIENT, MediaPlayer, state machine, setDataSource, prepare(), release(), IllegalStateException, SoundPool, MediaRecorder, RECORD_AUDIO, AAC, foreground service, internal/external storage, getExternalFilesDir, filesDir, MediaStore, Media3 ExoPlayer. 24 were added to the portal glossary, which now has 540 terms.
- **Cache:** `?v=17` / `mad-v17`.
- **Course Outline:** all 4 Lecture 14 topics already land on matching slides.

### Verification

- **Kotlin:** all 7 Kotlin code slides were taken straight from the deck and compiled together with Kotlin 2.2.21 against stand-in classes. The stand-in MediaPlayer follows the official state diagram and throws on illegal calls. The stand-in MediaRecorder checks the setup order and writes a real file. Simulated:
  - **Audio focus:** play → granted; a call pauses; focus regained resumes; stop abandons focus with the same request.
  - **SimplePlayer:** play/pause/resume; three plays leave only **one** live player; stop → none; start() after stop() → IllegalStateException.
  - **VoiceRecorder:** a normal stop saves the file; an immediate stop returns false and deletes it; the wrong order throws.
  - **MainActivity:**
    - the volume slider sets STREAM_MUSIC
    - Play with no recording, mic denied, recording state of the buttons
    - saved / "too short, not saved", list size
    - play, seek, pause/resume, completion (player released, SeekBar reset, no pending ticks)
    - tapping a list item, a damaged file → "cannot play this file"
    - Home while recording → saved
- **StorageExample ran for real** on the JVM with real files, including "external storage unavailable" (null) handled without a crash.
- **XML:** the manifest and the layout are well-formed. `paddingVertical` (API 26+) was replaced by top/bottom padding for minSdk 24.
- **Browser:**
  - no script errors, and all 34 slides have no sideways scrolling at 360 px
  - the focus, state-machine and storage widgets were tested by script
  - **A bug was found and fixed:** the state-machine and storage widgets replayed earlier steps on top of each step.
  - The recorder's idle state was checked; actual recording needs a microphone and your permission, so it was not pressed.
  - Lecture 12–13 widgets were re-checked.
- **Facts checked on developer.android.com (26 Nov 2026):**
  - **Manage audio focus:**
    - automatic ducking since Android 8.0
    - Android 12+ "forces the playing app to fade out"
    - apps targeting Android 15 can request focus only as the top app or with a foreground service
    - abandonAudioFocusRequest with the same AudioFocusRequest
    - ExoPlayer can manage focus for you
  - **MediaRecorder:**
    - MediaRecorder() deprecated → MediaRecorder(Context) (API 31)
    - stop() right after start() throws a RuntimeException so the app can delete the file
  - **Foreground service types:** microphone, FOREGROUND_SERVICE_MICROPHONE, and it cannot be started from the background.
  - **Context.getExternalFilesDir:**
    - no permission since KitKat
    - deleted on uninstall
    - "May return null if shared storage is not currently available"
  - **Media3:** 1.11.1 stable.

### Corrections to your notes

1. **PlayAudioExample leaked players:** playFromResource/playFromFile overwrote `player` without releasing the old one. Now every play releases the previous player, and stop() just calls release() (allowed in every state).
2. **Recording that stopped too soon:** your notes catch the RuntimeException but keep the broken file and still say "saved". Google says to delete the output file; VoiceRecorder.stop() now returns false, deletes the file, and the status says "too short, not saved".
3. **Audio focus was requested but never given back:** abandonAudioFocusRequest() was added. CAN_DUCK handling was dropped because Android 8+ ducks automatically. The slides mention Android 12's fade-out and Android 15's rule.
4. **`onRequestPermissionsResult` + REQUEST_MIC:** deprecated since activity 1.2.0. Uses the permission launcher (Lecture 6).
5. **WRITE_EXTERNAL_STORAGE (maxSdkVersion 28) in the manifest:** not needed. The app only writes to getExternalFilesDir(), which needs no permission since Android 4.4, and minSdk is 24.
6. **`getExternalFilesDir("recordings")!!`:** it can return null, so `?.` is used, with a fallback to filesDir.
7. **A damaged file crashed prepare():** it now catches IOException, releases the new player and shows a message.
8. **The SeekBar Handler** kept posting after the screen was gone. It now uses one Runnable that is removed in stopPlayback().
9. **onStop() only released the recorder:** it now stops and saves (or deletes) the recording properly.
10. **"ROM":** kept as the outline's word for internal storage, with a note that the files actually live in internal flash storage (ROM proper is read-only system memory).

## Lecture 13: MySQL, PHP & Android

**Slides: 41 in total.** That is 37 body slides plus the automatic title, objectives, Bloom and "In 2026" slides. Baseline: your "Lecture 13 _MySQL_PHP_Android.html", in its order:
1. MySQL & hosting
2. XAMPP
3. PHP
4. PHP ↔ MySQL & JSON
5. Android ↔ MySQL with AsyncTask
6. The complete StudentManagerApp
7. Test Yourself (all 6 questions)

AsyncTask stays the outline version; a coroutine version and a "going live" part were added.

### What changed

- **Four new live widgets:**
  - **Round trip** (`roundtrip`): phone → PHP → MySQL → PHP → phone, one hop per step, for one Save and one Load. It shows the real POST body, the prepared statement, the JSON reply, and whether the phone is on the UI or background thread.
  - **Table → JSON** (`rowsjson`): json_encode one row per step, with a switch between mysqli's default (numbers as "text") and real numbers.
  - **Thread lab** (`threadlab`): network call in the click listener (NetworkOnMainThreadException) vs AsyncTask vs coroutine, drawn on UI and background lanes.
  - **XAMPP control panel** (`xampp`): start or stop Apache and MySQL and see which URLs work.
- **New structure for the app code:** the network calls moved from inside the two AsyncTasks into one `StudentApi` object. Both the AsyncTask MainActivity (outline) and the coroutine MainActivity (modern) use it.
- **New slides:**
  - what MySQL is vs SQLite/Firebase
  - creating the database in phpMyAdmin
  - PHP vs Kotlin
  - db_connect.php with try/catch
  - the string-glued SQL mistake
  - the network security config
  - AsyncTask vs coroutines
  - security basics
  - going live
  - the troubleshooting cheat-sheet
- **41 defined terms.** Examples: client, server, MySQL, MariaDB, hosting, localhost, 10.0.2.2, XAMPP, Apache, phpMyAdmin, htdocs, PHP, echo, mysqli, prepared statement, bind_param, $_POST, json_encode, JSONArray, HTTP, GET/POST, status code, HttpURLConnection, URLEncoder, NetworkOnMainThreadException, AsyncTask, Dispatchers.IO, lifecycleScope, cleartext, network security config, Retrofit. 34 were added to the portal glossary, which now has 516 terms.
- **Cache:** `?v=16` / `mad-v16`.
- **Course Outline:** all 11 Lecture 13 topics land on matching slides. Three were re-pointed (creating the database, storing from the app, reading into the app).

### Verification

- **Kotlin, compiled:** all 4 Kotlin code slides compiled with Kotlin 2.2.21 (StudentApi, the AsyncTask skeleton, the AsyncTask MainActivity, the coroutine MainActivity).
- **Kotlin, run for real:** the network code ran on the JVM against a local test server.
  - The real parts: HttpURLConnection, URLEncoder, streams, kotlinx-coroutines 1.11.0 with withContext(Dispatchers.IO), and the AsyncTask stand-in running doInBackground on a separate thread.
  - The test server imitates insert.php and fetch.php: the same checks, the same JSON shape, and mysqli-style string numbers, on real SQLite.
  - Only org.json used a small stand-in (Android's version is not available on a PC), with getInt's documented string coercion.
- **Results of those runs:**
  - POST body name=Ali+Raza&roll_no=2025-CS-01&marks=85 → "Student saved"
  - an empty roll number → the 400 message
  - marks "abc" → "Please fill all fields" before any request
  - fetchAll → "Ali Raza (2025-CS-01) — 85"
  - the AsyncTask and coroutine apps list exactly what the slides show
  - with the server stopped: ConnectException (an IOException), "Could not load students" from both apps, and "Error: …" on Save
- **PHP was NOT executed:** there is no PHP or XAMPP on the build PC, and nothing was downloaded without asking you. The PHP was checked against the php.net manual, and basics.php's output was traced by hand. The JSON texts on the slides are what the test server produced, in json_encode's compact format.
- **SQL:** the MySQL statements were not run (no MySQL). The same table, insert and select were run on SQLite with SQLite spellings, which gives the slide's row. A missing roll_no hits NOT NULL, which is why insert.php now validates input.
- **XML:** the layout, the manifest and the network security config are well-formed.
- **Browser:**
  - no script errors, and all 41 slides have no sideways scrolling at 360 px
  - the four widgets were tested by script (the XAMPP panel also by hand)
  - the round-trip payload was made to wrap on phones
  - Lecture 11–12 widgets were re-checked
- **Facts checked on 26 Nov 2026:**
  - **php.net:**
    - "As of PHP 8.1.0, the default setting is MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT" (errors throw mysqli_sql_exception)
    - MYSQLI_OPT_INT_AND_FLOAT_NATIVE "Convert integer and float columns back to PHP numbers when using non-prepared statements" (so the default is strings)
  - **developer.android.com:**
    - AsyncTask "deprecated in API level 30. Use the standard java.util.concurrent or Kotlin concurrency utilities instead"
    - NetworkOnMainThreadException
    - cleartext "disabled by default" from Android 9, plus the network security config example and the android:networkSecurityConfig attribute
    - 10.0.2.2 = "Special alias to your host loopback interface (127.0.0.1 on your development machine)"
    - JSONObject.getInt coerces strings

### Corrections to your notes

1. **db_connect.php's `if ($conn->connect_error) { die(…) }`:** since PHP 8.1 mysqli throws an exception on failure, so this line is never reached. The slides use try/catch and still reply with JSON. They also add `set_charset("utf8mb4")` so Urdu names and emoji are stored correctly.
2. **insert.php used `$_POST[...]` directly:** a missing field gave a warning and then a NOT NULL error, and "abc" marks were not checked. Added: `?? ""`, trim, FILTER_VALIDATE_INT, a 400 reply with a JSON message, the JSON Content-Type header, and the new id in the reply. Your prepared statement was already correct. 👍
3. **fetch.php's numbers arrive as text** ("85") with mysqli's default. The slides say so; your Kotlin `getInt()` still works because org.json converts them.
4. **`android:usesCleartextTraffic="true"`** allows plain HTTP to every address. A network security config now allows it for 10.0.2.2 only (add the PC's Wi-Fi IP for a real phone); real hosting uses HTTPS.
5. **The app only checked for empty boxes**, so "abc" marks reached the server. It now uses toIntOrNull. The Toast showed the raw JSON text; it now shows the server's "message".
6. **AsyncTask:** kept as the outline version and clearly marked deprecated (API 30), with the reference's reasons. The modern coroutine version uses the same StudentApi.
7. **The ListView used `match_parent` under the buttons:** it now uses 0dp + weight 1. The manifest's `package="…"` is the Gradle namespace since AGP 8.
8. **The closing `?>`** in PHP-only files is left out (the usual style), so no stray whitespace can break a JSON reply.

## Lecture 12: Firebase in Android

**Slides: 44 in total.** That is 40 body slides plus the automatic title, objectives, Bloom and "In 2026" slides. Baseline: your "Lecture 12 Firebase_in_Android.html", in the order of its 10 sections:
1. What is Firebase
2. SDK
3. Project
4. Connecting the app
5. Server settings
6. Create user
7. Sign in
8. Storing data
9. Snapshot and retrieving
10. The complete real-time app, plus your 6-question quiz

### What changed

- **Compose removed.** Every screen uses ViewBinding. Your notes' API style is kept (`FirebaseAuth.getInstance()`, `FirebaseDatabase.getInstance()`).
- **Four new live widgets:**
  - **JSON tree** (`jsontree`): setValue of a single value, an object, the same fixed key again (it is *replaced*), two push() calls (*added*), and removeValue(). Each step highlights what changed.
  - **Live sync** (`rtsync`): phone A, the server tree and phone B.
    - Adds and a console edit reach both phones.
    - Phone B goes offline, misses one add, then catches up when it is back online.
    - Each phone shows how many times onDataChange has run.
  - **Authentication flow** (`authflow`): the phone screen next to the console's Users tab.
    - Short password, then an account created (with a UID).
    - Duplicate email, then a wrong password with the generic message.
    - Login, auto-login through currentUser, and signOut.
  - **Security Rules checker** (`rulescheck`): test mode / auth != null / owner-only / locked × signed in or not × read or write × path. It shows the rule JSON and Allowed or Permission denied with the reason.
- **New slides:**
  - SQLite vs Firebase
  - the JSON tree
  - Realtime Database vs Firestore
  - know your console
  - the Assistant way and the manual way
  - testing the connection
  - the database-URL mistake
  - the test-mode mistake
  - reading once
  - DataSnapshot
  - the never-removed listener (mistake)
  - the complete layout and manifest
  - the troubleshooting cheat-sheet
- **39 defined terms.** Examples: Firebase, Realtime Database, Cloud Firestore, NoSQL, JSON, node, SDK, BoM, google-services.json, Google Services plugin, Firebase Authentication, UID, currentUser, email enumeration protection, asynchronous, Task, DatabaseReference, setValue(), push(), removeValue(), default value, DataSnapshot, addValueEventListener, removeEventListener, Security Rules, test mode, Spark plan. 29 were added to the portal glossary, which now has 482 terms.
- **Cache:** `?v=15` / `mad-v15`.
- **Course Outline:** all 10 Lecture 12 topics land on matching slides. Four were re-pointed to the new, more specific slides: Register, Sign in, Store a single value and DataSnapshot.

### Verification

- **Kotlin:** all 9 Kotlin code slides were taken straight from the deck and compiled together with Kotlin 2.2.21 against stand-in Firebase classes. The stand-ins are an in-memory JSON server with listeners, Auth with accounts and currentUser, and getValue() that rebuilds objects through the empty constructor, as Firebase does. Simulated:
  - **Writing:**
    - the connection test writes "Hello Firebase!"
    - a single value saves, and a denied write gives "Permission denied"
    - an object is stored as {age, city, name}
    - two push() calls give two different keys
  - **Reading:**
    - read-once returns the value or "No data"
    - the real-time list updates on every add
    - a class **without** default values cannot be read (NoSuchMethodException)
  - **Register:** empty fields, a short password, mismatched passwords, success (also signed in), a duplicate email.
  - **Login:** a wrong password, success, and auto-login on reopening.
  - **MainActivity:** save, an empty-age check, the listener removed on Home and re-added on return, and logout.
- **JSON:** the database-tree slide and both rule files parse.
- **XML:** activity_main and the manifest are well-formed.
- **Browser:**
  - no script errors, and all 44 slides have no sideways scrolling at 360 px
  - the four widgets were tested by script and the rules checker by hand
  - the live-sync phones were made shorter on phones
  - Lecture 10 and 11 widgets were re-checked
- **Facts checked on 26 Nov 2026:**
  - **Android setup guide** (firebase.google.com): BoM 35.2.0, google-services plugin 4.6.0, API 24+.
  - **Realtime Database start guide:**
    - test mode "allows anyone to read and overwrite your data" and denies everything after a trial period
    - non-us-central1 databases have …REGION.firebasedatabase.app URLs, and "you must pass the database URL to getInstance()"
    - the console path is Databases & Storage > Realtime Database
  - **Read and Write guide:**
    - custom classes need "a default constructor that takes no arguments"
    - setValue "overwrites data at the specified location"
    - detach listeners with removeEventListener()
  - **Realtime Database limits:** "The Spark plan limit on simultaneous connections is 100."
  - **Password-auth guide:** "If the new account was created, the user is also signed in"; the console path is Security > Authentication.
  - **Basic Security Rules:** the owner-only pattern.
  - **Google Cloud Identity Platform:** email enumeration protection is on by default for projects created on or after 15 Sep 2023; invalid sign-ins return INVALID_LOGIN_CREDENTIALS.

### Corrections to your notes

1. **Database location vs code:** your notes suggest asia-southeast1 "closer = faster", but the code calls `FirebaseDatabase.getInstance()` with no URL. Firebase's docs say a database outside us-central1 must be opened with its URL. There is a mistake slide and a cheat-sheet line.
2. **The listener is attached in onCreate and never removed:** it keeps using data and battery after the screen is gone, and a second one is added when onCreate runs again. It is now attached in onStart and removed in onStop with removeEventListener (Lecture 9's pairs).
3. **Old versions:** BoM 33.1.2 → 35.2.0, google-services plugin 4.4.2 → 4.6.0. The project-level file no longer repeats AGP/Kotlin versions, so it fits any new project.
4. **Console menu names:** "Build → Authentication / Realtime Database" is now **Security → Authentication** and **Databases & Storage → Realtime Database**.
5. **Register → Login:** a new account is *already signed in*. After Register, LoginActivity's auto-login jumps straight to MainActivity; the notes say so.
6. **"Wrong email or wrong password":** new projects (since 15 Sep 2023) return one generic INVALID_LOGIN_CREDENTIALS error anyway. Your "one polite message" habit matches this.
7. **Spark plan "1 GB storage, 100 connections":** the 100-connection limit is confirmed; the storage figure could not be confirmed on a Firebase page, so the slides quote only the connections. Check firebase.google.com/pricing before quoting other numbers.
8. **Small fixes:**
   - `push().key!!` → `push().key ?: return`, or simply `push().setValue(…)`.
   - The live list is built with mapNotNull + joinToString instead of `result +=`.
   - `findViewById` → ViewBinding.

## Lecture 11: SQLite in Android

**Slides: 42 in total.** That is 38 body slides plus the automatic title, objectives, Bloom and "In 2026" slides. Baseline: your "Lecture 11 _SQLite_in_Android.html", in the order of its 8 sections:
1. What is SQLite
2. Installing (nothing to install)
3. SQL commands
4. The four classes
5. The Student CRUD app
6. The Login & Registration app
7. Checking stored data
8. Summary and quiz

Filters (an outline topic) and Room were added.

### What changed

- **Compose removed** (the old Room example used it). Every screen uses ViewBinding.
- **Three new live widgets:**
  - **Cursor walker** (`cursorwalk`): the cursor arrow starts "before first", moves row by row, shows moveToNext()'s true/false, lights up the matching Kotlin line, builds the output, and ends with close().
  - **Filter builder** (`sqlfilter`): drop-downs for marks ≥, name starts with, city, ORDER BY and LIMIT. It shows the SQL with ? placeholders, the args array and the matching rows of an 8-student table, with six presets.
  - **SQL injection demo** (`injection`): type a username and password and switch between "glued into the string" and "? placeholders". The classic `' OR '1'='1` logs in without the password only in the glued version; a stray quote (O'Brien) crashes it.
- The existing `table` widget now animates the full CRUD sequence, including "a deleted id is not reused" (AUTOINCREMENT) and "DELETE without WHERE".
- **New slides:**
  - SQLite vs the other storage options
  - where the .db file lives
  - the five SQL commands with results
  - the UPDATE/DELETE-without-WHERE mistake
  - onCreate vs onUpgrade
  - the Cursor walk
  - the complete layout and MainActivity
  - the Login & Registration flow, helper, both Activities and both layouts
  - the injection demo and its mistake slide
  - passwords in real apps
  - the filter builder, query() in Kotlin and common SQL filters with results
  - checking data (Database Inspector + DB Browser)
  - Room in three files, SQLiteOpenHelper vs Room, and closing the Cursor
  - your 5-question quiz
- **39 defined terms.** Examples: database, SQLite, SQL, relational, serverless, primary key, AUTOINCREMENT, CRUD, WHERE, SQLiteOpenHelper, ContentValues, Cursor, execSQL, rawQuery, query(), onUpgrade, placeholder, SQL injection, getColumnIndexOrThrow, LIKE, ORDER BY, LIMIT, Database Inspector, hash, Room, Entity, DAO. 34 were added to the portal glossary, which now has 453 terms.
- **Cache:** `?v=14` / `mad-v14`.
- **Course Outline:** all 6 Lecture 11 topics already land on matching slides.

### Verification

- **SQL on real SQLite** (Node's built-in node:sqlite):
  - the five-commands slide and its output panel
  - the whole CRUD animation, step by step: ids 1, 2, 3; delete 3; the new row gets id 4; DELETE without WHERE empties the table
  - the UNIQUE username rejecting a duplicate ("UNIQUE constraint failed")
  - the injection: the glued `' OR '1'='1` returns every row, the placeholder version returns none, and O'Brien gives a syntax error
  - all six filter-builder presets, which match the widget's own results
  - the six "Common filters" lines, which match the output panel
  - search(21, "S") → Saad (22), Sana (21)
- **Kotlin:** all 7 Kotlin code slides were taken straight from the deck and compiled together with Kotlin 2.2.21 against stand-in Android classes, backed by a small in-memory table. The simulations covered:
  - insert/read/update/delete return values
  - search
  - the cursor walk, with every cursor closed afterwards
  - onUpgrade dropping the rows
  - every button in MainActivity, including the empty age box and an id that does not exist
  - the Login helper (UNIQUE, right and wrong password)
  - RegisterActivity: empty fields, mismatched passwords, a new account, a taken name
  - LoginActivity: success opens WelcomeActivity with USER_NAME, a wrong password, and SIGNUP
  - The Room file was compiled against stand-in annotations; Room's code generator itself was not run.
- **XML:** the CRUD layout and the register/login layouts are well-formed.
- **Browser:** no script errors; all 42 slides have no sideways scrolling at 360 px; the widgets were tested by script and by hand (including a manual filter); Lecture 9 and 10 widgets re-checked.
- **Facts checked on 26 Nov 2026:**
  - developer.android.com, "Save data using SQLite":
    - "we highly recommended using the Room Persistence Library"
    - getWritableDatabase()/getReadableDatabase() "are expensive to call when the database is closed … optimal to close the database in the onDestroy()"
    - read columns with getColumnIndex()/getColumnIndexOrThrow()
    - open the database on a background thread
  - Database Inspector: needs API 26+, and is read-only while "Live updates" is on.
  - Room releases: 2.8.5 stable, KSP for Kotlin.
  - sqlite.org/autoinc: "The AUTOINCREMENT keyword imposes extra CPU, memory, disk space, and disk I/O overhead and should be avoided if not strictly needed".

### Corrections to your notes

1. **`toInt()` on the age/id boxes** crashes when a box is empty. The slides use `toIntOrNull()` with a message.
2. **`db.close()` inside every helper function:** Google advises keeping the connection open and closing the helper in the Activity's onDestroy(), because reopening is expensive. The slides do that.
3. **Reading columns by number** (`getInt(0)`, `getString(1)`): this breaks silently if the column order changes. The slides use `getColumnIndexOrThrow("name")`, as Google's guide does. Numbers stay only where the query lists its own columns.
4. **Cursors closed by hand:** correct, but easy to miss on early returns. The slides use `.use { }`.
5. **`onUpgrade` = DROP + CREATE** deletes every saved row. It is kept for learning, with a note that real apps use ALTER TABLE.
6. **AUTOINCREMENT:** it is kept because your notes and exams use it. sqlite.org says it is usually unnecessary (INTEGER PRIMARY KEY already fills ids); its only effect is that deleted ids are never reused, which the CRUD animation shows.
7. **Update/Delete silently did nothing for an unknown id.** The slides now report "No student with id …". Register ignored insertEntry()'s result; it now shows "Registration failed".
8. **USERNAME had no UNIQUE rule:** it is added as a safety net behind userExists().
9. **Plain-text passwords:** your notes already warn about this. A slide adds: store a salted, slow hash, or better, use a login server (Firebase Authentication, Lecture 12).
10. **"The Database Inspector updates live while the app runs":** only with the "Live updates" box ticked (then the table is read-only). It needs API 26+.
11. **`onCreate(db: SQLiteDatabase?)` + `db?.execSQL`:** Android always passes a database, so the non-null type is used.
12. **The heading says "Lecture 9"** (left over from an earlier numbering); this is Lecture 11.

## Lecture 10: Lists, Location & Geocoder

**Slides: 44 in total.** That is 40 body slides plus the automatic title, objectives, Bloom and "In 2026" slides. Baseline: your "Lecture 10 ListView.html" (Complete Deep Lecture). Its four chapters are kept in order:
1. ListView: ArrayAdapter, custom row, BaseAdapter + ViewHolder
2. AutoCompleteTextView
3. Location: GPS vs network, latitude/longitude, getting the location
4. Progress and Geocoder

RecyclerView is kept as the modern bridge.

### What changed

- **Compose removed** (the old "RecyclerView vs LazyColumn" slide). Every screen uses ViewBinding.
- **The old deck taught RecyclerView first and the ListView only at the end.** The outline asks for ListView, so ListView is now taught in full and RecyclerView follows as "ListView → RecyclerView".
- **Three new live widgets:**
  - **getView lab** (`getviewlab`): scroll a 20-song ListView one row at a time. It counts getView(), inflate() and findViewById() calls, and two switches turn off "reuse convertView" and "ViewHolder (tag)". It shows the one spare row a real list inflates on the first scroll.
  - **Latitude/longitude map** (`latlng`): an equator / prime-meridian grid with Karachi, Lahore, London, New York and Sydney. It shows the sign rules and the Kotlin values.
  - **Location flow** (`locflow`): your three phone mock-ups (idle, progress, result), plus the permission dialog and the address, as one 5-step phone animation with the code for each step.
- **New slides:**
  - ArrayAdapter's three arguments
  - BaseAdapter's four methods
  - the forgotten notifyDataSetChanged() mistake
  - the RecyclerView adapter and LayoutManager
  - the two-provider table
  - the manifest
  - the fused-provider code
  - your LocationManager code with fixes
  - leaving updates running (mistake)
  - ProgressBar in the layout
  - Geocoder Address fields
  - geocoding on the main thread (mistake)
  - five quizzes and a "My Places" practical
- **39 defined terms.** Examples: adapter, ArrayAdapter, BaseAdapter, getView(), convertView, inflate, ViewHolder, tag, recycling, LayoutManager, completionThreshold, GPS, network location, fused location provider, latitude, longitude, accuracy, Geocoder, reverse geocoding, ProgressBar, indeterminate, main thread, lifecycleScope. 25 were added to the portal glossary, which now has 419 terms.
- **Cache:** `?v=13` / `mad-v13`.
- **Course Outline:** all 7 Lecture 10 topics land on matching slides. "Introduction to ListView" and "Latitude, longitude…" were re-pointed.

### Verification

All 10 Kotlin code slides were taken straight from the deck and compiled together with Kotlin 2.2.21 against stand-in Android classes, then driven with simulated taps, scrolling, permission answers, location fixes and geocoder results.

- **ArrayAdapter:** tap position 4 → "You selected: France"; long-press position 1 → "Deleted: China", and the list redraws with 7 rows.
- **SongAdapter:**
  - tap → "Now playing: Levitating — Dua Lipa"
  - long-press → "Removed: Blinding Lights" (3 rows)
  - a simulated ListView with 5 visible rows scrolling through 20 songs: 20 getView() calls, **6 inflations** (5 + 1 spare), the rest reused
- **RecyclerView:** the 3 rows bind as shown and a tap on Sara shows the Toast. Without a LayoutManager nothing is laid out ("No layout manager attached; skipping layout").
- **AutoComplete:**
  - "Lon" → London (LHR), London (LGW)
  - From = Karachi (KHI) with To empty → "Please enter destination city."
  - From = To = Dubai (DXB) → "Departure and destination must be different."
  - Karachi (KHI) → Dubai (DXB) → "Searching flights: Karachi (KHI) ➜ Dubai (DXB)"
- **Fused location + Geocoder:**
  - allow → spinner shown and hidden, then "Latitude: 24.8607", "Longitude: 67.0011 (± 12 m)", and the address via the listener (Android 16)
  - deny → "Location permission denied."
  - location off → "No location. Is location turned on?"
  - Android 11 → the blocking lookup runs off the main thread
  - Android 11 offline → the friendly message
  - no geocoder → "Address lookup is not available on this phone."
- **LocationManager:** a fix gives "Provider: GPS | ± 8.0 m" and removes the updates; Home → updates removed in onStop; a null provider → "unknown".
- **ProgressBar:** shown, then hidden, and the button is re-enabled.
- **XML:** the ListView layout, the custom row, the manifest and the ProgressBar are well-formed.
- **Browser:** no script errors; all 44 slides have no sideways scrolling at 360 px; the three widgets were tested by script; Lecture 8 and 9 widgets re-checked.
- **Facts checked on 26 Nov 2026:**
  - Geocoder reference:
    - getFromLocation(lat, lng, max) "was deprecated in API level 33. Use getFromLocation(…, GeocodeListener) instead to avoid blocking a thread waiting for results"
    - "Use the isPresent() method to determine whether a Geocoder implementation exists"
  - Location reference: getProvider() "may be null"; accuracy is a radius at the 68th percentile.
  - Get the last known location guide: use the fused location provider; getCurrentLocation() "is the recommended way to get a fresh location … safer than … requestLocationUpdates()"; the location can be null.
  - ProgressDialog reference: deprecated in API 26, "use a progress indicator like ProgressBar, which can be embedded in your app's UI".
  - developers.google.com setup page: play-services-location 21.4.0.

### Corrections to your notes

1. **The GPS app does not compile:**
   - `"📍 "${lines.joinToString("\n")}…` has one quote too many.
   - `location.provider.uppercase()` fails because `getProvider()` can return null. Use `location.provider?.uppercase() ?: "unknown"`.
2. **Geocoder on the main thread "throws NetworkOnMainThreadException":** the documented problem is that the old call blocks the thread while waiting (the app can freeze until "App isn't responding"). The method is deprecated in API 33; the slides use the listener version on 13+ and a background coroutine before that, and check `Geocoder.isPresent()` first.
3. **`CoroutineScope(Dispatchers.IO).launch` in an Activity** keeps running after the Activity is destroyed. Use `lifecycleScope` (cancelled automatically).
4. **removeUpdates only in onDestroy:** onDestroy may never run (Lecture 9). Remove updates in onStop, or use `getCurrentLocation()` for a single fix.
5. **LocationManager vs fused provider:** Google recommends the fused location provider and `getCurrentLocation()` for a fresh location. Your LocationManager version is kept (it needs no Google library), with the fixes above.
6. **`onRequestPermissionsResult` + request codes:** these are deprecated since activity 1.2.0. Use the permission launcher from Lecture 6.
7. **The ProgressDialog replacement:** an AlertDialog with a ProgressBar avoids the deprecated class, but it is still a blocking dialog. Google's advice is a ProgressBar inside the layout, and the slides do that.
8. **findViewById + a separate ViewHolder class:** replaced by ViewBinding. In the BaseAdapter, the row's binding object is stored in the tag and acts as the ViewHolder. Both versions are correct, and the notes say so.
9. **build.gradle snippets:**
   - `minifyEnabled = false` is Groovy syntax; in .kts it is `isMinifyEnabled = false`.
   - Java 1.8 / `kotlinOptions` are older than the current template (Java 11 and `compilerOptions`).
   - The manifest's `package="…"` is the Gradle `namespace` since AGP 8.
10. **INTERNET permission "required by GeoCoder":** not claimed on the slides. The notes say it is a normal permission granted automatically, so keeping it does no harm.
11. **Hard-coded white/grey row text** for a dark background was removed so rows work in light mode too.

## Lecture 9: Activity Life Cycle & Splash Screen

**Slides: 43 in total.** That is 39 body slides plus the automatic title, objectives, Bloom and "In 2026" slides. Baseline: your "Lecture 9 android_lifecycle_lecture.html". The order follows it: Activity → life cycle (human-life analogy) → Facebook scenario → one slide per callback → reference table → the ActivityLifeCycleDemo project → splash screen → your SplashScreenDemo. Rotation and the modern splash were added.

### What changed

- **Compose removed** (the old ViewModel and splash examples used `setContent`). Every screen now uses ViewBinding.
- **The lifecycle simulator was fixed and extended:**
  - Its "Back" button wrongly destroyed the first screen. It is now "Back on the first screen (Android 12+)" → onPause, onStop only.
  - A new "finish()" button shows the full destroy.
  - Each callback slide shows its own part of the diagram.
- **Two new live widgets:**
  - **Rotation lab** (`rotatelab`): one counter kept three ways (a plain variable, the onSaveInstanceState Bundle, a ViewModel). The buttons are Rotate, Home → Kill the process → Return, and finish(), with the callbacks in a Logcat box. It shows that rotation keeps the Bundle and the ViewModel, process death keeps only the Bundle, and finish() keeps nothing.
  - **Splash timeline** (`splashrace`): what the user sees over 4 seconds with the old 3-second SplashActivity (two splashes on Android 12+) vs the SplashScreen API.
- **New slides:**
  - onStart vs onResume and onPause vs onStop
  - the demo layout
  - watching the callbacks in Logcat
  - forgetting `super`
  - Android 12 Back behaviour
  - onSaveInstanceState counter, ViewModel counter, lifecycle-aware component
  - "Android kills processes, not Activities"
  - "Since Android 12, every app has a splash"
  - the modern splash in three steps (library and theme, manifest, `installSplashScreen()`)
  - five quizzes
- **39 defined terms.** Examples: callback, override, super, savedInstanceState, Bundle, Logcat, focus, multi-window, configuration change, process death, ViewModel, viewModels(), root activity, cold/warm start, SplashScreen API, installSplashScreen(), setKeepOnScreenCondition, Handler, Looper, postDelayed. 27 were added to the portal glossary, which now has 394 terms.
- **Cache:** `?v=12` / `mad-v12`.
- **Course Outline:** all 5 Lecture 9 topics land on matching slides; "Creating a splash screen" now opens the modern step 1.

### Verification

All six Kotlin code slides were taken straight from the deck and compiled together with Kotlin 2.2.21 against stand-in Android classes. The order in which Android calls the callbacks was then simulated.

- **Demo:** open → 1, 2, 3; Home → 4, 5; reopen → 6, 2, 3; rotate → 4, 5, 7, 1, 2, 3. This is exactly the Logcat output on the slide.
- **Counter:** onSaveInstanceState: 3 taps → rotate → 3. ViewModel: 3 → rotate → 3; finish() + open → 0.
- **Lifecycle observer:** open → "start location updates"; Home → "stop location updates".
- **Old splash:** at 2.999 s still on the splash; at 3 s MainActivity starts and SplashActivity finishes.
- **Modern splash:** `installSplashScreen()` runs before `super.onCreate`; after loading, the keep-on-screen condition is false.
- **XML:** the demo layout, themes.xml and the manifest are well-formed.
- **Browser:** no script errors; all 43 slides have no sideways scrolling at 360 px; both widgets tested by script and by hand; Lecture 8's widgets re-checked.
- **Facts checked on developer.android.com (26 Nov 2026):**
  - Activity lifecycle guide:
    - "don't use onPause to save application or user data … perform heavy-load shutdown operations during onStop"
    - in multi-window, a paused activity can be fully visible
    - "The system never kills an activity directly … it kills the process"
  - Android 12 behaviour changes: "Root launcher activities are no longer finished on Back press".
  - Splash screens:
    - since Android 12 the system splash shows on cold and warm starts for all apps
    - custom splash screens should migrate to the SplashScreen API
    - call `installSplashScreen()` before `super.onCreate()`
    - the compat library works from API 23
  - core-splashscreen stable is 1.2.0 (Core releases page).
  - The Activity releases page: `by viewModels()` moved from activity-ktx into activity (1.9.0), so no extra dependency is needed.

### Corrections to your notes

1. **Back = onDestroy:** this is no longer true on the first screen on Android 12+, where Back only stops it, like Home. The simulator, a compare slide and a quiz cover this.
2. **"onPause … save draft data" and "Android may kill your activity after this":** Google says not to save data in onPause; save in onStop. Since Android 3.0, visible (paused) apps are rarely killed; stopped ones are.
3. **"User swipes away app from recents → onDestroy":** usually the process is just killed and no callback runs, so never rely on onDestroy to save data.
4. **Phone call → onPause only:** a full-screen incoming call hides the app, so onStop follows. A small heads-up call notification does not pause it.
5. **The SplashActivity with a 3-second Handler:**
   - On Android 12+ it shows the system splash and then a second one, and always wastes about 3 seconds.
   - Google asks apps to migrate to the SplashScreen API. The old code is kept as "the old way" (still worth knowing for exams); the modern version is taught in three steps.
6. **Manifest `package="…"`:** since AGP 8 the package name is the `namespace` in build.gradle.kts (as corrected in Lecture 3).
7. **"Skipping super.onCreate causes a RuntimeException":** the exact error is `SuperNotCalledException` ("did not call through to super.onCreate()").
8. **Min SDK API 21:** the course template uses API 24. The splash compat library needs API 23+.
9. **Small fixes:**
   - `SPLASH_DELAY` → `splashDelay`, because Kotlin style uses camelCase for a private val.
   - Hard-coded colours: the slides now note that they belong in colors.xml so dark mode works.

## Lecture 8: Android Data Storage

**Slides: 34 in total.** That is 30 body slides plus the automatic title, objectives, Bloom and "In 2026" slides. Baseline: your "Lecture 8.html". The order follows it: why store data → key factors → the four options and how to choose → SharedPreferences in full (create, store, apply vs commit, retrieve, delete) → the SharedPrefDemo project → remember me → combining storage. Your SQLite, MySQL + PHP and Firebase code is left for Lectures 11–13, as in the course outline; this lecture only previews them.

### What changed

- **Compose and Java removed.** Kotlin + XML + ViewBinding only.
- **Two new live widgets:**
  - **SharedPreferences demo** (`prefsdemo`): a phone running SharedPrefDemo next to the real `MyPrefs.xml` file. Save, Close app, Open again, Load and Clear show that the screen forgets but the file remembers. An empty age shows "Enter a valid age", the same as the fixed code.
  - **Storage chooser** (`storechooser`): your decision flowchart as four Yes/No questions. It recommends SharedPreferences, SQLite/Room, Firebase or MySQL + PHP, and steps through four example apps.
- **New slides:**
  - the real XML file behind SharedPreferences
  - when to use / not use
  - apply() vs commit() side by side
  - remember-me flow
  - SharedPreferences vs DataStore
  - internal storage folder tree and private file code
  - shared/scoped storage
  - three mistake slides (a list in prefs, passwords, forgetting apply())
- **32 defined terms.** Examples: persistent, key-value pair, MODE_PRIVATE, Editor, apply(), commit(), default value, scope function, DataStore, internal storage, scoped storage, MediaStore, Android Keystore, token. 22 were added to the portal glossary, which now has 367 terms.
- **Cache:** `?v=11` / `mad-v11`.
- **Course Outline:** all 4 Lecture 8 topics land on matching slides ("The four main options", "Creating SharedPreferences", "Storing data with the Editor").

### Verification

All Kotlin was compiled with Kotlin 2.2.21 against stand-in Android classes, and each code slide's lines were checked to be identical to the tested file.

- **Create / store / read / delete:**
  - fresh install → Guest · 0 · false
  - after storing → Ali · 20 · true, and `all` lists every key
  - remove("username") → Guest, the age stays; clear() → 0 keys
  - logout clears, opens LoginActivity and finishes
- **SharedPrefDemo:** Load on a fresh install → No Name / 0; empty age → "Enter a valid age"; Ali + 21 → "Data Saved!"; a new screen (app reopened) → Load → Name: Ali, Age: 21.
- **Private file:** readNote() before saving → ""; after saveNote("Buy milk") → "Buy milk".
- **XML:** the MyPrefs.xml example and activity_main.xml are well-formed.
- **The DataStore snippet was not compiled** (it needs the DataStore library and coroutines); it follows the official guide and the slide says so in the notes.
- **Browser:** no script errors; all 34 slides have no sideways scrolling at 360 px; both widgets tested by script and by hand.
- **Facts checked on developer.android.com (26 Nov 2026):**
  - The SharedPreferences guide: "DataStore is a modern data storage solution that you should use instead of SharedPreferences".
  - `android.preference.PreferenceManager` deprecated in API 29.
  - Jetpack Security (security-crypto): all APIs deprecated in 2025 "in favor of existing platform APIs and direct use of Android Keystore".

### Corrections to your notes

1. **SharedPrefDemo crashes on an empty age:** `etAge.text.toString().toInt()` throws NumberFormatException. It is now `toIntOrNull()` with a Toast.
2. **findViewById + five lateinit views** replaced with ViewBinding.
3. **Key spelling:** the notes use "userAge" in the snippets and "userage" in the project. Keys are case-sensitive, so a value saved under one is not found under the other. The project slide uses one spelling throughout, and the notes warn about it.
4. **`PreferenceManager.getDefaultSharedPreferences`:** the `android.preference` version is deprecated since API 29; use AndroidX Preference if needed, or just a named file.
5. **"Sensitive passwords (use encryption)":** EncryptedSharedPreferences (Jetpack Security) is deprecated. The advice is now: never store passwords; store a login flag or server token, and use the Android Keystore for real secrets.
6. **"apply() saves data in the background thread":** more exactly, memory updates at once and only the disk write happens in the background.
7. **SharedPreferences as the default choice:** Google now recommends DataStore for new code. SharedPreferences stays the main topic (outline and existing apps), with a DataStore comparison slide.
8. **Firebase "1 GB free":** free-plan limits change; the notes say to check firebase.google.com/pricing before quoting numbers.

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
