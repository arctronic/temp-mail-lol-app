#!/bin/bash

# Android Build Script for Temp Mail App
# This script builds both APK and AAB files for the React Native Expo app

set -e  # Exit on any error

echo "🚀 Starting Android Build Process..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Please run this script from the project root."
    exit 1
fi

# Set Android SDK path
ANDROID_SDK_PATH="$HOME/Library/Android/sdk"
if [ ! -d "$ANDROID_SDK_PATH" ]; then
    print_error "Android SDK not found at $ANDROID_SDK_PATH"
    print_error "Please install Android SDK first"
    exit 1
fi

print_status "Setting up Android environment..."
export ANDROID_HOME="$ANDROID_SDK_PATH"
export PATH="$PATH:$ANDROID_HOME/emulator:$ANDROID_HOME/tools:$ANDROID_HOME/tools/bin:$ANDROID_HOME/platform-tools"

# Create local.properties file
print_status "Creating android/local.properties..."
echo "sdk.dir=$ANDROID_HOME" > android/local.properties

# Verify Gradle wrapper permissions
print_status "Setting up Gradle permissions..."
chmod +x android/gradlew

# Clean previous builds
print_status "Cleaning previous builds..."
cd android
./gradlew clean
cd ..

# Build function
build_variant() {
    local variant=$1
    local build_type=$2
    
    print_status "Building $variant ($build_type)..."
    
    if [ "$build_type" = "apk" ]; then
        cd android
        ./gradlew "assemble$variant" -x lint -x test
        cd ..
        
        # Find and copy APK
        APK_PATH=$(find android/app/build/outputs/apk -name "*.apk" | head -1)
        if [ -f "$APK_PATH" ]; then
            APK_NAME="temp-mail-${variant,,}-$(date +%Y%m%d-%H%M%S).apk"
            cp "$APK_PATH" "./$APK_NAME"
            print_success "APK built successfully: $APK_NAME"
        else
            print_error "APK not found after build"
            return 1
        fi
        
    elif [ "$build_type" = "aab" ]; then
        cd android
        ./gradlew "bundle$variant" -x lint -x test
        cd ..
        
        # Find and copy AAB
        AAB_PATH=$(find android/app/build/outputs/bundle -name "*.aab" | head -1)
        if [ -f "$AAB_PATH" ]; then
            AAB_NAME="temp-mail-${variant,,}-$(date +%Y%m%d-%H%M%S).aab"
            cp "$AAB_PATH" "./$AAB_NAME"
            print_success "AAB built successfully: $AAB_NAME"
        else
            print_error "AAB not found after build"
            return 1
        fi
    fi
}

# Parse command line arguments
BUILD_TYPE="both"
VARIANT="Release"
SKIP_BUNDLE=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --apk-only)
            BUILD_TYPE="apk"
            shift
            ;;
        --aab-only)
            BUILD_TYPE="aab"
            shift
            ;;
        --debug)
            VARIANT="Debug"
            shift
            ;;
        --release)
            VARIANT="Release"
            shift
            ;;
        --skip-bundle)
            SKIP_BUNDLE=true
            shift
            ;;
        --help)
            echo "Usage: $0 [options]"
            echo "Options:"
            echo "  --apk-only     Build only APK file"
            echo "  --aab-only     Build only AAB file"
            echo "  --debug        Build debug variant"
            echo "  --release      Build release variant (default)"
            echo "  --skip-bundle  Skip Metro bundling step"
            echo "  --help         Show this help message"
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
done

print_status "Build configuration:"
print_status "  - Build Type: $BUILD_TYPE"
print_status "  - Variant: $VARIANT"
print_status "  - Skip Bundle: $SKIP_BUNDLE"

# Bundle JavaScript if not skipped
if [ "$SKIP_BUNDLE" = false ]; then
    print_status "Bundling JavaScript..."
    npx expo export --platform android
    print_success "JavaScript bundled successfully"
fi

# Create builds directory if it doesn't exist
mkdir -p builds

# Build based on type
case $BUILD_TYPE in
    "apk")
        build_variant "$VARIANT" "apk"
        ;;
    "aab")
        build_variant "$VARIANT" "aab"
        ;;
    "both")
        print_status "Building both APK and AAB..."
        build_variant "$VARIANT" "apk"
        build_variant "$VARIANT" "aab"
        ;;
esac

# Move builds to builds directory
if ls *.apk 1> /dev/null 2>&1; then
    mv *.apk builds/
    print_success "APK files moved to builds/ directory"
fi

if ls *.aab 1> /dev/null 2>&1; then
    mv *.aab builds/
    print_success "AAB files moved to builds/ directory"
fi

# Show build summary
print_success "Build process completed!"
print_status "Build artifacts:"
ls -la builds/ | grep -E '\.(apk|aab)$' || print_warning "No build artifacts found"

# Show file sizes
if ls builds/*.apk 1> /dev/null 2>&1; then
    for file in builds/*.apk; do
        size=$(du -h "$file" | cut -f1)
        print_status "APK size: $size ($file)"
    done
fi

if ls builds/*.aab 1> /dev/null 2>&1; then
    for file in builds/*.aab; do
        size=$(du -h "$file" | cut -f1)
        print_status "AAB size: $size ($file)"
    done
fi

print_success "🎉 Android build completed successfully!"
print_status "You can find your build files in the 'builds/' directory" 