import { Platform } from 'react-native';

// Google's Official Test Ad Unit IDs
// Source: https://developers.google.com/admob/android/quick-start
const TEST_AD_UNIT_IDS = {
  android: {
    appId: 'ca-app-pub-3940256099942544~3347511713', // Google's test app ID
    banner: 'ca-app-pub-3940256099942544/6300978111',
    interstitial: 'ca-app-pub-3940256099942544/1033173712',
    rewarded: 'ca-app-pub-3940256099942544/5224354917',
    // rewardedInterstitial: 'ca-app-pub-3940256099942544/5354046379', // Not using
    // appOpen: 'ca-app-pub-3940256099942544/3419835294', // Not using
  },
  ios: {
    appId: 'ca-app-pub-3940256099942544~1458002511', // Google's test app ID
    banner: 'ca-app-pub-3940256099942544/2934735716',
    interstitial: 'ca-app-pub-3940256099942544/4411468910',
    rewarded: 'ca-app-pub-3940256099942544/1712485313',
    // rewardedInterstitial: 'ca-app-pub-3940256099942544/6978759866', // Not using
    // appOpen: 'ca-app-pub-3940256099942544/5662855259', // Not using
  },
};

// Production Ad Unit IDs - Using your actual AdMob IDs
const PRODUCTION_AD_UNIT_IDS = {
  android: {
    appId: 'ca-app-pub-1181029024567851~8308042845', // Your actual app ID
    banner: 'ca-app-pub-1181029024567851/2683270943',
    interstitial: 'ca-app-pub-1181029024567851/1370189278',
    rewarded: 'ca-app-pub-1181029024567851/3649137759',
    // rewardedInterstitial: null, // Not created - optional ad type
    // appOpen: null, // Not created - optional ad type
  },
  ios: {
    appId: 'ca-app-pub-1181029024567851~8308042845', // Your actual app ID
    banner: 'ca-app-pub-1181029024567851/2683270943',
    interstitial: 'ca-app-pub-1181029024567851/1370189278',
    rewarded: 'ca-app-pub-1181029024567851/3649137759',
    // rewardedInterstitial: null, // Not created - optional ad type
    // appOpen: null, // Not created - optional ad type
  },
};

export const getAdUnitIds = () => {
  const isTestMode = __DEV__ || process.env.NODE_ENV === 'development';
  const platformKey = Platform.OS as keyof typeof TEST_AD_UNIT_IDS;
  
  return isTestMode 
    ? TEST_AD_UNIT_IDS[platformKey] 
    : PRODUCTION_AD_UNIT_IDS[platformKey];
};

export const getAdMobAppId = () => {
  const adUnitIds = getAdUnitIds();
  return adUnitIds.appId;
};

// AdMob Configuration Settings
export const AdMobConfig = {
  // Request Configuration
  requestConfiguration: {
    // Maximum ad content rating
    maxAdContentRating: 'T' as const, // Teen rating
    
    // Tag for child-directed treatment (COPPA compliance)
    tagForChildDirectedTreatment: null, // null = not specified, true/false for explicit setting
    
    // Tag for users under age of consent
    tagForUnderAgeOfConsent: null, // null = not specified, true/false for explicit setting
    
    // Test device IDs (add your device IDs here for testing)
    testDeviceIdentifiers: [], // Add device IDs like: ['YOUR_DEVICE_ID']
  },
  
  // GDPR Compliance Settings
  gdpr: {
    // Whether to request consent from users in EEA
    requestConsentFromEEA: true,
    
    // Whether to show consent form to all users (for testing)
    debugGeography: __DEV__ ? 'EEA' : 'DISABLED', // 'EEA', 'NOT_EEA', or 'DISABLED'
    
    // Test device IDs for UMP (User Messaging Platform)
    testDeviceIdentifiers: [], // Add device IDs for testing consent forms
  },
  
  // Ad Loading Settings
  adLoading: {
    // Timeout for ad loading in milliseconds
    timeout: 30000, // 30 seconds
    
    // Number of retry attempts for failed ad loads
    retryAttempts: 3,
    
    // Delay between retry attempts in milliseconds
    retryDelay: 2000, // 2 seconds
  },
  
  // Ad Display Settings
  adDisplay: {
    // Minimum interval between interstitial ads in milliseconds
    interstitialInterval: 60000, // 1 minute
    
    // Minimum interval between rewarded ads in milliseconds
    rewardedInterval: 30000, // 30 seconds
    
    // Maximum number of ads per session
    maxAdsPerSession: 10,
  },
} as const; 