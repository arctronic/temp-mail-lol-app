import { Platform } from 'react-native';

// Google's Official Test Ad Unit IDs
// Source: https://developers.google.com/admob/android/quick-start
const TEST_AD_UNIT_IDS = {
  android: {
    appId: 'ca-app-pub-3940256099942544~3347511713', // Google's test app ID
    banner: 'ca-app-pub-3940256099942544/6300978111',
    interstitial: 'ca-app-pub-3940256099942544/1033173712',
    rewarded: 'ca-app-pub-3940256099942544/5224354917',
    rewardedInterstitial: 'ca-app-pub-3940256099942544/5354046379',
    appOpen: 'ca-app-pub-3940256099942544/3419835294',
  },
  ios: {
    appId: 'ca-app-pub-3940256099942544~1458002511', // Google's test app ID
    banner: 'ca-app-pub-3940256099942544/2934735716',
    interstitial: 'ca-app-pub-3940256099942544/4411468910',
    rewarded: 'ca-app-pub-3940256099942544/1712485313',
    rewardedInterstitial: 'ca-app-pub-3940256099942544/6978759866',
    appOpen: 'ca-app-pub-3940256099942544/5662855259',
  },
};

// Production Ad Unit IDs - Using your actual AdMob IDs
const PRODUCTION_AD_UNIT_IDS = {
  android: {
    appId: 'ca-app-pub-1181029024567851~8308042845', // Your actual app ID
    banner: 'ca-app-pub-1181029024567851/2683270943',
    interstitial: 'ca-app-pub-1181029024567851/1370189278',
    rewarded: 'ca-app-pub-1181029024567851/3649137759',
    rewardedInterstitial: 'ca-app-pub-1181029024567851/1370189278',
    appOpen: 'ca-app-pub-1181029024567851/2683270943',
  },
  ios: {
    appId: 'ca-app-pub-1181029024567851~8308042845', // Your actual app ID
    banner: 'ca-app-pub-1181029024567851/2683270943',
    interstitial: 'ca-app-pub-1181029024567851/1370189278',
    rewarded: 'ca-app-pub-1181029024567851/3649137759',
    rewardedInterstitial: 'ca-app-pub-1181029024567851/1370189278',
    appOpen: 'ca-app-pub-1181029024567851/2683270943',
  },
};

export const getAdUnitIds = () => {
  const isTestMode = __DEV__ || process.env.NODE_ENV === 'development';
  const platformKey = Platform.OS as keyof typeof TEST_AD_UNIT_IDS;
  
  // Debug logging to help troubleshoot
  const testIds = TEST_AD_UNIT_IDS[platformKey];
  const prodIds = PRODUCTION_AD_UNIT_IDS[platformKey];
  
  console.log('🎯 AdMob Configuration:', {
    isTestMode,
    __DEV__,
    NODE_ENV: process.env.NODE_ENV,
    platform: Platform.OS,
    testIds: testIds,
    prodIds: prodIds,
  });
  
  return isTestMode ? testIds : prodIds;
};

// Add debug function to force test ads in production (for debugging)
export const getDebugAdUnitIds = (forceTestAds = false) => {
  const platformKey = Platform.OS as keyof typeof TEST_AD_UNIT_IDS;
  
  if (forceTestAds) {
    console.log('🐛 Using TEST ads in production for debugging');
    return TEST_AD_UNIT_IDS[platformKey];
  }
  
  return getAdUnitIds();
};

export const getAdMobAppId = () => {
  const adUnitIds = getAdUnitIds();
  return adUnitIds.appId;
};

// AdMob Configuration Settings - Following Google's Best Practices
export const AdMobConfig = {
  // SDK Initialization Settings
  initialization: {
    // Initialize on background thread (recommended by Google)
    useBackgroundThread: true,
    
    // SDK optimization flags (available in SDK 21.0.0+)
    optimizationFlags: {
      OPTIMIZE_INITIALIZATION: true,
      OPTIMIZE_AD_LOADING: true,
    },
    
    // Timeout for SDK initialization
    initializationTimeout: 30000, // 30 seconds
  },
  
  // Request Configuration (Global Ad Settings)
  // Source: https://developers.google.com/admob/android/targeting
  requestConfiguration: {
    // Maximum ad content rating (G, PG, T, MA)
    maxAdContentRating: 'T' as const, // Teen rating for temp mail app
    
    // COPPA compliance - Tag for child-directed treatment
    tagForChildDirectedTreatment: false, // false = mixed audience (recommended)
    
    // Tag for users under age of consent (GDPR)
    tagForUnderAgeOfConsent: false, // false = mixed audience
    
    // Test device IDs for development
    testDeviceIdentifiers: __DEV__ ? ['EMULATOR'] : [],
    
    // Publisher provided ID for better targeting
    publisherProvidedId: undefined, // Can be set for better ad targeting
  },
  
  // GDPR/CCPA Compliance Settings
  // Source: https://developers.google.com/admob/android/privacy
  privacy: {
    // Request consent from users in EEA/UK
    requestConsentFromEEA: true,
    
    // Request consent from users in California (CCPA)
    requestConsentFromCalifornia: true,
    
    // Debug geography for testing consent forms - using proper enum reference
    debugGeography: __DEV__ ? 1 : 0, // 0=DISABLED, 1=EEA, 2=NOT_EEA, etc.
    
    // Test device IDs for UMP (User Messaging Platform)
    testDeviceIdentifiers: __DEV__ ? ['EMULATOR'] : [],
    
    // Reset consent info for testing (only in debug)
    resetConsentOnAppStart: __DEV__,
  },
  
  // Ad Loading Settings - Following Google's Performance Guidelines
  adLoading: {
    // Preload ads for better user experience
    preloadAds: true,
    
    // Timeout for ad loading
    timeout: 30000, // 30 seconds (Google's recommendation)
    
    // Retry configuration for failed loads
    retryAttempts: 3,
    retryDelayMs: 2000, // 2 seconds between retries
    exponentialBackoff: true, // Increase delay with each retry
    
    // Ad refresh settings
    refreshInterval: 30000, // 30 seconds for banner ads
    
    // Keywords for better ad targeting
    keywords: ['email', 'temporary', 'privacy', 'messaging'],
    
    // Content URL for contextual targeting
    contentUrl: null, // Can be set for better targeting
  },
  
  // Ad Display Settings - Following Google's UX Guidelines
  // Source: https://developers.google.com/admob/android/interstitial#best_practices
  adDisplay: {
    // Interstitial ad settings
    interstitial: {
      // Minimum interval between interstitials (Google's recommendation: 2-3 minutes)
      minIntervalMs: 180000, // 3 minutes
      
      // Maximum interstitials per session
      maxPerSession: 5,
      
      // Show at natural transition points only
      showAtTransitionPoints: true,
      
      // Frequency capping
      dailyLimit: 10,
    },
    
    // Rewarded ad settings
    rewarded: {
      // Minimum interval between rewarded ads
      minIntervalMs: 30000, // 30 seconds
      
      // Maximum rewarded ads per session
      maxPerSession: 15, // Higher limit for rewarded as users opt-in
      
      // Daily limit
      dailyLimit: 20,
      
      // Require user opt-in
      requireOptIn: true,
    },
    
    // Banner ad settings
    banner: {
      // Auto-refresh interval (if enabled in AdMob console)
      refreshIntervalMs: 60000, // 1 minute
      
      // Use adaptive banners for better performance
      useAdaptiveBanners: true,
      
      // Collapsible banner settings
      enableCollapsible: true,
      collapsibleDirection: 'bottom' as const, // 'top' or 'bottom'
    },
    
    // App Open ad settings
    appOpen: {
      // Timeout for app open ads
      timeoutMs: 4000, // 4 seconds (Google's recommendation)
      
      // Show only on cold starts
      showOnColdStartOnly: true,
      
      // Minimum interval between app open ads
      minIntervalMs: 14400000, // 4 hours
    },
  },
  
  // Performance Optimization
  performance: {
    // Hardware acceleration for video ads
    hardwareAcceleration: true,
    
    // Cache settings
    maxCachedAds: 3, // Preload up to 3 ads
    
    // Network settings
    connectionTimeoutMs: 10000, // 10 seconds
    
    // Memory management
    clearCacheOnLowMemory: true,
    
    // Analytics and reporting
    enableDetailedLogging: __DEV__,
    enablePerformanceMonitoring: true,
  },
  
  // User Experience Settings
  userExperience: {
    // Minimum actions before showing first ad
    minActionsBeforeFirstAd: 3,
    
    // Action thresholds for different ad types
    actionThresholds: {
      refresh: 5, // Show interstitial every 5 refresh actions
      lookup: 3,  // Show interstitial every 3 lookup actions
      generation: 2, // Show rewarded ad option every 2 generation actions
    },
    
    // Ad-free periods after certain actions
    adFreeGracePeriods: {
      afterRewardedAd: 300000, // 5 minutes ad-free after watching rewarded ad
      afterPremiumAction: 600000, // 10 minutes ad-free after premium action
    },
  },
  
  // Error Handling and Debugging
  debugging: {
    // Enable detailed error logging
    enableDetailedErrorLogging: __DEV__,
    
    // Log ad events for debugging
    logAdEvents: __DEV__,
    
    // Test mode settings
    forceTestAds: __DEV__,
    
    // Ad inspector (for debugging ad issues)
    enableAdInspector: __DEV__,
  },
  
  // Feature Flags
  features: {
    // Enable/disable specific ad types
    enableBannerAds: true,
    enableInterstitialAds: true,
    enableRewardedAds: true,
    enableRewardedInterstitialAds: false, // Disabled for now
    enableAppOpenAds: false, // Disabled for now
    
    // Advanced features
    enableNativeAds: false, // Not implemented yet
    enableVideoAds: true,
    enablePlayableAds: true,
    
    // Monetization features
    enableAdFreePurchase: false, // Could be implemented later
    enableSubscriptions: false, // Could be implemented later
  },
} as const;

// Ad Event Types for better type safety
export const AdEventTypes = {
  // Common events
  LOADED: 'loaded',
  FAILED_TO_LOAD: 'failed_to_load',
  OPENED: 'opened',
  CLOSED: 'closed',
  CLICKED: 'clicked',
  IMPRESSION: 'impression',
  
  // Rewarded ad events
  EARNED_REWARD: 'earned_reward',
  
  // Video ad events
  VIDEO_STARTED: 'video_started',
  VIDEO_COMPLETED: 'video_completed',
  VIDEO_MUTED: 'video_muted',
  VIDEO_UNMUTED: 'video_unmuted',
} as const;

// Utility functions for ad management
export const AdUtils = {
  // Check if enough time has passed since last ad
  canShowAd: (lastShownTime: number, minIntervalMs: number): boolean => {
    return Date.now() - lastShownTime >= minIntervalMs;
  },
  
  // Get appropriate ad unit ID based on environment
  getAdUnitId: (adType: keyof ReturnType<typeof getAdUnitIds>): string => {
    const adUnitIds = getAdUnitIds();
    return adUnitIds[adType];
  },
  
  // Calculate exponential backoff delay
  calculateBackoffDelay: (attempt: number, baseDelayMs: number): number => {
    return baseDelayMs * Math.pow(2, attempt - 1);
  },
  
  // Validate ad configuration
  validateConfig: (): boolean => {
    const adUnitIds = getAdUnitIds();
    return !!(adUnitIds.banner && adUnitIds.interstitial && adUnitIds.rewarded);
  },
} as const; 