# Deployment Guide - Temp Mail App

This guide covers the complete deployment process for the Temp Mail React Native app to Google Play Store and Apple App Store.

## Pre-Deployment Checklist

### 1. Code Quality & Testing
- [ ] All features tested on physical devices
- [ ] No console errors or warnings
- [ ] Performance optimization completed
- [ ] Memory leaks checked and fixed
- [ ] API integration tested thoroughly
- [ ] AdMob ads displaying correctly
- [ ] Push notifications working
- [ ] Dark/light themes tested

### 2. Configuration
- [ ] Production AdMob IDs configured
- [ ] App signing certificates generated
- [ ] Firebase project configured (Android)
- [ ] APNs certificates configured (iOS)
- [ ] App icons and splash screens added
- [ ] Version numbers updated
- [ ] Privacy policy and terms of service ready

### 3. Store Assets
- [ ] App screenshots (multiple device sizes)
- [ ] App icon (all required sizes)
- [ ] Feature graphic
- [ ] App description and keywords
- [ ] Privacy policy URL
- [ ] Support contact information

## Android Deployment (Google Play Store)

### Step 1: Generate Signing Key

```bash
# Generate upload key
keytool -genkeypair -v -storetype PKCS12 -keystore upload-keystore.keystore -alias upload -keyalg RSA -keysize 2048 -validity 10000

# Move keystore to android/app/
mv upload-keystore.keystore android/app/
```

### Step 2: Configure Gradle Properties

Create `android/gradle.properties`:
```properties
MYAPP_UPLOAD_STORE_FILE=upload-keystore.keystore
MYAPP_UPLOAD_KEY_ALIAS=upload
MYAPP_UPLOAD_STORE_PASSWORD=your_keystore_password
MYAPP_UPLOAD_KEY_PASSWORD=your_key_password

# Enable R8 optimization
android.enableR8=true
android.enableR8.fullMode=true

# Enable parallel builds
org.gradle.parallel=true
org.gradle.configureondemand=true
org.gradle.daemon=true

# Increase heap size
org.gradle.jvmargs=-Xmx4096m -XX:MaxPermSize=512m -XX:+HeapDumpOnOutOfMemoryError -Dfile.encoding=UTF-8
```

### Step 3: Update App Configuration

Update `android/app/build.gradle`:
```gradle
android {
    defaultConfig {
        applicationId "com.tronics.tempmail"
        versionCode 1
        versionName "1.0.0"
    }
}
```

Update `android/app/src/main/AndroidManifest.xml`:
```xml
<!-- Replace with your actual AdMob App ID -->
<meta-data
    android:name="com.google.android.gms.ads.APPLICATION_ID"
    android:value="ca-app-pub-YOUR_ACTUAL_ID~YOUR_ACTUAL_ID"/>
```

### Step 4: Build Release APK/Bundle

```bash
# Clean previous builds
cd android
./gradlew clean

# Build App Bundle (recommended)
./gradlew bundleRelease

# Or build APK
./gradlew assembleRelease
```

Output files:
- App Bundle: `android/app/build/outputs/bundle/release/app-release.aab`
- APK: `android/app/build/outputs/apk/release/app-release.apk`

### Step 5: Google Play Console Setup

1. **Create Developer Account**
   - Sign up at https://play.google.com/console
   - Pay $25 registration fee

2. **Create App**
   - Click "Create app"
   - Fill in app details
   - Select "App" and "Free"

3. **Upload App Bundle**
   - Go to "Release" → "Production"
   - Click "Create new release"
   - Upload your `.aab` file

4. **Store Listing**
   - Add app description
   - Upload screenshots
   - Add app icon
   - Set category and tags

5. **Content Rating**
   - Complete content rating questionnaire
   - Get rating certificate

6. **App Content**
   - Privacy policy (required)
   - Target audience
   - Data safety form

7. **Release**
   - Review all sections
   - Submit for review

### Step 6: Post-Release

- Monitor crash reports in Play Console
- Respond to user reviews
- Track app performance metrics
- Plan updates and improvements

## iOS Deployment (App Store)

### Step 1: Xcode Configuration

1. **Open iOS project**
   ```bash
   cd ios
   open TempMailApp.xcworkspace
   ```

2. **Configure signing**
   - Select project in navigator
   - Go to "Signing & Capabilities"
   - Select your development team
   - Ensure "Automatically manage signing" is checked

3. **Update Info.plist**
   ```xml
   <!-- Add AdMob App ID -->
   <key>GADApplicationIdentifier</key>
   <string>ca-app-pub-YOUR_ACTUAL_ID~YOUR_ACTUAL_ID</string>
   ```

### Step 2: Build Archive

1. **Select target**
   - Choose "Any iOS Device" as target
   - Select "Release" configuration

2. **Archive**
   - Product → Archive
   - Wait for build to complete

3. **Distribute**
   - Select archive in Organizer
   - Click "Distribute App"
   - Choose "App Store Connect"

### Step 3: App Store Connect

1. **Create App**
   - Go to https://appstoreconnect.apple.com
   - Click "+" to create new app
   - Fill in app information

2. **Upload Build**
   - Use Xcode Organizer or Application Loader
   - Select your archive
   - Upload to App Store Connect

3. **App Information**
   - Add app description
   - Upload screenshots
   - Set keywords and category
   - Add app icon

4. **Pricing and Availability**
   - Set to "Free"
   - Select territories

5. **App Review Information**
   - Add review notes
   - Provide demo account if needed

6. **Submit for Review**
   - Complete all required sections
   - Submit for App Store review

## AdMob Configuration

### Production Ad Units

Replace test IDs with production IDs in `src/services/AdMobService.ts`:

```typescript
private getProductionBannerId(): string {
  return Platform.select({
    ios: 'ca-app-pub-1234567890123456/1234567890',
    android: 'ca-app-pub-1234567890123456/1234567890',
  }) || TestIds.BANNER;
}

private getProductionInterstitialId(): string {
  return Platform.select({
    ios: 'ca-app-pub-1234567890123456/1234567890',
    android: 'ca-app-pub-1234567890123456/1234567890',
  }) || TestIds.INTERSTITIAL;
}
```

### AdMob Best Practices

1. **Ad Placement**
   - Don't place ads too close to interactive elements
   - Ensure ads don't interfere with app functionality
   - Follow platform-specific guidelines

2. **Ad Frequency**
   - Implement cooldown periods between interstitials
   - Monitor user experience metrics
   - A/B test different frequencies

3. **Compliance**
   - Follow AdMob policies
   - Implement proper consent management (GDPR/CCPA)
   - Ensure ads are family-friendly

## Firebase Setup (Android Push Notifications)

### Step 1: Create Firebase Project

1. Go to https://console.firebase.google.com
2. Create new project
3. Add Android app with package name `com.tronics.tempmail`

### Step 2: Configure Firebase

1. **Download config file**
   - Download `google-services.json`
   - Place in `android/app/` directory

2. **Update build files**
   ```gradle
   // android/build.gradle
   dependencies {
       classpath 'com.google.gms:google-services:4.3.15'
   }

   // android/app/build.gradle
   apply plugin: 'com.google.gms.google-services'
   ```

3. **Enable Cloud Messaging**
   - Go to Firebase Console
   - Enable Cloud Messaging API

## Monitoring & Analytics

### Crash Reporting

1. **Firebase Crashlytics** (recommended)
   ```bash
   npm install @react-native-firebase/crashlytics
   ```

2. **Sentry** (alternative)
   ```bash
   npm install @sentry/react-native
   ```

### Performance Monitoring

1. **Firebase Performance**
   ```bash
   npm install @react-native-firebase/perf
   ```

2. **Custom metrics**
   - Track app launch time
   - Monitor API response times
   - Track user engagement

### Analytics

1. **Firebase Analytics**
   ```bash
   npm install @react-native-firebase/analytics
   ```

2. **Custom events**
   - Email generation
   - Ad interactions
   - User retention

## Post-Launch Checklist

### Week 1
- [ ] Monitor crash reports
- [ ] Check app store reviews
- [ ] Verify ad revenue
- [ ] Track user acquisition
- [ ] Monitor API performance

### Month 1
- [ ] Analyze user behavior
- [ ] Optimize ad placement
- [ ] Plan feature updates
- [ ] Gather user feedback
- [ ] Performance optimization

### Ongoing
- [ ] Regular updates
- [ ] Security patches
- [ ] New feature development
- [ ] User support
- [ ] Marketing activities

## Troubleshooting

### Common Build Issues

1. **Gradle build fails**
   ```bash
   cd android
   ./gradlew clean
   rm -rf node_modules
   npm install
   ```

2. **iOS build fails**
   ```bash
   cd ios
   rm -rf Pods
   pod install
   ```

3. **Metro bundler issues**
   ```bash
   npx react-native start --reset-cache
   ```

### Common Deployment Issues

1. **App rejected for policy violations**
   - Review store policies
   - Update content as needed
   - Resubmit with explanations

2. **AdMob ads not showing**
   - Verify ad unit IDs
   - Check AdMob account status
   - Test with different devices

3. **Push notifications not working**
   - Verify Firebase configuration
   - Check device permissions
   - Test on different Android versions

## Support Resources

- **React Native Documentation**: https://reactnative.dev/docs
- **Google Play Console Help**: https://support.google.com/googleplay/android-developer
- **App Store Connect Help**: https://developer.apple.com/support/app-store-connect/
- **AdMob Help**: https://support.google.com/admob
- **Firebase Documentation**: https://firebase.google.com/docs

---

**Remember**: Always test thoroughly on physical devices before deploying to production!

