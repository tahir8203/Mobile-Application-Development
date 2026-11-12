plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
}

// The course website (index.html + assets/) lives at the repository root.
// It is copied into the APK at build time, so the app always ships the same content as the site.
val siteRoot = rootProject.projectDir.parentFile
val generatedSite = layout.buildDirectory.dir("generated/courseSite")

val copyCourseSite = tasks.register<Sync>("copyCourseSite") {
    description = "Copies the course website into the app's assets/www folder."
    from(siteRoot) {
        include("index.html", "assets/**")
    }
    into(generatedSite.map { it.dir("www") })
    filesMatching("index.html") {
        filter { line ->
            line
                // The app works fully offline: drop the Google Fonts links (system fonts are used instead).
                .replace(Regex("""<link rel="preconnect" href="https://fonts\.g[^>]*>"""), "")
                .replace(Regex("""<link rel="stylesheet" href="https://fonts\.googleapis\.com[^>]*>"""), "")
                // Load the small Android bridge (back button, printing, saving files, keep-awake).
                .replace("</head>", """<link rel="stylesheet" href="app/android.css"><script src="app/android.js"></script></head>""")
        }
    }
}

android {
    namespace = "com.mtahir.madcourse"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.mtahir.madcourse"
        minSdk = 26
        targetSdk = 35
        versionCode = (System.getenv("GITHUB_RUN_NUMBER") ?: "1").toInt()
        versionName = "1.0"
    }

    signingConfigs {
        // A permanent release key can be supplied through environment variables (GitHub secrets).
        // Without them the build is signed with the standard debug key so the APK still installs.
        val ks = System.getenv("MAD_KEYSTORE_FILE")
        if (ks != null && file(ks).exists()) {
            create("release") {
                storeFile = file(ks)
                storePassword = System.getenv("MAD_KEYSTORE_PASSWORD")
                keyAlias = System.getenv("MAD_KEY_ALIAS")
                keyPassword = System.getenv("MAD_KEY_PASSWORD")
            }
        }
    }

    buildTypes {
        release {
            isMinifyEnabled = true
            isShrinkResources = true
            proguardFiles(getDefaultProguardFile("proguard-android-optimize.txt"), "proguard-rules.pro")
            signingConfig = signingConfigs.findByName("release") ?: signingConfigs.getByName("debug")
        }
    }

    buildFeatures {
        buildConfig = true
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    kotlinOptions {
        jvmTarget = "17"
    }

    sourceSets["main"].assets.srcDir(generatedSite)

    lint {
        checkReleaseBuilds = false
    }
}

tasks.named("preBuild") { dependsOn(copyCourseSite) }

dependencies {
    implementation("androidx.core:core-ktx:1.15.0")
    implementation("androidx.activity:activity-ktx:1.9.3")
    implementation("androidx.webkit:webkit:1.12.1")
    implementation("androidx.core:core-splashscreen:1.0.1")
}
