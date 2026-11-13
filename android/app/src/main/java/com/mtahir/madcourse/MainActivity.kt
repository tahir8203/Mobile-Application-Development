package com.mtahir.madcourse

import android.annotation.SuppressLint
import android.content.ActivityNotFoundException
import android.content.ContentValues
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.os.Environment
import android.os.SystemClock
import android.print.PrintAttributes
import android.print.PrintManager
import android.provider.MediaStore
import android.util.Log
import android.graphics.Color
import android.view.HapticFeedbackConstants
import android.view.View
import android.view.ViewGroup.LayoutParams.MATCH_PARENT
import android.view.WindowManager
import android.webkit.ConsoleMessage
import android.webkit.RenderProcessGoneDetail
import android.webkit.ValueCallback
import android.webkit.WebChromeClient
import android.webkit.WebResourceRequest
import android.webkit.WebResourceResponse
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.FrameLayout
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.OnBackPressedCallback
import androidx.activity.result.contract.ActivityResultContracts
import androidx.activity.SystemBarStyle
import androidx.activity.enableEdgeToEdge
import androidx.core.splashscreen.SplashScreen.Companion.installSplashScreen
import androidx.core.view.ViewCompat
import androidx.core.view.WindowCompat
import androidx.core.view.WindowInsetsCompat
import androidx.core.view.WindowInsetsControllerCompat
import androidx.webkit.WebViewAssetLoader
import androidx.webkit.WebViewCompat
import androidx.webkit.WebViewFeature
import org.json.JSONObject

/**
 * The MAD Course app.
 *
 * All 16 lectures, the slide decks, quizzes, the course outline and the assessments are bundled
 * in assets/www (copied from the course website at build time) and served from a private
 * https origin through [WebViewAssetLoader], so everything works offline and progress is kept
 * in the app's own storage.
 *
 * The native side adds what a browser tab cannot: the system back button, real fullscreen for
 * presentations, printing / saving the certificate as PDF, saving code examples to Downloads,
 * keeping the screen on while presenting, and opening outside links in the browser.
 */
class MainActivity : ComponentActivity() {

    private lateinit var root: FrameLayout
    private lateinit var webView: WebView
    private val chromeClient = CourseChromeClient()

    private var customView: View? = null
    private var customViewCallback: WebChromeClient.CustomViewCallback? = null
    private var printWebView: WebView? = null
    private var pageReady = false
    private var lastBackPress = 0L
    private var fileCallback: ValueCallback<Array<Uri>>? = null

    /** File picker for "Restore from backup" on the Profile page. */
    private val pickFile = registerForActivityResult(ActivityResultContracts.GetContent()) { uri ->
        fileCallback?.onReceiveValue(if (uri != null) arrayOf(uri) else null)
        fileCallback = null
    }

    private val assetLoader by lazy {
        WebViewAssetLoader.Builder()
            .addPathHandler("/assets/", WebViewAssetLoader.AssetsPathHandler(this))
            .build()
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        val splash = installSplashScreen()
        super.onCreate(savedInstanceState)
        val startedAt = SystemClock.elapsedRealtime()
        splash.setKeepOnScreenCondition { !pageReady && SystemClock.elapsedRealtime() - startedAt < 2500 }

        val navy = getColor(R.color.navy)
        enableEdgeToEdge(SystemBarStyle.dark(navy), SystemBarStyle.dark(navy))

        root = FrameLayout(this).apply { setBackgroundColor(navy) }
        webView = WebView(this).apply { setBackgroundColor(navy) }
        root.addView(webView, FrameLayout.LayoutParams(MATCH_PARENT, MATCH_PARENT))
        setContentView(root)

        // Android 15 draws apps edge to edge: keep the page clear of the status bar,
        // navigation bar, camera cutout and keyboard (except in fullscreen presentations).
        ViewCompat.setOnApplyWindowInsetsListener(root) { v, insets ->
            if (customView != null) {
                v.setPadding(0, 0, 0, 0)
            } else {
                val bars = insets.getInsets(
                    WindowInsetsCompat.Type.systemBars() or
                        WindowInsetsCompat.Type.displayCutout() or
                        WindowInsetsCompat.Type.ime()
                )
                v.setPadding(bars.left, bars.top, bars.right, bars.bottom)
            }
            WindowInsetsCompat.CONSUMED
        }

        setUpWebView()

        val restored = savedInstanceState?.let { webView.restoreState(it) } != null
        if (!restored) webView.loadUrl(START_URL + fragmentFrom(intent))

        onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
            override fun handleOnBackPressed() = handleBack()
        })
    }

    @SuppressLint("SetJavaScriptEnabled")
    private fun setUpWebView() {
        WebView.setWebContentsDebuggingEnabled(BuildConfig.DEBUG)
        with(webView.settings) {
            javaScriptEnabled = true
            domStorageEnabled = true
            allowFileAccess = false
            setSupportMultipleWindows(false)
            setSupportZoom(false)
            userAgentString = "$userAgentString MADCourseApp/${BuildConfig.VERSION_NAME}"
        }
        webView.webViewClient = CourseWebViewClient()
        webView.webChromeClient = chromeClient

        if (WebViewFeature.isFeatureSupported(WebViewFeature.WEB_MESSAGE_LISTENER)) {
            WebViewCompat.addWebMessageListener(webView, "MADApp", setOf("https://$HOST")) { _, message, _, _, _ ->
                message.data?.let { handleMessage(it) }
            }
        }
    }

    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        val fragment = fragmentFrom(intent)
        if (fragment.isNotEmpty()) {
            webView.evaluateJavascript("location.hash=${JSONObject.quote(fragment)}", null)
        }
    }

    /** madcourse://open#outline → "#outline". */
    private fun fragmentFrom(intent: Intent?): String {
        val data = intent?.data ?: return ""
        if (data.scheme != "madcourse") return ""
        val fragment = data.fragment ?: return ""
        return if (fragment.matches(Regex("[A-Za-z0-9/_-]{1,40}"))) "#$fragment" else ""
    }

    override fun onSaveInstanceState(outState: Bundle) {
        super.onSaveInstanceState(outState)
        webView.saveState(outState)
    }

    override fun onResume() {
        super.onResume()
        webView.onResume()
    }

    override fun onPause() {
        webView.onPause()
        super.onPause()
    }

    override fun onDestroy() {
        printWebView?.destroy()
        root.removeView(webView)
        webView.destroy()
        super.onDestroy()
    }

    // ----- Back button -----------------------------------------------------------------------

    private fun handleBack() {
        if (customView != null) {
            exitFullscreen()
            return
        }
        val canGoBack = webView.canGoBack()
        // The page closes its own overlays first (presentation, dialogs, menus).
        webView.evaluateJavascript("window.__madBack?window.__madBack($canGoBack):false") { result ->
            when {
                result == "true" -> Unit
                webView.canGoBack() -> webView.goBack()
                else -> {
                    val now = SystemClock.elapsedRealtime()
                    if (now - lastBackPress < 2000) {
                        finish()
                    } else {
                        lastBackPress = now
                        toast(getString(R.string.press_back_again))
                    }
                }
            }
        }
    }

    // ----- Messages from the page (assets/www/app/android.js) --------------------------------

    private fun handleMessage(raw: String) {
        val msg = try {
            JSONObject(raw)
        } catch (e: Exception) {
            return
        }
        when (msg.optString("type")) {
            "save" -> saveText(msg.optString("name", "Example.txt"), msg.optString("text"))
            "print" -> printPage(webView, msg.optString("title", getString(R.string.app_name)))
            "printHtml" -> printHtml(msg.optString("html"), msg.optString("title", getString(R.string.app_name)))
            "keepAwake" -> keepAwake(msg.optBoolean("on"))
            "open" -> openExternal(Uri.parse(msg.optString("url")))
            "toast" -> toast(msg.optString("text"))
            "haptic" -> webView.performHapticFeedback(
                if (msg.optInt("ms", 12) > 25) HapticFeedbackConstants.LONG_PRESS else HapticFeedbackConstants.VIRTUAL_KEY
            )
            "share" -> shareText(msg.optString("text"))
            "theme" -> applyTheme(msg.optBoolean("dark", true))
        }
    }

    /** The area behind the status and navigation bars follows the course theme (light or dark). */
    private fun applyTheme(dark: Boolean) {
        val color = if (dark) getColor(R.color.navy) else Color.parseColor("#F4F7FC")
        root.setBackgroundColor(color)
        webView.setBackgroundColor(color)
        WindowCompat.getInsetsController(window, root).apply {
            isAppearanceLightStatusBars = !dark
            isAppearanceLightNavigationBars = !dark
        }
    }

    private fun shareText(text: String) {
        if (text.isBlank()) return
        val send = Intent(Intent.ACTION_SEND).apply {
            type = "text/plain"
            putExtra(Intent.EXTRA_TEXT, text.take(2000))
        }
        startActivity(Intent.createChooser(send, getString(R.string.share_course)))
    }

    private fun keepAwake(on: Boolean) {
        if (on) window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
        else window.clearFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
    }

    /** Saves a code example to Downloads/MAD Course (Android 10+), or offers to share it on older phones. */
    private fun saveText(rawName: String, text: String) {
        val name = rawName.replace(Regex("[^A-Za-z0-9._ -]"), "_").take(80).ifBlank { "Example.txt" }
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            try {
                val values = ContentValues().apply {
                    put(MediaStore.Downloads.DISPLAY_NAME, name)
                    put(
                        MediaStore.Downloads.MIME_TYPE,
                        when (name.substringAfterLast('.', "").lowercase()) {
                            "txt" -> "text/plain"
                            "json" -> "application/json"
                            else -> "application/octet-stream" // keeps .kt, .xml, .sql names unchanged
                        }
                    )
                    put(MediaStore.Downloads.RELATIVE_PATH, Environment.DIRECTORY_DOWNLOADS + "/MAD Course")
                }
                val uri = contentResolver.insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, values)
                    ?: throw IllegalStateException("insert failed")
                contentResolver.openOutputStream(uri)?.use { it.write(text.toByteArray()) }
                    ?: throw IllegalStateException("no stream")
                toast(getString(R.string.saved_to_downloads, name))
            } catch (e: Exception) {
                Log.w(TAG, "save failed", e)
                toast(getString(R.string.save_failed))
            }
        } else {
            val send = Intent(Intent.ACTION_SEND).apply {
                type = "text/plain"
                putExtra(Intent.EXTRA_SUBJECT, name)
                putExtra(Intent.EXTRA_TEXT, text)
            }
            startActivity(Intent.createChooser(send, getString(R.string.share_code)))
        }
    }

    /** Prints the current page; the site's print stylesheet hides the menus. "Save as PDF" is offered by Android. */
    private fun printPage(view: WebView, title: String) {
        val printManager = getSystemService(PrintManager::class.java) ?: return
        val job = title.ifBlank { getString(R.string.app_name) }
        printManager.print(job, view.createPrintDocumentAdapter(job), PrintAttributes.Builder().build())
    }

    /** Prints one lecture: it is rendered in an off-screen WebView so the whole lecture is printed, not just the visible frame. */
    @SuppressLint("SetJavaScriptEnabled")
    private fun printHtml(html: String, title: String) {
        if (html.isBlank()) return
        printWebView?.destroy()
        val pw = WebView(this)
        printWebView = pw
        pw.settings.javaScriptEnabled = true
        pw.settings.allowFileAccess = false
        pw.webViewClient = object : WebViewClient() {
            override fun shouldInterceptRequest(view: WebView, request: WebResourceRequest): WebResourceResponse? =
                assetLoader.shouldInterceptRequest(request.url)

            override fun shouldOverrideUrlLoading(view: WebView, request: WebResourceRequest) = true

            override fun onPageFinished(view: WebView, url: String?) {
                if (printWebView === view) printPage(view, title)
            }
        }
        pw.loadDataWithBaseURL("https://$HOST/assets/www/", html, "text/html", "utf-8", null)
    }

    private fun openExternal(uri: Uri) {
        val scheme = uri.scheme?.lowercase() ?: return
        if (scheme !in setOf("http", "https", "mailto", "tel")) return
        try {
            startActivity(Intent(Intent.ACTION_VIEW, uri).addCategory(Intent.CATEGORY_BROWSABLE))
        } catch (e: ActivityNotFoundException) {
            toast(getString(R.string.no_app_for_link))
        }
    }

    private fun toast(text: String) {
        if (text.isNotBlank()) Toast.makeText(this, text, Toast.LENGTH_SHORT).show()
    }

    // ----- Fullscreen (presentation mode "F" / fullscreen button) ----------------------------

    private fun exitFullscreen() {
        customViewCallback?.onCustomViewHidden()
        chromeClient.onHideCustomView()
    }

    private inner class CourseChromeClient : WebChromeClient() {
        override fun onShowCustomView(view: View, callback: CustomViewCallback) {
            if (customView != null) {
                callback.onCustomViewHidden()
                return
            }
            customView = view
            customViewCallback = callback
            root.addView(view, FrameLayout.LayoutParams(MATCH_PARENT, MATCH_PARENT))
            WindowCompat.getInsetsController(window, root).apply {
                systemBarsBehavior = WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE
                hide(WindowInsetsCompat.Type.systemBars())
            }
            root.requestApplyInsets()
        }

        override fun onHideCustomView() {
            val view = customView ?: return
            customView = null
            customViewCallback = null
            root.removeView(view)
            WindowCompat.getInsetsController(window, root).show(WindowInsetsCompat.Type.systemBars())
            root.requestApplyInsets()
        }

        override fun onShowFileChooser(
            view: WebView,
            callback: ValueCallback<Array<Uri>>,
            params: FileChooserParams
        ): Boolean {
            fileCallback?.onReceiveValue(null)
            fileCallback = callback
            return try {
                pickFile.launch("*/*")
                true
            } catch (e: ActivityNotFoundException) {
                fileCallback = null
                false
            }
        }

        override fun onConsoleMessage(message: ConsoleMessage): Boolean {
            if (message.messageLevel() == ConsoleMessage.MessageLevel.ERROR) {
                Log.e(WEB_TAG, "${message.message()} (${message.sourceId()}:${message.lineNumber()})")
            }
            return true
        }
    }

    // ----- Loading the bundled course --------------------------------------------------------

    private inner class CourseWebViewClient : WebViewClient() {
        override fun shouldInterceptRequest(view: WebView, request: WebResourceRequest): WebResourceResponse? =
            assetLoader.shouldInterceptRequest(request.url)

        override fun shouldOverrideUrlLoading(view: WebView, request: WebResourceRequest): Boolean {
            val uri = request.url
            if (uri.host == HOST && uri.scheme == "https") return false
            when (uri.scheme?.lowercase()) {
                "about", "blob", "data", "javascript" -> return false
            }
            // Links to other websites (Kotlin Playground, Android docs, ...) open in the browser.
            openExternal(uri)
            return true
        }

        override fun onPageFinished(view: WebView, url: String?) {
            pageReady = true
            Log.i(TAG, "page ready: $url")
        }

        override fun onRenderProcessGone(view: WebView, detail: RenderProcessGoneDetail): Boolean {
            // The WebView renderer was killed (low memory): rebuild the screen instead of crashing.
            Log.w(TAG, "renderer gone, crashed=${detail.didCrash()}")
            recreate()
            return true
        }
    }

    companion object {
        private const val TAG = "MADCourse"
        private const val WEB_TAG = "MADWeb"
        const val HOST = "appassets.androidplatform.net"
        const val START_URL = "https://$HOST/assets/www/index.html"
    }
}
