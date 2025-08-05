@echo off
echo 🔧 Fixing React Native Build Issues...
echo.

echo ✅ Step 1: Cleaning existing build cache...
if exist android\build rmdir /s /q android\build
if exist android\.gradle rmdir /s /q android\.gradle
if exist android\app\build rmdir /s /q android\app\build

echo ✅ Step 2: Installing correct React version...
npm uninstall react react-native-clipboard
npm install react@18.3.1 --save-exact

echo ✅ Step 3: Reinstalling all dependencies...
npm install

echo ✅ Step 4: Clearing Metro cache...
npx react-native start --reset-cache --port=8083 &
timeout /t 3 >nul
taskkill /f /im node.exe >nul 2>&1

echo ✅ Step 5: Building Android APK...
cd android
echo Building debug APK...
call gradlew assembleDebug --no-daemon --stacktrace

if exist app\build\outputs\apk\debug\app-debug.apk (
    echo.
    echo 🎉 SUCCESS! APK built successfully!
    echo 📱 APK Location: android\app\build\outputs\apk\debug\app-debug.apk
    echo 📦 APK Size: 
    dir app\build\outputs\apk\debug\app-debug.apk | findstr app-debug.apk
    echo.
    echo ✨ Your production-ready temp mail app is ready for testing!
) else (
    echo.
    echo ❌ BUILD FAILED - Check the output above for errors
    echo 💡 Try using GitHub Actions build instead:
    echo    1. Push changes to GitHub
    echo    2. Go to Actions tab
    echo    3. Download APK from artifacts
)

cd ..
echo.
echo Build process completed.
pause