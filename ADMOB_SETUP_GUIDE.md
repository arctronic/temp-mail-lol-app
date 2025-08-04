# AdMob Setup Guide for TempMailApp

## 🚨 Current Status: MISCONFIGURED

Your AdMob implementation is currently misconfigured and **ads will not work** until you complete the setup below.

## Issues Found

### ❌ Critical Issues
1. **Missing google-services.json** - Required for Android
2. **Placeholder Ad Unit IDs** - All using dummy values
3. **Placeholder AdMob App ID** - Using dummy value in AndroidManifest.xml
4. **Missing iOS Info.plist** configuration

### ⚠️ Partially Fixed
- ✅ Google Services classpath added to build.gradle
- ✅ Google Services plugin applied to app/build.gradle
- ✅ ProGuard rules added for AdMob
- ✅ Google Mobile Ads SDK dependency present

## Step-by-Step Setup

### Step 1: Create AdMob Account & App

1. **Go to AdMob Console**: https://admob.google.com
2. **Create new app** or add existing app
3. **Get your AdMob App ID** (format: `ca-app-pub-XXXXXXXXXXXXXXXX~XXXXXXXXXX`)

### Step 2: Create Ad Units

Create these ad units in your AdMob console:

1. **Banner Ad Unit**
   - Ad format: Banner
   - Platform: Android & iOS
   - Get the Ad Unit ID (format: `ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX`)

2. **Interstitial Ad Unit**
   - Ad format: Interstitial
   - Platform: Android & iOS
   - Get the Ad Unit ID

3. **Rewarded Ad Unit** (Optional)
   - Ad format: Rewarded
   - Platform: Android & iOS
   - Get the Ad Unit ID

### Step 3: Configure Android

#### 3.1 Update AndroidManifest.xml
Replace the placeholder in `android/app/src/main/AndroidManifest.xml`:

```xml
<!-- Replace this line -->
<meta-data
    android:name="com.google.android.gms.ads.APPLICATION_ID"
    android:value="ca-app-pub-XXXXXXXXXXXXXXXX~XXXXXXXXXX"/>

<!-- With your actual AdMob App ID -->
<meta-data
    android:name="com.google.android.gms.ads.APPLICATION_ID"
    android:value="ca-app-pub-YOUR_ACTUAL_APP_ID~YOUR_ACTUAL_APP_ID"/>
```

#### 3.2 Add google-services.json
1. **Download google-services.json** from Firebase Console
2. **Place it in** `android/app/google-services.json`

> **Note**: You need a Firebase project connected to your AdMob account

### Step 4: Configure iOS

#### 4.1 Update Info.plist
Add to `ios/TempMailApp/Info.plist`:

```xml
<key>GADApplicationIdentifier</key>
<string>ca-app-pub-YOUR_IOS_APP_ID~YOUR_IOS_APP_ID</string>
```

#### 4.2 Add GoogleService-Info.plist
1. **Download GoogleService-Info.plist** from Firebase Console
2. **Add it to Xcode project** in `ios/TempMailApp/`

### Step 5: Update Ad Unit IDs

Edit `src/services/AdMobService.ts` and replace all placeholder IDs:

```typescript
private getProductionBannerId(): string {
  return Platform.select({
    ios: 'ca-app-pub-YOUR_PUBLISHER_ID/YOUR_IOS_BANNER_ID',
    android: 'ca-app-pub-YOUR_PUBLISHER_ID/YOUR_ANDROID_BANNER_ID',
  }) || TestIds.BANNER;
}

private getProductionInterstitialId(): string {
  return Platform.select({
    ios: 'ca-app-pub-YOUR_PUBLISHER_ID/YOUR_IOS_INTERSTITIAL_ID',
    android: 'ca-app-pub-YOUR_PUBLISHER_ID/YOUR_ANDROID_INTERSTITIAL_ID',
  }) || TestIds.INTERSTITIAL;
}

private getProductionRewardedId(): string {
  return Platform.select({
    ios: 'ca-app-pub-YOUR_PUBLISHER_ID/YOUR_IOS_REWARDED_ID',
    android: 'ca-app-pub-YOUR_PUBLISHER_ID/YOUR_ANDROID_REWARDED_ID',
  }) || TestIds.REWARDED;
}
```

### Step 6: Test Your Setup

#### Development Testing
- **Test ads are shown by default** in development mode (`__DEV__ = true`)
- **Real ads will show** in production builds

#### Production Testing
1. **Build release APK**: `cd android && ./gradlew assembleRelease`
2. **Install on device**: `adb install app/build/outputs/apk/release/app-release.apk`
3. **Test ad loading** and display

### Step 7: Ad Placement Strategy

Your app already has strategic ad placement configured:

- **Banner Ads**: Bottom of all screens
- **Interstitial Ads**: 
  - 30% chance after email generation
  - 20% chance after email opening
  - 10% chance on app open
  - 5% chance on settings access
- **1-minute cooldown** between interstitials

## Verification Checklist

- [ ] AdMob account created
- [ ] App added to AdMob
- [ ] Ad units created (Banner, Interstitial, Rewarded)
- [ ] AndroidManifest.xml updated with real App ID
- [ ] google-services.json added to android/app/
- [ ] Info.plist updated with iOS App ID
- [ ] GoogleService-Info.plist added to iOS project
- [ ] AdMobService.ts updated with real ad unit IDs
- [ ] Test build created and ads verified

## Troubleshooting

### Common Issues

1. **"No ad to show"**
   - Check ad unit IDs are correct
   - Ensure google-services.json is in place
   - Verify App ID in manifest

2. **Ads not loading in production**
   - Check ProGuard rules are applied
   - Verify all IDs are correctly configured
   - Check network permissions

3. **iOS builds failing**
   - Ensure GoogleService-Info.plist is added to Xcode project
   - Check iOS deployment target compatibility

### Debug Commands

```bash
# Clean and rebuild
cd android && ./gradlew clean
cd .. && npx react-native run-android

# Check AdMob logs
adb logcat | grep -i "admob\|ads"
```

## Revenue Optimization

Once ads are working:

1. **Monitor fill rates** in AdMob console
2. **A/B test ad frequencies** in AdMobService.ts
3. **Adjust cooldown periods** based on user behavior
4. **Consider implementing rewarded ads** for premium features

---

**⚠️ Important**: Ads will NOT work until you complete ALL steps above. The current configuration uses test/placeholder values only.