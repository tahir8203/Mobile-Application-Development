/* Portal content for the MAD course: 2026 updates, cheat sheets, viva questions, error fixes, project ideas.
   Text supports **bold** and `code`. Android facts name the API level where a rule started, so they stay true as new versions ship. */
window.MAD_PORTAL={
version:'2.0',
apk:'https://github.com/tahir8203/Mobile-Application-Development/releases/latest/download/MAD-Course.apk',

levels:['Beginner','Kotlin Coder','View Builder','Intent Sender','Permission Pro','Data Keeper','Thread Tamer','Service Runner','App Architect','Play Store Ready'],

tips:[
 ['Android Studio','Press **Shift twice** to search everything: files, classes, settings and actions.'],
 ['Android Studio','**Alt + Enter** on a red or yellow underline shows quick fixes. It adds imports, creates functions and fixes typos.'],
 ['Android Studio','**Ctrl + Alt + L** reformats the file. Do it before you submit any assignment.'],
 ['Android Studio','**Ctrl + B** (or Ctrl + click) jumps to where a function, class or resource is defined.'],
 ['Android Studio','**Shift + F10** runs the app. **Ctrl + F9** only builds it, which is faster for checking errors.'],
 ['Logcat','Filter Logcat with `package:mine level:error` to see only your app’s errors.'],
 ['Logcat','When an app crashes, read the **first** line that starts with `Caused by:`. The blue link under it opens the exact line.'],
 ['Kotlin','Use `val` by default. Change to `var` only when the compiler tells you the value must change.'],
 ['Kotlin','`name?.length ?: 0` means: the length of name, or 0 when name is null. No `if` needed.'],
 ['Kotlin','String templates beat `+`: write `"Hello $name, you have ${list.size} items"`.'],
 ['Kotlin','`when` replaces long if / else-if chains and can return a value: `val grade = when { m >= 80 -> "A" else -> "B" }`.'],
 ['Layouts','Sizes in **dp**, text in **sp**. Never use px: screens have very different densities.'],
 ['Layouts','In ConstraintLayout every view needs at least one horizontal and one vertical constraint, or it jumps to the top-left at run time.'],
 ['Layouts','`0dp` in ConstraintLayout means “match the constraints”. It is how a view fills the space between two others.'],
 ['Layouts','Put every visible text in `strings.xml`. It makes translation (Urdu, Arabic) possible later.'],
 ['Intents','Pass data with `putExtra("key", value)` and read it with `intent.getStringExtra("key")`. The key must match exactly.'],
 ['Permissions','Ask for a permission **when the user taps the feature**, not when the app starts. People refuse requests they do not understand.'],
 ['Permissions','A permission needs two things: the `<uses-permission>` line in the manifest **and**, for dangerous ones, a run-time request.'],
 ['Database','Always use `?` placeholders in SQL. Joining user text into a query lets one quote mark break it.'],
 ['Database','Close every `Cursor`. The easy way: `cursor.use { ... }`.'],
 ['Threads','If the screen freezes for about 5 seconds Android shows “App not responding”. Move network, database and file work off the main thread.'],
 ['Threads','Only the main thread may touch views. From a background thread use `runOnUiThread { }` or `withContext(Dispatchers.Main)`.'],
 ['Gradle','After editing a `build.gradle.kts` file press **Sync Now**. Until you do, the editor still uses the old settings.'],
 ['Emulator','From the emulator, your PC’s `localhost` is **10.0.2.2**. Use it to reach XAMPP.'],
 ['Phone testing','Turn on Developer options by tapping **Build number** seven times, then enable USB debugging.'],
 ['Debugging','Click the left margin to set a breakpoint, then run with the bug icon. Hover any variable to see its value.'],
 ['Git','Commit after every working feature. A small commit you can go back to is worth more than a big one you cannot.'],
 ['Play Store','Raise `versionCode` by one for every release. The Play Store refuses an upload with a number it has seen before.'],
 ['Study','After each lecture, close the slides and write the main idea in three lines. If you cannot, watch it once more.'],
 ['Study','Type code yourself. Copy-paste teaches your clipboard, not you.']
],

/* One "In 2026" slide per lecture, added before the summary slide. */
thenNow:{
 1:['Kotlin has been Google’s recommended Android language since 2019. New Android features and samples arrive in Kotlin first.','**Jetpack Compose** is the recommended toolkit for new screens. The XML Views in this course still run in most existing apps, so both are worth knowing.','Cross-platform options matured: **Flutter**, **React Native** and **Kotlin Multiplatform** share code between Android and iOS.','Android now runs on phones, foldables, tablets, watches, TVs and cars. One new version ships every year.'],
 2:['Kotlin 2.x uses the **K2 compiler**, which builds much faster. The language you learn here is unchanged.','Null safety, `data class`, `when` and string templates are used in every modern Android codebase.','**Coroutines** (`suspend`, `launch`) are how Kotlin does background work today. You meet them in Lecture 15.','Try any snippet instantly at play.kotlinlang.org. No install needed.'],
 3:['New projects use **Kotlin DSL** build files (`build.gradle.kts`) and a **version catalog** (`gradle/libs.versions.toml`).','The default template is now Compose. For this course choose **Empty Views Activity** to get XML layouts.','**Gemini in Android Studio** can explain a crash or suggest code. Check its answers: it can be wrong.','Android Studio can mirror a real phone’s screen and pair over Wi-Fi, so a USB cable is optional.'],
 4:['**View Binding** replaces `findViewById`: `binding.btnSave.setOnClickListener { }`. The old Kotlin synthetics were removed.','**ConstraintLayout** is the default layout. Material 3 components (`MaterialButton`, `TextInputLayout`) give a modern look.','Use a **Snackbar** when the message has an action such as Undo. Use a Toast only for a short notice.','In Compose the same screen is Kotlin functions: `Column { Text("Hi"); Button(onClick = { }) { Text("OK") } }`.'],
 5:['`registerForActivityResult` replaces `startActivityForResult` and `onActivityResult`.','Android 11+ hides other apps by default. Add a `<queries>` block in the manifest before checking who can handle an intent.','Google Play only lets default SMS or phone apps hold SMS and call-log permissions. Other apps open the dialer or SMS app with an intent.','A `PendingIntent` must say `FLAG_IMMUTABLE` or `FLAG_MUTABLE` on Android 12+.'],
 6:['Request permissions with `registerForActivityResult(RequestPermission())`. It is shorter than `onRequestPermissionsResult`.','Android 13+ needs the run-time permission **POST_NOTIFICATIONS** before a notification appears.','Android 13+ splits storage into `READ_MEDIA_IMAGES`, `READ_MEDIA_VIDEO` and `READ_MEDIA_AUDIO`. The **photo picker** needs no permission at all.','Users can grant location as approximate only, give one-time access, and Android removes permissions from apps that are not used.'],
 7:['Every notification needs a **channel** (Android 8+) and the POST_NOTIFICATIONS permission (Android 13+).','Since Android 10 an app cannot switch Wi-Fi on or off. Open the settings panel and let the user do it.','Android 12+ uses the run-time permissions `BLUETOOTH_CONNECT` and `BLUETOOTH_SCAN`.','**CameraX** is the Jetpack library for an in-app camera. **Coil** or **Glide** load and cache images.'],
 8:['**DataStore** is the modern replacement for SharedPreferences. It is asynchronous and safe from the main thread.','**Room** sits on top of SQLite and checks your SQL when the app builds.','For new Firebase apps Google recommends **Cloud Firestore**. Realtime Database is still supported and is fine for chat-style data.','Scoped storage (Android 10+): an app sees its own files freely and uses MediaStore or a picker for shared files.'],
 9:['Use the **SplashScreen API** (Android 12+). A separate splash Activity with a timer only wastes the user’s time.','Keep screen data in a **ViewModel**. It survives rotation. `SavedStateHandle` also survives the process being killed.','`onBackPressed()` is deprecated. Use `onBackPressedDispatcher.addCallback` so the predictive back gesture works.','Apps that target API 35+ draw **edge to edge**. Add padding for the status and navigation bars with window insets.'],
 10:['**RecyclerView** with `ListAdapter` and `DiffUtil` replaces ListView for long lists. In Compose it is `LazyColumn`.','Use **FusedLocationProviderClient** (Google Play services). It is more accurate and uses less battery than LocationManager.','`ProgressDialog` was deprecated in API 26. Show a `ProgressBar` or `CircularProgressIndicator` inside your layout.','`Geocoder` has an asynchronous listener version from Android 13. Never geocode on the main thread.'],
 11:['**Room** generates the code you write by hand here: `@Entity`, `@Dao`, `@Database`. Learning raw SQLite first makes Room easy.','Room can return a `Flow`, so the list on screen updates by itself when the table changes.','Android Studio’s **Database Inspector** (App Inspection) shows and edits tables while the app runs.','Always bind values with `?`. Never build SQL by joining strings.'],
 12:['Add Firebase with the **BoM** (bill of materials) so all Firebase libraries use matching versions.','Sign in with Google through **Credential Manager**, which also supports passkeys.','Never ship with open security rules. Test mode rules let anyone read and delete your data.','**App Check** stops other apps and scripts from using your Firebase project.'],
 13:['`AsyncTask` was deprecated in API 30. Use **coroutines**: `lifecycleScope.launch { withContext(Dispatchers.IO) { } }`.','**Retrofit** or **Ktor** with kotlinx.serialization replace hand-written `HttpURLConnection` and JSON parsing.','Android 9+ blocks plain `http://`. Use HTTPS on real hosting. For XAMPP on the emulator use `10.0.2.2` and allow cleartext only in debug.','In PHP use prepared statements (PDO or mysqli) and never put the database password inside the app.'],
 14:['**Media3 ExoPlayer** is Jetpack’s recommended player for streaming and playlists. `MediaPlayer` is still fine for a short local sound.','Recording needs the run-time permission `RECORD_AUDIO`. Background playback or recording needs a foreground service with a type (Android 14+).','App-specific folders (`filesDir`, `getExternalFilesDir`) need no permission. Shared media goes through **MediaStore**.','`WRITE_EXTERNAL_STORAGE` has no effect on Android 11+.'],
 15:['**Kotlin coroutines** are the standard: `viewModelScope.launch`, `Dispatchers.IO` for disk and network, `Dispatchers.Main` for views.','**WorkManager** runs work that must finish even if the app closes, such as an upload or a sync.','Turn on **StrictMode** in debug builds to catch disk or network access on the main thread.','Understanding `Thread`, `Runnable` and `Handler` (this lecture) explains what coroutines do for you.'],
 16:['A foreground service must declare a **type** (for example `mediaPlayback`, `location`) and its permission on Android 14+.','Apps in the background cannot freely start services (Android 8+ and 12+). Use WorkManager for deferrable work.','Most implicit broadcasts can no longer be registered in the manifest (Android 8+). Register them in code.','A receiver registered in code must state `RECEIVER_EXPORTED` or `RECEIVER_NOT_EXPORTED` (required from Android 14).']
},

/* ---------- Modern Android page ---------- */
modern:{
 intro:'The course outline teaches the classic Android APIs. They still work and they explain how Android thinks. This page shows what professional teams use today for the same jobs, so you can read new and old code.',
 table:[
  ['findViewById','Lecture 4','View Binding, or Jetpack Compose','No more wrong IDs or null views; checked when the app builds.'],
  ['ListView + ArrayAdapter','Lecture 10','RecyclerView + ListAdapter, or LazyColumn','Recycles rows properly and animates changes.'],
  ['startActivityForResult','Lecture 5','registerForActivityResult','One callback per request; survives rotation.'],
  ['onRequestPermissionsResult','Lecture 6','ActivityResultContracts.RequestPermission','No request codes to match.'],
  ['onBackPressed()','Lecture 9','OnBackPressedCallback','Needed for the predictive back gesture.'],
  ['Splash Activity + timer','Lecture 9','SplashScreen API','Instant, system-drawn, no wasted seconds.'],
  ['SharedPreferences','Lecture 8','Jetpack DataStore','Asynchronous; cannot block the main thread.'],
  ['SQLiteOpenHelper + Cursor','Lecture 11','Room (Entity, DAO, Database)','SQL is checked at build time; returns objects and Flow.'],
  ['AsyncTask','Lecture 13','Kotlin coroutines','Deprecated in API 30. Coroutines cancel with the screen.'],
  ['HttpURLConnection + JSONObject','Lecture 13','Retrofit or Ktor + kotlinx.serialization','A few lines per API call; typed results.'],
  ['ProgressDialog','Lecture 10','ProgressBar / CircularProgressIndicator','Deprecated in API 26. Does not block the whole screen.'],
  ['Thread + Handler','Lecture 15','Coroutines; WorkManager for guaranteed work','Structured, cancellable, less code.'],
  ['Background Service','Lecture 16','WorkManager, or a typed foreground service','Background starts are restricted since Android 8.'],
  ['Manifest broadcast receivers','Lecture 16','Receivers registered in code','Most implicit broadcasts are blocked in the manifest since Android 8.'],
  ['WifiManager.setWifiEnabled','Lecture 7','Settings panel intent','Apps cannot toggle Wi-Fi since Android 10.'],
  ['BLUETOOTH / BLUETOOTH_ADMIN','Lecture 7','BLUETOOTH_CONNECT, BLUETOOTH_SCAN','New run-time permissions from Android 12.'],
  ['READ / WRITE_EXTERNAL_STORAGE','Lecture 14','App folders, MediaStore, photo picker','Scoped storage from Android 10; write permission ignored on 11+.'],
  ['LocationManager','Lecture 10','FusedLocationProviderClient','Better accuracy and battery use.'],
  ['MediaPlayer for everything','Lecture 14','Media3 ExoPlayer','Streaming, playlists, media notification.'],
  ['Firebase Realtime Database only','Lecture 12','Cloud Firestore (Realtime DB still supported)','Richer queries and offline cache.']
 ],
 stack:[
  ['🎨','Jetpack Compose','UI written as Kotlin functions. No XML, live preview, less code.','Replaces XML layouts for new screens'],
  ['🧠','ViewModel + StateFlow','Holds screen data outside the Activity, so rotation loses nothing.','Lecture 9'],
  ['⚡','Coroutines + Flow','Background work and streams of data without callbacks.','Lectures 13, 15'],
  ['🗄️','Room','Type-safe database on top of SQLite.','Lecture 11'],
  ['💾','DataStore','Small settings saved safely.','Lecture 8'],
  ['🌐','Retrofit / Ktor','Talk to a REST API in a few lines.','Lecture 13'],
  ['⏱️','WorkManager','Guaranteed background jobs: sync, upload, reminders.','Lecture 16'],
  ['🧭','Navigation','One Activity, many screens, safe arguments.','Lecture 5'],
  ['💉','Hilt','Dependency injection: classes receive what they need.','After the course'],
  ['🎯','Material 3','Google’s design system: colour, type, components, dynamic colour.','Lecture 4'],
  ['🧪','JUnit + Espresso / Compose tests','Automated checks that the app still works.','After the course'],
  ['🔀','Kotlin Multiplatform','Share business logic with iOS, desktop and web.','After the course']
 ],
 compares:[
  {t:'Finding a view',l:{label:'Course (findViewById)',lang:'kotlin',code:'val btn = findViewById<Button>(R.id.btnSave)\nbtn.setOnClickListener {\n    save()\n}'},r:{label:'Modern (View Binding)',lang:'kotlin',code:'binding = ActivityMainBinding.inflate(layoutInflater)\nsetContentView(binding.root)\nbinding.btnSave.setOnClickListener { save() }'},n:'Enable it with `buildFeatures { viewBinding = true }` in the module build file.'},
  {t:'Background work',l:{label:'Course (AsyncTask)',lang:'kotlin',code:'class Load : AsyncTask<Void, Void, String>() {\n    override fun doInBackground(vararg p: Void?) = download()\n    override fun onPostExecute(r: String) { tv.text = r }\n}\nLoad().execute()'},r:{label:'Modern (coroutine)',lang:'kotlin',code:'lifecycleScope.launch {\n    val r = withContext(Dispatchers.IO) { download() }\n    tv.text = r\n}'},n:'The coroutine stops by itself when the screen is destroyed. AsyncTask could leak the Activity.'},
  {t:'Saving a setting',l:{label:'Course (SharedPreferences)',lang:'kotlin',code:'val sp = getSharedPreferences("app", MODE_PRIVATE)\nsp.edit().putString("name", "Ali").apply()\nval name = sp.getString("name", "")'},r:{label:'Modern (DataStore)',lang:'kotlin',code:'val NAME = stringPreferencesKey("name")\ndataStore.edit { it[NAME] = "Ali" }\nval name: Flow<String> =\n    dataStore.data.map { it[NAME] ?: "" }'},n:'DataStore reads and writes off the main thread and tells you when the value changes.'},
  {t:'A database table',l:{label:'Course (SQLiteOpenHelper)',lang:'kotlin',code:'val c = db.rawQuery(\n    "SELECT * FROM student WHERE marks > ?",\n    arrayOf("50"))\nwhile (c.moveToNext()) {\n    val name = c.getString(1)\n}\nc.close()'},r:{label:'Modern (Room)',lang:'kotlin',code:'@Dao\ninterface StudentDao {\n    @Query("SELECT * FROM student WHERE marks > :min")\n    fun above(min: Int): Flow<List<Student>>\n}'},n:'Room checks the SQL when you build. A typo in a column name becomes a build error, not a crash.'},
  {t:'Getting a result from another screen',l:{label:'Course (startActivityForResult)',lang:'kotlin',code:'startActivityForResult(intent, 10)\n\noverride fun onActivityResult(rq: Int, rs: Int, d: Intent?) {\n    if (rq == 10 && rs == RESULT_OK) { }\n}'},r:{label:'Modern (Activity Result API)',lang:'kotlin',code:'val pick = registerForActivityResult(\n    ActivityResultContracts.GetContent()) { uri ->\n    image.setImageURI(uri)\n}\npick.launch("image/*")'},n:'No request codes, and the callback sits next to the request.'},
  {t:'A screen with a counter',l:{label:'Course (XML + Kotlin)',lang:'kotlin',code:'// activity_main.xml: TextView + Button\nvar count = 0\nbtn.setOnClickListener {\n    count++\n    tv.text = "Count: $count"\n}'},r:{label:'Modern (Compose)',lang:'kotlin',code:'@Composable\nfun Counter() {\n    var count by rememberSaveable { mutableStateOf(0) }\n    Button(onClick = { count++ }) {\n        Text("Count: $count")\n    }\n}'},n:'In Compose the UI redraws itself whenever `count` changes. There is no XML file.'}
 ],
 play:[
  'Google Play raises its **minimum target API level every August**. New apps and updates must target a recent Android version, so always build with the latest stable SDK.',
  'A new **personal** developer account must run a closed test with at least **12 testers for 14 days** before it can publish to production.',
  'Fill in the **Data safety** form honestly: what you collect, why, and whether it is shared.',
  'Apps with native code must support **16 KB memory pages**. Pure Kotlin apps, like the ones in this course, are not affected.',
  'Upload an **Android App Bundle** (.aab), not an APK. Play signs it for you with Play App Signing.',
  'Keep your **upload key** safe and backed up. Losing it means asking Google for a reset.',
  'Ask only for the permissions you use. Play rejects apps that request SMS, call log or background location without a core need.'
 ],
 path:[
  ['During this course','Kotlin, XML Views, Activities, Intents, permissions, SQLite, Firebase, threads, services. This is the foundation every Android developer is asked about.'],
  ['Right after','View Binding, RecyclerView, ViewModel, coroutines, Room and Retrofit. Rebuild your course project with them.'],
  ['Next','Jetpack Compose, Navigation, Hilt, WorkManager and testing. Build two apps and publish one.'],
  ['Then','Clean architecture, CI/CD, performance, accessibility, and Kotlin Multiplatform if you want iOS too.']
 ]
},

/* ---------- Cheat sheets ---------- */
sheets:[
 {id:'kotlin',ic:'🅺',t:'Kotlin',s:'Syntax you use every day',g:[
  {h:'Variables and types',r:[['val name = "Ali"','Read-only. Use by default.'],['var marks = 82','Can change.'],['val x: Double = 3.5','Type written explicitly.'],['var city: String? = null','`?` allows null.'],['city?.length ?: 0','Safe call + default.'],['"Total: ${a + b}"','String template.']]},
  {h:'Control flow',r:[['if (m >= 50) "Pass" else "Fail"','`if` returns a value.'],['when (day) { 1 -> "Mon"; else -> "?" }','Replaces switch.'],['for (i in 1..5)','1 to 5 inclusive.'],['for (i in 0 until n)','0 to n-1.'],['for (s in list)','Each item.'],['while (x > 0) { x-- }','Loop while true.']]},
  {h:'Functions and classes',r:[['fun add(a: Int, b: Int): Int = a + b','One-line function.'],['fun greet(n: String = "Guest")','Default argument.'],['class Student(val name: String, var marks: Int)','Primary constructor.'],['data class User(val id: Int, val name: String)','equals, copy, toString for free.'],['object Config { const val URL = "…" }','Singleton.'],['list.filter { it > 50 }.map { it * 2 }','Lambdas on collections.']]},
  {h:'Collections',r:[['listOf(1, 2, 3)','Read-only list.'],['mutableListOf<String>()','List you can add to.'],['mapOf("a" to 1)','Key → value.'],['arrayOf(1, 2, 3)','Fixed-size array.'],['list.size / list[0] / list.last()','Common reads.'],['list.sortedBy { it.name }','Sorted copy.']]}]},
 {id:'xml',ic:'📐',t:'XML layouts',s:'Attributes that matter',g:[
  {h:'Size and space',r:[['layout_width="match_parent"','As wide as the parent.'],['layout_height="wrap_content"','As tall as the content.'],['layout_width="0dp"','ConstraintLayout: fill between constraints. LinearLayout: use with weight.'],['layout_margin="16dp"','Space outside the view.'],['padding="12dp"','Space inside the view.'],['layout_weight="1"','Share of leftover space in LinearLayout.']]},
  {h:'Common attributes',r:[['android:id="@+id/btnSave"','Name used from Kotlin.'],['android:text="@string/save"','Text from strings.xml.'],['android:textSize="18sp"','Text size in sp.'],['android:hint="Email"','Grey placeholder in EditText.'],['android:inputType="textPassword"','Keyboard and masking.'],['android:visibility="gone"','visible / invisible / gone.'],['android:gravity="center"','Aligns content inside the view.'],['android:layout_gravity="end"','Aligns the view inside its parent.']]},
  {h:'ConstraintLayout',r:[['app:layout_constraintTop_toTopOf="parent"','Pin top to parent top.'],['app:layout_constraintStart_toEndOf="@id/a"','Place after view a.'],['app:layout_constraintBottom_toBottomOf="parent"','Pin bottom.'],['Start + End constraints, width 0dp','Stretch between two sides.'],['app:layout_constraintHorizontal_bias="0.3"','Slide between constraints.']]}]},
 {id:'intents',ic:'✉️',t:'Activities and Intents',s:'Open screens and other apps',g:[
  {h:'Inside your app',r:[['startActivity(Intent(this, Second::class.java))','Open another Activity.'],['intent.putExtra("name", "Ali")','Send data.'],['intent.getStringExtra("name")','Read data in the new Activity.'],['finish()','Close this Activity.']]},
  {h:'Other apps (implicit)',r:[['Intent(ACTION_DIAL, Uri.parse("tel:0300…"))','Open the dialer. No permission.'],['Intent(ACTION_SENDTO, Uri.parse("smsto:0300…"))','Open the SMS app.'],['Intent(ACTION_SENDTO, Uri.parse("mailto:a@b.com"))','Open an email app.'],['Intent(ACTION_VIEW, Uri.parse("https://…"))','Open the browser.'],['Intent(ACTION_VIEW, Uri.parse("geo:0,0?q=Okara"))','Open maps.'],['Intent(ACTION_SEND).setType("text/plain")','Share sheet.']]},
  {h:'Lifecycle order',r:[['Launch','onCreate → onStart → onResume'],['Home button','onPause → onStop'],['Return','onRestart → onStart → onResume'],['Back button','onPause → onStop → onDestroy'],['Rotate','onPause → onStop → onDestroy → onCreate → onStart → onResume']]}]},
 {id:'perm',ic:'🔐',t:'Permissions',s:'What to declare and request',g:[
  {h:'Normal (manifest only)',r:[['INTERNET','Network access.'],['ACCESS_NETWORK_STATE','Is the device online?'],['VIBRATE','Vibrate the phone.'],['SET_ALARM','Set an alarm.']]},
  {h:'Dangerous (manifest + run-time request)',r:[['CAMERA','Take pictures in your own app.'],['ACCESS_FINE_LOCATION','GPS location.'],['RECORD_AUDIO','Microphone.'],['READ_CONTACTS','Contacts.'],['POST_NOTIFICATIONS','Show notifications (Android 13+).'],['READ_MEDIA_IMAGES','Photos (Android 13+).'],['BLUETOOTH_CONNECT','Talk to paired devices (Android 12+).'],['CALL_PHONE','Call without the dialer.']]},
  {h:'Request pattern',r:[['checkSelfPermission(p) == PERMISSION_GRANTED','Already granted?'],['registerForActivityResult(RequestPermission()) { ok -> }','Modern request.'],['launcher.launch(Manifest.permission.CAMERA)','Show the system dialog.'],['shouldShowRequestPermissionRationale(p)','Explain before asking again.']]}]},
 {id:'data',ic:'💾',t:'Data storage',s:'Pick the right place',g:[
  {h:'Which storage?',r:[['SharedPreferences / DataStore','Small settings: theme, login flag, last screen.'],['SQLite / Room','Structured data on the phone: students, notes, orders.'],['Files (filesDir)','Private documents, images, audio.'],['Firebase','Data shared between users, live updates, login.'],['MySQL + PHP','Your own server and existing web system.']]},
  {h:'SQL you need',r:[['CREATE TABLE student(id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, marks INTEGER)','Create.'],['INSERT INTO student(name, marks) VALUES(?, ?)','Add a row.'],['SELECT * FROM student WHERE marks >= ? ORDER BY name','Read with filter and sort.'],['UPDATE student SET marks = ? WHERE id = ?','Change a row.'],['DELETE FROM student WHERE id = ?','Remove a row.'],['SELECT * FROM student WHERE name LIKE ?','Search; pass "%ali%".']]},
  {h:'SQLite in Kotlin',r:[['db.insert("student", null, values)','ContentValues insert.'],['db.rawQuery(sql, arrayOf("50"))','Query with arguments.'],['cursor.moveToNext()','Next row; false at the end.'],['cursor.getString(1)','Read column 1.'],['cursor.close()','Always close.']]}]},
 {id:'tools',ic:'🛠️',t:'Android Studio, Gradle and adb',s:'Keys and commands',g:[
  {h:'Shortcuts (Windows)',r:[['Shift, Shift','Search everywhere.'],['Alt + Enter','Quick fix.'],['Ctrl + Alt + L','Reformat code.'],['Ctrl + B','Go to definition.'],['Ctrl + /','Comment line.'],['Ctrl + D','Duplicate line.'],['Shift + F10','Run.'],['Shift + F6','Rename everywhere.'],['Ctrl + Shift + F','Find in all files.']]},
  {h:'Project files',r:[['AndroidManifest.xml','Components, permissions, launcher Activity.'],['app/build.gradle.kts','minSdk, targetSdk, dependencies.'],['res/layout/','Screen layouts (XML).'],['res/values/strings.xml','All text.'],['res/drawable/','Images and shapes.'],['java/…/MainActivity.kt','Your Kotlin code.']]},
  {h:'adb commands',r:[['adb devices','List connected phones and emulators.'],['adb install app.apk','Install an APK.'],['adb logcat','Stream logs.'],['adb shell pm clear com.example.app','Clear the app’s data.'],['adb uninstall com.example.app','Remove the app.']]},
  {h:'Units and SDK numbers',r:[['dp','Layout size. 160 dp ≈ 1 inch.'],['sp','Text size; follows the user’s font setting.'],['px = dp × (dpi / 160)','Conversion.'],['minSdk','Oldest Android your app runs on.'],['targetSdk','Version you tested against; Play requires a recent one.'],['compileSdk','SDK used to build.']]}]}
],

/* ---------- Common errors and fixes ---------- */
errors:[
 ['Unresolved reference: R','A layout or resource file has an error, so R was not generated.','Open the Build tab, fix the first XML error, then Build → Rebuild Project.',3],
 ['NullPointerException on findViewById','The view ID is not in the layout you passed to setContentView, or you called it before setContentView.','Check the ID and the layout file name. Call setContentView first. Better: use View Binding.',4],
 ['ActivityNotFoundException','The Activity is not declared in the manifest, or no app can handle the implicit intent.','Add `<activity android:name=".Second"/>`. For implicit intents wrap startActivity in try/catch.',5],
 ['SecurityException: Permission denial','A dangerous permission was used without being granted.','Add `<uses-permission>` to the manifest and request it at run time before the call.',6],
 ['NetworkOnMainThreadException','Network code ran on the main thread.','Move it to a coroutine with `Dispatchers.IO`, or a background Thread.',15],
 ['CalledFromWrongThreadException','A background thread touched a view.','Wrap the view update in `runOnUiThread { }` or `withContext(Dispatchers.Main)`.',15],
 ['App not responding (ANR)','The main thread was blocked for about 5 seconds.','Move loops, database and network work off the main thread.',15],
 ['Cleartext HTTP traffic not permitted','Android 9+ blocks plain http://.','Use https. For XAMPP testing add `android:usesCleartextTraffic="true"` in the debug manifest only.',13],
 ['Failed to connect to localhost','On the emulator, localhost is the emulator itself.','Use `http://10.0.2.2/…` for the PC. On a real phone use the PC’s Wi-Fi IP address.',13],
 ['SQLiteException: no such table / column','The table changed after the database was first created.','Raise the database version and handle onUpgrade, or uninstall the app to recreate it.',11],
 ['CursorIndexOutOfBoundsException','You read from a cursor before moving to a row.','Call `moveToFirst()` or loop with `moveToNext()` and check the result.',11],
 ['Resources$NotFoundException: String resource ID','An Int was passed to setText, so Android looked for a resource with that number.','Convert it: `tv.text = count.toString()`.',4],
 ['NumberFormatException','`toInt()` was called on empty or non-numeric text.','Use `toIntOrNull()` and show a message when it is null.',2],
 ['Notification does not appear','No channel (Android 8+) or no POST_NOTIFICATIONS permission (Android 13+).','Create the channel once, request the permission, then notify.',7],
 ['INSTALL_FAILED_UPDATE_INCOMPATIBLE','An app with the same package but a different signing key is installed.','Uninstall the old app first, or sign with the same key.',3],
 ['Gradle sync failed','A dependency or version is wrong, or there is no internet for the first download.','Read the first error in the Build tab. Check the version numbers, then File → Sync Project.',3],
 ['Emulator is very slow or will not start','Hardware acceleration is off.','Enable virtualization in BIOS and install the emulator hypervisor driver, or test on a real phone with USB debugging.',3],
 ['Firebase: Permission denied','Security rules do not allow this read or write.','Sign the user in and write rules that allow that user. Do not leave rules fully open.',12],
 ['google-services.json is missing','The Firebase config file is not in the app module.','Download it from the Firebase console and place it in the `app/` folder.',12],
 ['MediaPlayer: error (1, -2147483648)','The file is missing, the format is unsupported, or prepare was not finished.','Check the path, use `prepareAsync()` with a listener, and release the player in onStop.',14],
 ['Service stops when the app is closed','Background services are restricted since Android 8.','Use a foreground service with a notification, or WorkManager.',16],
 ['Layout looks different on another phone','Sizes were set in px or with fixed numbers.','Use dp and sp, ConstraintLayout and wrap_content / match_parent.',4]
],

/* ---------- Viva questions: [lecture, question, answer] ---------- */
viva:[
 [1,'What is Android?','An open-source operating system for mobile devices, built on the Linux kernel and developed by Google.'],
 [1,'Name the layers of the Android architecture.','Linux kernel, hardware abstraction layer, native libraries and Android Runtime (ART), application framework, and apps.'],
 [1,'Native, web and hybrid apps: what is the difference?','Native apps are built for one platform with its own tools. Web apps run in the browser. Hybrid apps wrap web code in a native shell.'],
 [2,'Difference between `val` and `var`?','`val` cannot be reassigned after it is set. `var` can.'],
 [2,'What does `String?` mean?','The variable may hold a String or null. You must handle the null case before using it.'],
 [2,'What is a data class?','A class meant to hold data. Kotlin generates equals, hashCode, toString and copy for it.'],
 [2,'Primary vs secondary constructor?','The primary constructor is in the class header. A secondary constructor is written with `constructor` in the body and must call the primary one.'],
 [3,'What is the AndroidManifest.xml file for?','It declares the app’s components, permissions, launcher Activity, icon and name.'],
 [3,'minSdk, targetSdk and compileSdk?','minSdk is the oldest version the app runs on. targetSdk is the version it was tested for. compileSdk is the SDK used to build it.'],
 [3,'What is Gradle?','The build system. It downloads libraries, compiles the code and packages the APK or bundle.'],
 [3,'What is an AVD?','An Android Virtual Device: an emulator configuration that imitates a real phone.'],
 [4,'What is a View and a ViewGroup?','A View is one UI element such as a Button. A ViewGroup is a container that arranges other views, such as LinearLayout.'],
 [4,'dp vs sp vs px?','dp is a density-independent size for layouts. sp is the same but follows the user’s font size, for text. px is raw pixels and should be avoided.'],
 [4,'Toast vs Snackbar vs AlertDialog?','A Toast is a short message. A Snackbar is a message with an optional action. An AlertDialog stops the user until they choose.'],
 [4,'match_parent vs wrap_content?','match_parent takes the parent’s full size. wrap_content takes only what the content needs.'],
 [5,'What is an Intent?','A message that asks Android to start an Activity, Service or broadcast. It can carry data.'],
 [5,'Explicit vs implicit intent?','An explicit intent names the exact class to open. An implicit intent names an action and Android finds an app that can do it.'],
 [5,'How do you pass data between Activities?','Add it to the intent with putExtra and read it in the next Activity with getStringExtra, getIntExtra and so on.'],
 [6,'Normal vs dangerous permissions?','Normal permissions are granted at install. Dangerous ones protect private data and must be approved by the user at run time.'],
 [6,'What happens if the user denies a permission?','The feature must be disabled politely. The app should explain why it is needed and never crash.'],
 [7,'What is a notification channel?','A category for notifications, required since Android 8. Users control sound and importance per channel.'],
 [7,'What is a PendingIntent?','A token that lets the system run an intent later on your app’s behalf, for example when a notification is tapped.'],
 [7,'Tween vs frame animation?','A tween animation changes a view’s properties, such as position or alpha, over time. A frame animation plays a sequence of images.'],
 [8,'Name the storage options in Android.','SharedPreferences or DataStore, internal and external files, SQLite or Room, and remote storage such as Firebase or a web server.'],
 [8,'When would you use SharedPreferences?','For small key-value settings such as a theme choice or a logged-in flag.'],
 [9,'List the Activity lifecycle callbacks in order.','onCreate, onStart, onResume, onPause, onStop, onDestroy. onRestart runs before onStart when returning from stopped.'],
 [9,'What happens when the phone is rotated?','The Activity is destroyed and created again. Data must be kept in a ViewModel or saved instance state.'],
 [9,'Difference between onPause and onStop?','onPause: the Activity is partly hidden or losing focus. onStop: it is no longer visible.'],
 [10,'What is an Adapter?','A bridge between data and a list view. It creates a row view for each item.'],
 [10,'Why write a custom adapter?','To show a row with your own layout, for example an image with two lines of text.'],
 [10,'How do you get the device location?','Request location permission, then ask FusedLocationProviderClient (or LocationManager) for the last or current location.'],
 [11,'What is SQLite?','A small relational database stored in a single file inside the app. It needs no server.'],
 [11,'What does SQLiteOpenHelper do?','It creates the database in onCreate and upgrades it in onUpgrade when the version number increases.'],
 [11,'What is CRUD?','Create, Read, Update, Delete: the four basic data operations.'],
 [11,'What is a Cursor?','A pointer over the rows returned by a query. You move it row by row and read columns.'],
 [12,'What is Firebase?','Google’s backend platform: authentication, databases, storage, messaging and analytics without running your own server.'],
 [12,'Realtime Database vs SQLite?','Realtime Database is in the cloud, stores JSON and syncs live between users. SQLite is local and relational.'],
 [12,'What is a DataSnapshot?','A read-only copy of the data at a database location at one moment.'],
 [13,'Why can an Android app not connect to MySQL directly?','It is unsafe and unsupported. The app calls a web API (PHP), and the API talks to MySQL.'],
 [13,'What is JSON?','A lightweight text format for data made of objects `{ }` and arrays `[ ]`.'],
 [13,'What is XAMPP?','A package that installs Apache, MySQL and PHP on a PC for local development.'],
 [13,'What replaced AsyncTask?','Kotlin coroutines. AsyncTask was deprecated in API 30.'],
 [14,'MediaPlayer vs MediaRecorder?','MediaPlayer plays audio and video. MediaRecorder records them.'],
 [14,'Internal vs external storage?','Internal storage is private to the app. External (shared) storage can be seen by the user and other apps through MediaStore.'],
 [15,'What is the main thread?','The thread that draws the UI and handles touches. Long work on it freezes the app.'],
 [15,'What is an ANR?','“Application Not Responding”: shown when the main thread is blocked for about five seconds.'],
 [15,'Thread vs Runnable?','A Runnable is the task. A Thread is the worker that runs it.'],
 [16,'What is a Service?','A component that does work without a screen, such as playing music.'],
 [16,'Started vs bound service?','A started service runs until it stops itself. A bound service lives while components are connected to it.'],
 [16,'What is a BroadcastReceiver?','A component that listens for system or app messages, such as battery low or airplane mode changed.']
],

/* ---------- Project ideas ---------- */
projects:[
 {ic:'🎓',t:'Student Result Manager',lv:'Starter',d:'Add students and marks, calculate grades, search and sort.',f:['Login screen','SQLite CRUD','Custom list row','Search with LIKE','Share result by SMS intent'],l:[4,5,10,11]},
 {ic:'🛒',t:'Grocery List',lv:'Starter',d:'Shared shopping list with checked items and totals.',f:['RecyclerView or ListView','SharedPreferences for settings','SQLite storage','Swipe or long-click to delete'],l:[4,8,10,11]},
 {ic:'📝',t:'Notes with Reminders',lv:'Starter',d:'Write notes and get a notification at a chosen time.',f:['SQLite CRUD','Notification channel','AlertDialog confirm','Dark theme'],l:[4,7,11]},
 {ic:'🏥',t:'Clinic Appointment App',lv:'Intermediate',d:'Patients book a slot; the doctor sees today’s list.',f:['Firebase Authentication','Realtime Database','Call and SMS intents','Notification on booking'],l:[5,7,12]},
 {ic:'🍔',t:'Canteen Order App',lv:'Intermediate',d:'Menu from a server, cart, and order history.',f:['PHP + MySQL API','JSON parsing','Custom adapter with images','Order status with progress'],l:[10,13,15]},
 {ic:'🚌',t:'University Bus Tracker',lv:'Intermediate',d:'Show the bus location and estimated arrival.',f:['Location permission','GPS + Geocoder','Firebase live updates','Notification near the stop'],l:[6,7,10,12]},
 {ic:'🎙️',t:'Lecture Recorder',lv:'Intermediate',d:'Record lectures, name them, and play them back.',f:['RECORD_AUDIO permission','MediaRecorder + MediaPlayer','Files in app storage','Foreground service while recording'],l:[6,14,16]},
 {ic:'💰',t:'Expense Tracker',lv:'Intermediate',d:'Daily expenses with categories and monthly totals.',f:['SQLite with filters','SUM and GROUP BY','Charts with ProgressBar','Export to a file'],l:[8,11,14]},
 {ic:'💬',t:'Class Chat',lv:'Advanced',d:'Group chat for a class section.',f:['Firebase Authentication','Realtime Database listeners','Notifications','Image messages'],l:[7,12,16]},
 {ic:'📚',t:'Library Management',lv:'Advanced',d:'Books, members, issue and return with fines.',f:['PHP + MySQL API','Login roles','Search and filters','Background sync thread'],l:[11,13,15]},
 {ic:'🕌',t:'Prayer Times and Qibla',lv:'Advanced',d:'Daily times for the user’s city with alerts.',f:['Location','Alarm and notification','Service or WorkManager','Settings in SharedPreferences'],l:[7,8,10,16]},
 {ic:'🧭',t:'Campus Guide',lv:'Advanced',d:'Departments, teachers, timetable and a map.',f:['Multiple Activities','Maps intent','SQLite or Firebase','Splash screen'],l:[5,9,11,12]}
],

links:[
 ['Android Developers','https://developer.android.com','Official guides, API reference and samples.'],
 ['Kotlin documentation','https://kotlinlang.org/docs/home.html','The language, explained by its makers.'],
 ['Kotlin Playground','https://play.kotlinlang.org','Run Kotlin in the browser.'],
 ['Android Basics with Compose','https://developer.android.com/courses/android-basics-compose/course','Google’s free beginner course.'],
 ['Firebase documentation','https://firebase.google.com/docs/android/setup','Add Firebase to an Android app.'],
 ['Material Design 3','https://m3.material.io','Components, colour and layout guidance.'],
 ['SQLite documentation','https://www.sqlite.org/lang.html','Every SQL statement SQLite understands.'],
 ['Google Play Console help','https://support.google.com/googleplay/android-developer','Publishing rules and policies.'],
 ['PHP manual','https://www.php.net/manual/en/','Reference for the server side of Lecture 13.'],
 ['Android Studio download','https://developer.android.com/studio','The official IDE.']
]
};
