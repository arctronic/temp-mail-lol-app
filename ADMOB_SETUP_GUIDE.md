# AdMob Integration Setup Guide

## 🎯 Overview
This guide will help you integrate AdMob with your Temp Mail app to monetize the lookup features (untrack emails, add extra inboxes, export to Excel).

## 📋 Prerequisites
- AdMob account (you already have this!)
- App published or ready for review on Google Play Store
- Your app package name: `com.tronics.tempmail`

## 🚀 Step-by-Step Setup

### Step 1: Create Ad Units in AdMob Console

1. **Go to your AdMob console**: https://apps.admob.com/
2. **Click on your "Temp Mail" app** (or create it if you haven't)
3. **Go to "Ad units" section**
4. **Create these 3 ad units:**

#### Banner Ad Unit
- Click "Add ad unit"
- Select "Banner"
- Name: "Temp Mail Banner"
- Copy the Ad Unit ID (looks like: `ca-app-pub-1234567890123456/1234567890`)

#### Interstitial Ad Unit
- Click "Add ad unit"  
- Select "Interstitial"
- Name: "Temp Mail Interstitial"
- Copy the Ad Unit ID

#### Rewarded Ad Unit ⭐ (Most Important)
- Click "Add ad unit"
- Select "Rewarded"
- Name: "Temp Mail Rewarded"
- Copy the Ad Unit ID

### Step 2: Get Your App ID

1. In AdMob console, go to "App settings"
2. Copy your **App ID** (looks like: `ca-app-pub-1234567890123456~1234567890`)

### Step 3: Update Your App Configuration

#### 3.1 Update `app.json`
Replace the placeholders in `app.json`:
```json
[
  "expo-ads-admob",
  {
    "androidAppId": "ca-app-pub-YOUR-ACTUAL-APP-ID~1234567890",
    "iosAppId": "ca-app-pub-YOUR-ACTUAL-APP-ID~1234567890"
  }
]
```

#### 3.2 Update `constants/AdMobConfig.ts`
Replace these placeholders with your actual IDs:

```typescript
export const ADMOB_CONFIG = {
  // App IDs (from AdMob console)
  androidAppId: 'ca-app-pub-YOUR-ACTUAL-APP-ID~1234567890',
  iosAppId: 'ca-app-pub-YOUR-ACTUAL-APP-ID~1234567890',
  
  // Ad Unit IDs (from AdMob console)
  adUnitIds: {
    // Production IDs (replace with your actual IDs)
    production: {
      banner: 'ca-app-pub-YOUR-ACTUAL-APP-ID/1234567890',
      interstitial: 'ca-app-pub-YOUR-ACTUAL-APP-ID/1234567890', 
      rewarded: 'ca-app-pub-YOUR-ACTUAL-APP-ID/1234567890',
    }
  }
};
```

### Step 4: Build and Test

#### 4.1 Development Testing
- The app is already configured to use test ads in development mode
- Test ads will show automatically when you run `npm start`

#### 4.2 Production Build
```bash
# Build for Android
npx expo build:android

# Or build with EAS
eas build --platform android
```

## 🎮 How the AdMob Features Work

### 1. **Untrack Emails** 🗑️
- Users can track up to 5 emails for free
- To remove an email from tracking, they must watch a rewarded ad
- Located in: `app/(drawer)/lookup.tsx`

### 2. **Add Extra Inboxes** 📧
- Free limit: 5 email addresses
- Premium limit: 20 email addresses (unlocked with ads)
- Each extra inbox requires watching a rewarded ad

### 3. **Export to Excel** 📊
- Users can export all tracked emails to an Excel file
- Requires watching a rewarded ad before download
- File includes: sender, subject, date, message preview, attachment count

## 🔧 Technical Implementation

### Ad Types Used:
- **Rewarded Ads**: For premium features (untrack, extra inboxes, export)
- **Interstitial Ads**: For general app usage (every 5 refreshes, 3 lookups, 10 generations)
- **Banner Ads**: Ready for implementation if needed

### Key Files:
- `contexts/AdContext.tsx` - Main AdMob logic
- `constants/AdMobConfig.ts` - Ad unit configuration
- `app/(drawer)/lookup.tsx` - Lookup page with ad-gated features
- `utils/excelExport.ts` - Excel export functionality

## 🐛 Troubleshooting

### Common Issues:

1. **"Ad failed to load"**
   - Check your Ad Unit IDs are correct
   - Ensure your app is approved in AdMob
   - Wait 24-48 hours after creating ad units

2. **Test ads not showing**
   - Make sure you're in development mode (`__DEV__ = true`)
   - Check console logs for AdMob errors

3. **Production ads not showing**
   - Verify your App ID and Ad Unit IDs
   - Check AdMob account status
   - Ensure app is published on Play Store

### Debug Commands:
```bash
# Check if AdMob is properly installed
npm list expo-ads-admob

# Clear cache and restart
npm start --clear

# Build clean version
npx expo build:android --clear-cache
```

## 📈 Monetization Strategy

### Revenue Optimization:
1. **High-Value Actions**: Export and extra inboxes generate most revenue
2. **User Experience**: Ads are optional and provide clear value
3. **Frequency Capping**: Prevents ad fatigue with 60-second cooldowns
4. **Ad-Free Mode**: Option for premium users (can be extended)

### Expected Revenue:
- **Rewarded ads**: $0.10 - $0.50 per view
- **Interstitial ads**: $0.05 - $0.20 per view
- **Daily active users**: Depends on your user base

## ✅ Checklist

- [ ] Created AdMob app
- [ ] Created 3 ad units (Banner, Interstitial, Rewarded)
- [ ] Updated `app.json` with App ID
- [ ] Updated `constants/AdMobConfig.ts` with Ad Unit IDs
- [ ] Tested with development ads
- [ ] Built production version
- [ ] Submitted app for AdMob review
- [ ] Published app on Play Store

## 🎉 You're Ready!

Once you complete these steps, your app will start showing ads and generating revenue from the lookup features. The AdMob integration is designed to be user-friendly while maximizing monetization potential.

**Need help?** Check the AdMob console for detailed analytics and troubleshooting guides. 