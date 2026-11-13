#!/usr/bin/env bash
# Installs the APK on the CI emulator, opens the main pages, takes screenshots and fails on
# app crashes or JavaScript errors. Usage: smoke-test.sh path/to/app.apk
set -u
APK="$1"
PKG=com.mtahir.madcourse
OUT=screenshots
mkdir -p "$OUT"
fail=0

adb wait-for-device
adb shell settings put global window_animation_scale 0
adb shell settings put global transition_animation_scale 0
adb shell settings put global animator_duration_scale 0
adb install -r "$APK" || { echo "::error::APK install failed"; exit 1; }
adb logcat -c

shot() { sleep "$2"; adb exec-out screencap -p > "$OUT/$1.png"; echo "screenshot $1"; }
open() { adb shell "am start -W -a android.intent.action.VIEW -d 'madcourse://open#$1' $PKG" >/dev/null; }
alive() {
  if ! adb shell pidof "$PKG" >/dev/null; then echo "::error::App is not running after: $1"; fail=1; fi
}

adb shell monkey -p "$PKG" -c android.intent.category.LAUNCHER 1 >/dev/null
shot 01-home 10; alive "launch"

open outline;       shot 02-outline 4;      alive "outline"
open learn;         shot 02b-learn 4;       alive "learn"
open quiz;          shot 02c-practice 4;    alive "practice"
open labs/lifecycle; shot 02d-lab 4;        alive "lab"
open me;            shot 02e-profile 4;     alive "profile"
open assessments;   shot 03-assessments 4;  alive "assessments"
open lecture-1;     shot 04-lecture-1 6;    alive "lecture 1"
open present/4/3;   shot 05-present-l4-s3 6; alive "presentation"
open present/9/3;   shot 06-present-l9-s3 6; alive "presentation 9"
adb shell input keyevent KEYCODE_BACK; shot 07-after-back 3; alive "back"
open glossary;      shot 08-glossary 4;     alive "glossary"
# Rotate to landscape (projector-style) and back.
adb shell settings put system accelerometer_rotation 0
adb shell settings put system user_rotation 1
open present/2/5;   shot 09-landscape-present 6; alive "landscape"
adb shell settings put system user_rotation 0

adb logcat -d > logcat.txt
grep -E "MADCourse|MADWeb" logcat.txt > app-log.txt || true
echo "---- app log ----"; cat app-log.txt

if grep -q "FATAL EXCEPTION" logcat.txt; then echo "::error::App crashed"; grep -A 30 "FATAL EXCEPTION" logcat.txt; fail=1; fi
if grep -q " E MADWeb" logcat.txt; then echo "::error::JavaScript errors in the course pages"; grep " E MADWeb" logcat.txt; fail=1; fi
if ! grep -q "page ready: https://appassets.androidplatform.net/assets/www/index.html" logcat.txt; then
  echo "::error::Course page never finished loading"; fail=1
fi
exit $fail
