#!/usr/bin/env bash
# Builds the signed release APK on the instructor's PC.
# Usage (Git Bash, from the repository root):  bash android/build-local.sh [versionCode]
# Tools live in D:\MADBuildTools (JDK 17, Gradle 8.11.1, Android SDK 35).
# The signing key is outside the repository and must never be committed.
set -e
T=/d/MADBuildTools
KEYDIR="D:/Fall 2026/Mobile App Development/android-signing"
export JAVA_HOME='D:\MADBuildTools\jdk-17.0.21+9' ANDROID_HOME='D:\MADBuildTools\sdk'
export PATH="$T/jdk-17.0.21+9/bin:$PATH"
export MAD_KEYSTORE_FILE="$KEYDIR/mad-course-release.p12"
export MAD_KEYSTORE_PASSWORD="$(cat "$KEYDIR/KEYSTORE-PASSWORD.txt")"
export MAD_KEY_ALIAS=mad-course MAD_KEY_PASSWORD="$MAD_KEYSTORE_PASSWORD"
[ -n "$1" ] && export MAD_VERSION_CODE="$1"
"$T/gradle-8.11.1/bin/gradle" -p android assembleRelease --no-daemon --console=plain
OUT="D:/Fall 2026/Mobile App Development/APK/MAD-Course.apk"
mkdir -p "$(dirname "$OUT")"
cp android/app/build/outputs/apk/release/app-release.apk "$OUT"
"$T/sdk/build-tools/35.0.0/apksigner.bat" verify --print-certs "$OUT" | head -2
echo "APK: $OUT"
