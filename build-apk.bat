@echo off
echo Building React Native APK using Docker...

echo Step 1: Building Docker image...
docker build -t temp-mail-builder .

if %ERRORLEVEL% NEQ 0 (
    echo Docker build failed!
    pause
    exit /b 1
)

echo Step 2: Creating output directory...
if not exist "build-output" mkdir build-output

echo Step 3: Extracting APK from container...
docker run --rm -v "%cd%\build-output:/host-output" temp-mail-builder sh -c "cp /output/*.apk /host-output/ 2>/dev/null || echo 'No APK files found'"

echo Step 4: Checking for APK files...
dir build-output\*.apk 2>nul
if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ SUCCESS! APK files built and extracted to build-output folder:
    dir build-output\*.apk
) else (
    echo ❌ No APK files found. Check the build logs above for errors.
)

echo.
echo Build process completed.
pause