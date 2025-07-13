import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Alert, AppState, AppStateStatus } from 'react-native';
import { AdMobConfig, AdUtils, getAdUnitIds } from '../constants/AdMobConfig';
import { useGlobalToast } from '../hooks/useGlobalToast';

// Conditional imports to prevent errors in Expo Go
let mobileAds: any = null;
let InterstitialAd: any = null;
let RewardedAd: any = null;
let BannerAd: any = null;
let AppOpenAd: any = null;
let AdEventType: any = null;
let RewardedAdEventType: any = null;
let TestIds: any = null;
let AdsConsent: any = null;

// Check if we're running in Expo Go
const isExpoGo = Constants.appOwnership === 'expo';

// Safe module loading with graceful fallback
if (!isExpoGo) {
  try {
    const googleMobileAds = require('react-native-google-mobile-ads');
    mobileAds = googleMobileAds.default;
    InterstitialAd = googleMobileAds.InterstitialAd;
    RewardedAd = googleMobileAds.RewardedAd;
    BannerAd = googleMobileAds.BannerAd;
    AppOpenAd = googleMobileAds.AppOpenAd;
    AdEventType = googleMobileAds.AdEventType;
    RewardedAdEventType = googleMobileAds.RewardedAdEventType;
    TestIds = googleMobileAds.TestIds;
    AdsConsent = googleMobileAds.AdsConsent;
  } catch (error) {
    console.log('📺 Google Mobile Ads SDK not available in current environment');
  }
}

// Ad Instance Management Interface
interface AdInstance {
  ad: any;
  isLoaded: boolean;
  isLoading: boolean;
  loadTime: number;
  failureCount: number;
  lastError?: string;
}

interface AdContextType {
  // Core ad display methods
  showInterstitialAd: () => Promise<boolean>;
  showRewardedAd: (onReward: () => void, onFail?: () => void) => Promise<boolean>;
  showRewardedAdForAction: (
    action: 'untrack' | 'add_extra' | 'export',
    onReward: () => void,
    onFail?: () => void
  ) => Promise<boolean>;
  
  // User action tracking
  canShowAd: (type: 'refresh' | 'lookup' | 'generation') => boolean;
  incrementAction: (type: 'refresh' | 'lookup' | 'generation') => Promise<void>;
  
  // Ad-free mode
  isAdFree: boolean;
  enableAdFreeMode: (hours: number) => Promise<void>;
  
  // Status and compliance
  isInitialized: boolean;
  hasConsent: boolean;
  isLoading: boolean;
  
  // Ad instance status
  adInstances: {
    interstitial: AdInstance | null;
    rewarded: AdInstance | null;
    appOpen: AdInstance | null;
  };
  
  // Debug and testing
  refreshAdInstance: (type: 'interstitial' | 'rewarded') => Promise<void>;
  showAdInspector: () => void;
}

const AdContext = createContext<AdContextType | undefined>(undefined);

// Storage keys with versioning for future migrations
const STORAGE_KEYS = {
  refreshCount: 'ad_refresh_count_v2',
  lookupCount: 'ad_lookup_count_v2',
  generationCount: 'ad_generation_count_v2',
  adFreeUntil: 'ad_free_until_v2',
  lastAdShown: 'last_ad_shown_v2',
  consentStatus: 'ad_consent_status_v2',
  sessionData: 'ad_session_data_v2',
  dailyStats: 'ad_daily_stats_v2',
  userPreferences: 'ad_user_preferences_v2',
} as const;

// Session management for better ad experience
interface SessionData {
  sessionId: string;
  startTime: number;
  adCount: {
    interstitial: number;
    rewarded: number;
    total: number;
  };
  actionCount: {
    refresh: number;
    lookup: number;
    generation: number;
    total: number;
  };
}

export function AdProvider({ children }: { children: React.ReactNode }) {
  // Core state
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasConsent, setHasConsent] = useState(false);
  
  // User action tracking
  const [refreshCount, setRefreshCount] = useState(0);
  const [lookupCount, setLookupCount] = useState(0);
  const [generationCount, setGenerationCount] = useState(0);
  
  // Ad-free mode
  const [isAdFree, setIsAdFree] = useState(false);
  const [lastAdShown, setLastAdShown] = useState(0);
  
  // Ad instance management
  const [adInstances, setAdInstances] = useState<{
    interstitial: AdInstance | null;
    rewarded: AdInstance | null;
    appOpen: AdInstance | null;
  }>({
    interstitial: null,
    rewarded: null,
    appOpen: null,
  });
  
  // Session management
  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  
  // Refs for cleanup and management
  const { showError, showInfo, showSuccess } = useGlobalToast();
  const initializationRef = useRef(false);
  const cleanupFunctionsRef = useRef<(() => void)[]>([]);
  const retryTimeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);

  // Initialize a new session
  const initializeSession = useCallback(async () => {
    const newSession: SessionData = {
      sessionId: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      startTime: Date.now(),
      adCount: { interstitial: 0, rewarded: 0, total: 0 },
      actionCount: { refresh: 0, lookup: 0, generation: 0, total: 0 },
    };
    
    setSessionData(newSession);
    await AsyncStorage.setItem(STORAGE_KEYS.sessionData, JSON.stringify(newSession));
    
    console.log('📊 New ad session initialized:', newSession.sessionId);
  }, []);

  // Enhanced SDK initialization following Google's guidelines
  const initializeAdsSDK = useCallback(async () => {
    if (isExpoGo || !mobileAds || initializationRef.current) {
      console.log('📺 Skipping ads initialization:', { isExpoGo, hasMobileAds: !!mobileAds, alreadyInitialized: initializationRef.current });
      return false;
    }

    try {
      setIsLoading(true);
      initializationRef.current = true;
      
      console.log('🚀 Starting AdMob SDK initialization...');
      console.log('🎯 Environment Info:', {
        __DEV__,
        NODE_ENV: process.env.NODE_ENV,
        isProduction: !__DEV__ && process.env.NODE_ENV !== 'development',
        adUnitIds: getAdUnitIds(),
      });
      
      // Step 1: Set global request configuration before initialization
      await setGlobalRequestConfiguration();
      
      // Step 2: Handle consent if required
      await handleUserConsent();
      
      // Step 3: Initialize SDK on background thread (as recommended by Google)
      const initPromise = new Promise<any>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('SDK initialization timeout'));
        }, AdMobConfig.initialization.initializationTimeout);
        
        mobileAds()
          .initialize()
          .then((adapterStatuses: any) => {
            clearTimeout(timeout);
            resolve(adapterStatuses);
          })
          .catch((error: any) => {
            clearTimeout(timeout);
            reject(error);
          });
      });
      
      const adapterStatuses = await initPromise;
      console.log('✅ AdMob SDK initialized successfully:', adapterStatuses);
      
      // Step 4: Create and preload ad instances
      await createAndPreloadAds();
      
      // Step 5: Initialize session tracking
      await initializeSession();
      
      setIsInitialized(true);
      console.log('🎯 AdMob setup completed successfully');
      
      return true;
      
    } catch (error) {
      console.error('❌ AdMob initialization failed:', error);
      initializationRef.current = false;
      setIsInitialized(false);
      
      // Show user-friendly error
      if (AdMobConfig.debugging.enableDetailedErrorLogging) {
        showError('Ads initialization failed. Some features may be limited.');
      }
      
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Set global request configuration (called before SDK init)
  const setGlobalRequestConfiguration = async () => {
    if (!mobileAds) return;
    
    try {
      console.log('⚙️ Setting global request configuration...');
      
      await mobileAds().setRequestConfiguration({
        maxAdContentRating: AdMobConfig.requestConfiguration.maxAdContentRating,
        tagForChildDirectedTreatment: AdMobConfig.requestConfiguration.tagForChildDirectedTreatment,
        tagForUnderAgeOfConsent: AdMobConfig.requestConfiguration.tagForUnderAgeOfConsent,
        testDeviceIdentifiers: AdMobConfig.requestConfiguration.testDeviceIdentifiers,
      });
      
      console.log('✅ Request configuration set successfully');
    } catch (error) {
      console.error('❌ Failed to set request configuration:', error);
    }
  };

  // Enhanced consent management following GDPR/CCPA guidelines
  const handleUserConsent = async () => {
    if (!AdsConsent || !AdMobConfig.privacy.requestConsentFromEEA) {
      console.log('📋 Consent management not available or disabled');
      setHasConsent(true); // Assume consent for non-EEA users
      return;
    }

    try {
      console.log('📋 Handling user consent...');
      
      // Import the enum values dynamically
      let AdsConsentDebugGeography: any = null;
      try {
        const googleMobileAds = require('react-native-google-mobile-ads');
        AdsConsentDebugGeography = googleMobileAds.AdsConsentDebugGeography;
      } catch (error) {
        console.log('📋 AdsConsentDebugGeography not available');
      }
      
      // Check if we need to gather consent
      const consentInfo = await AdsConsent.requestInfoUpdate({
        debugGeography: AdsConsentDebugGeography && __DEV__ 
          ? AdsConsentDebugGeography.EEA 
          : AdsConsentDebugGeography?.DISABLED || 0,
        testDeviceIdentifiers: AdMobConfig.privacy.testDeviceIdentifiers,
      });
      
      console.log('📋 Consent info:', {
        status: consentInfo.status,
        isConsentFormAvailable: consentInfo.isConsentFormAvailable,
      });
      
      if (consentInfo.isConsentFormAvailable) {
        // Show consent form
        const consentResult = await AdsConsent.showForm();
        console.log('📋 Consent form result:', consentResult);
        
        const hasUserConsent = consentResult.status === 'OBTAINED';
        setHasConsent(hasUserConsent);
        await AsyncStorage.setItem(STORAGE_KEYS.consentStatus, JSON.stringify(hasUserConsent));
        
        if (hasUserConsent) {
          console.log('✅ User provided consent for personalized ads');
        } else {
          console.log('⚠️ User declined consent, showing non-personalized ads only');
        }
      } else {
        // No consent form needed (e.g., non-EEA users)
        const hasUserConsent = consentInfo.status === 'OBTAINED' || consentInfo.status === 'NOT_REQUIRED';
        setHasConsent(hasUserConsent);
        await AsyncStorage.setItem(STORAGE_KEYS.consentStatus, JSON.stringify(hasUserConsent));
        
        console.log('📋 No consent form required, status:', consentInfo.status);
      }
      
    } catch (error) {
      console.error('📋 Consent handling failed:', error);
      // Default to non-personalized ads
      setHasConsent(false);
      await AsyncStorage.setItem(STORAGE_KEYS.consentStatus, JSON.stringify(false));
    }
  };

  // Create and preload ad instances for optimal performance
  const createAndPreloadAds = async () => {
    // Simplify initialization to focus on banner ads only for now
    console.log('🔄 Simplified ad initialization (banner ads only)...');
    
    // Banner ads work independently through BannerAdComponent
    // Skip complex interstitial/rewarded initialization for now
    
    console.log('✅ Banner ad system ready');
  };

  // Create individual ad instance with proper event handling
  const createAdInstance = async (
    type: 'interstitial' | 'rewarded' | 'appOpen',
    AdClass: any,
    adUnitId: string
  ): Promise<AdInstance> => {
    try {
      console.log(`🎯 Creating ${type} ad instance...`);
      
      const ad = AdClass.createForAdRequest(adUnitId, {
        keywords: AdMobConfig.adLoading.keywords,
        contentUrl: AdMobConfig.adLoading.contentUrl,
        requestNonPersonalizedAdsOnly: !hasConsent,
      });
      
      const instance: AdInstance = {
        ad,
        isLoaded: false,
        isLoading: false,
        loadTime: 0,
        failureCount: 0,
      };
      
      // Set up event listeners
      setupAdEventListeners(instance, type);
      
      return instance;
      
    } catch (error) {
      console.error(`❌ Failed to create ${type} ad instance:`, error);
      throw error;
    }
  };

  // Set up comprehensive event listeners for ad instances
  const setupAdEventListeners = (instance: AdInstance, type: string) => {
    if (!instance.ad) return;
    
    const eventType = type === 'rewarded' ? RewardedAdEventType : AdEventType;
    if (!eventType) {
      console.log(`⚠️ Event type not available for ${type} ad`);
      return;
    }
    
    // Use string literals for more reliable event handling
    const eventTypes = {
      loaded: 'loaded',
      failed_to_load: 'error',
      opened: 'opened', 
      closed: 'closed',
      clicked: 'clicked',
      impression: 'impression',
      earned_reward: 'earned_reward',
    };
    
    // Load events
    const unsubscribeLoaded = instance.ad.addAdEventListener(eventTypes.loaded, () => {
      console.log(`✅ ${type} ad loaded successfully`);
      instance.isLoaded = true;
      instance.isLoading = false;
      instance.loadTime = Date.now();
      instance.failureCount = 0;
      
      // Update state to trigger re-render
      setAdInstances(prev => ({ ...prev, [type]: { ...instance } }));
    });
    
         const unsubscribeFailedToLoad = instance.ad.addAdEventListener(
       eventTypes.failed_to_load,
       (error: any) => {
         console.error(`❌ ${type} ad failed to load:`, error);
         console.error(`🔍 Ad Debug Info:`, {
           adUnitId: instance.ad._adUnitId || 'unknown',
           errorCode: error?.code,
           errorMessage: error?.message,
           errorDomain: error?.domain,
           failureCount: instance.failureCount + 1,
           isProduction: !__DEV__,
         });
         
         instance.isLoaded = false;
         instance.isLoading = false;
         instance.failureCount += 1;
         instance.lastError = error?.message || 'Unknown error';
         
         // Implement exponential backoff retry
         scheduleAdRetry(instance, type);
         
         // Update state
         setAdInstances(prev => ({ ...prev, [type]: { ...instance } }));
       }
     );
    
    // Display events
    const unsubscribeOpened = instance.ad.addAdEventListener(eventTypes.opened, () => {
      console.log(`📺 ${type} ad opened`);
    });
    
    const unsubscribeClosed = instance.ad.addAdEventListener(eventTypes.closed, () => {
      console.log(`📺 ${type} ad closed`);
      
      // Reload ad for next use
      setTimeout(() => {
        preloadAd(instance, type);
      }, 1000);
    });
    
    // Rewarded ad specific events
    if (type === 'rewarded') {
      const unsubscribeEarnedReward = instance.ad.addAdEventListener(
        eventTypes.earned_reward,
        (reward: any) => {
          console.log(`🎁 User earned reward:`, reward);
          // The reward handling is done in the showRewardedAd method
        }
      );
      
      cleanupFunctionsRef.current.push(unsubscribeEarnedReward);
    }
    
    // Store cleanup functions
    cleanupFunctionsRef.current.push(
      unsubscribeLoaded,
      unsubscribeFailedToLoad,
      unsubscribeOpened,
      unsubscribeClosed
    );
  };

  // Preload an ad with proper error handling
  const preloadAd = async (instance: AdInstance, type: string): Promise<void> => {
    if (!instance.ad || instance.isLoading || instance.isLoaded) {
      return;
    }
    
    try {
      console.log(`🔄 Preloading ${type} ad...`);
      instance.isLoading = true;
      instance.isLoaded = false;
      
      // Update state immediately
      setAdInstances(prev => ({ ...prev, [type]: { ...instance } }));
      
      await instance.ad.load();
      
    } catch (error) {
      console.error(`❌ Failed to preload ${type} ad:`, error);
      instance.isLoading = false;
      instance.failureCount += 1;
      instance.lastError = error instanceof Error ? error.message : 'Unknown error';
      
      // Update state
      setAdInstances(prev => ({ ...prev, [type]: { ...instance } }));
    }
  };

  // Schedule retry with exponential backoff
  const scheduleAdRetry = (instance: AdInstance, type: string) => {
    if (instance.failureCount >= AdMobConfig.adLoading.retryAttempts) {
      console.log(`⚠️ ${type} ad max retry attempts reached`);
      return;
    }
    
    const delay = AdMobConfig.adLoading.exponentialBackoff
      ? AdUtils.calculateBackoffDelay(instance.failureCount, AdMobConfig.adLoading.retryDelayMs)
      : AdMobConfig.adLoading.retryDelayMs;
    
    console.log(`🔄 Scheduling ${type} ad retry in ${delay}ms (attempt ${instance.failureCount + 1})`);
    
    const timeoutId = setTimeout(() => {
      preloadAd(instance, type);
    }, delay);
    
    retryTimeoutsRef.current.push(timeoutId);
  };

  // Enhanced interstitial ad display with UX guidelines
  const showInterstitialAd = useCallback(async (): Promise<boolean> => {
    try {
      const instance = adInstances.interstitial;
      if (!instance?.isLoaded || isAdFree) {
        console.log('📺 Interstitial ad not available or user is ad-free');
        return false;
      }
      
      // Check if enough time has passed since last ad
      const minInterval = AdMobConfig.adDisplay.interstitial.minIntervalMs;
      if (!AdUtils.canShowAd(lastAdShown, minInterval)) {
        console.log('📺 Too soon to show another interstitial ad');
        return false;
      }
      
      // Check session limits
      if (sessionData && sessionData.adCount.interstitial >= AdMobConfig.adDisplay.interstitial.maxPerSession) {
        console.log('📺 Interstitial ad session limit reached');
        return false;
      }
      
      console.log('📺 Showing interstitial ad...');
      await instance.ad.show();
      
      // Update tracking
      await updateAdTracking('interstitial');
      
      return true;
      
    } catch (error) {
      console.error('❌ Failed to show interstitial ad:', error);
      return false;
    }
  }, [adInstances.interstitial, isAdFree, lastAdShown, sessionData]);

  // Enhanced rewarded ad display with proper reward handling
  const showRewardedAd = useCallback(async (
    onReward: () => void,
    onFail?: () => void
  ): Promise<boolean> => {
    try {
      const instance = adInstances.rewarded;
      if (!instance?.isLoaded) {
        console.log('📺 Rewarded ad not available');
        onFail?.();
        return false;
      }
      
      // Check session limits
      if (sessionData && sessionData.adCount.rewarded >= AdMobConfig.adDisplay.rewarded.maxPerSession) {
        console.log('📺 Rewarded ad session limit reached');
        onFail?.();
        return false;
      }
      
      console.log('📺 Showing rewarded ad...');
      
      return new Promise((resolve) => {
        let rewardEarned = false;
        
        // Set up one-time reward listener
        const unsubscribeReward = instance.ad.addAdEventListener(
          RewardedAdEventType.EARNED_REWARD,
          (reward: any) => {
            console.log('🎁 User earned reward:', reward);
            rewardEarned = true;
            onReward();
          }
        );
        
        // Set up one-time close listener
        const unsubscribeClose = instance.ad.addAdEventListener(
          AdEventType.CLOSED || 'closed',
          () => {
            // Clean up listeners
            unsubscribeReward();
            unsubscribeClose();
            
            if (rewardEarned) {
              // Grant ad-free period as additional reward
              enableAdFreeMode(AdMobConfig.userExperience.adFreeGracePeriods.afterRewardedAd / (1000 * 60 * 60));
              showSuccess('Reward earned! Enjoy ad-free experience for 5 minutes.');
            } else {
              onFail?.();
            }
            
            updateAdTracking('rewarded');
            resolve(rewardEarned);
          }
        );
        
        // Show the ad
        instance.ad.show();
      });
      
    } catch (error) {
      console.error('❌ Failed to show rewarded ad:', error);
      onFail?.();
      return false;
    }
  }, [adInstances.rewarded, sessionData]);

  // Action-specific rewarded ad with user-friendly prompts
  const showRewardedAdForAction = useCallback(async (
    action: 'untrack' | 'add_extra' | 'export',
    onReward: () => void,
    onFail?: () => void
  ): Promise<boolean> => {
    const actionMessages = {
      untrack: {
        title: 'Remove Email from Tracking',
        message: 'Watch a short ad to remove this email from tracking, or continue with limited features.',
        rewardMessage: 'Email removed from tracking!',
      },
      add_extra: {
        title: 'Add Extra Inbox',
        message: 'Watch a short ad to add an extra inbox, or upgrade to premium for unlimited inboxes.',
        rewardMessage: 'Extra inbox added!',
      },
      export: {
        title: 'Export Data',
        message: 'Watch a short ad to export your data, or upgrade to premium for unlimited exports.',
        rewardMessage: 'Data export completed!',
      },
    };
    
    const config = actionMessages[action];
    
    return new Promise((resolve) => {
      Alert.alert(
        config.title,
        config.message,
        [
          {
            text: 'Skip',
            style: 'cancel',
            onPress: () => {
              // Allow action but show info about limitations
              onReward();
              showInfo('Action completed with basic features. Watch ads or upgrade for enhanced features.');
              resolve(true);
            },
          },
          {
            text: 'Watch Ad',
            onPress: async () => {
              const success = await showRewardedAd(
                () => {
                  onReward();
                  showSuccess(config.rewardMessage);
                },
                onFail
              );
              resolve(success);
            },
          },
        ]
      );
    });
  }, [showRewardedAd]);

  // Update ad tracking with session management
  const updateAdTracking = async (adType: 'interstitial' | 'rewarded') => {
    const now = Date.now();
    setLastAdShown(now);
    await AsyncStorage.setItem(STORAGE_KEYS.lastAdShown, now.toString());
    
    // Update session data
    if (sessionData) {
      const updatedSession = {
        ...sessionData,
        adCount: {
          ...sessionData.adCount,
          [adType]: sessionData.adCount[adType] + 1,
          total: sessionData.adCount.total + 1,
        },
      };
      setSessionData(updatedSession);
      await AsyncStorage.setItem(STORAGE_KEYS.sessionData, JSON.stringify(updatedSession));
    }
  };

  // Enhanced action tracking with intelligent ad timing
  const canShowAd = useCallback((type: 'refresh' | 'lookup' | 'generation'): boolean => {
    if (isAdFree || !isInitialized) return false;
    
    const thresholds = AdMobConfig.userExperience.actionThresholds;
    const counts = { refresh: refreshCount, lookup: lookupCount, generation: generationCount };
    
    // Check if user has performed minimum actions before first ad
    const totalActions = refreshCount + lookupCount + generationCount;
    if (totalActions < AdMobConfig.userExperience.minActionsBeforeFirstAd) {
      return false;
    }
    
    return counts[type] >= thresholds[type];
  }, [refreshCount, lookupCount, generationCount, isAdFree, isInitialized]);

  const incrementAction = useCallback(async (type: 'refresh' | 'lookup' | 'generation') => {
    const setters = {
      refresh: setRefreshCount,
      lookup: setLookupCount,
      generation: setGenerationCount,
    };
    
    const storageKeys = {
      refresh: STORAGE_KEYS.refreshCount,
      lookup: STORAGE_KEYS.lookupCount,
      generation: STORAGE_KEYS.generationCount,
    };
    
    setters[type]((prev: number) => {
      const newCount = prev + 1;
      AsyncStorage.setItem(storageKeys[type], newCount.toString());
      return newCount;
    });
    
    // Update session data
    if (sessionData) {
      const updatedSession = {
        ...sessionData,
        actionCount: {
          ...sessionData.actionCount,
          [type]: sessionData.actionCount[type] + 1,
          total: sessionData.actionCount.total + 1,
        },
      };
      setSessionData(updatedSession);
      await AsyncStorage.setItem(STORAGE_KEYS.sessionData, JSON.stringify(updatedSession));
    }
    
    // Auto-show interstitial at appropriate moments
    if (canShowAd(type) && Math.random() < 0.7) { // 70% chance to show ad
      setTimeout(() => {
        showInterstitialAd();
      }, 500); // Small delay for better UX
    }
  }, [sessionData, canShowAd, showInterstitialAd]);

  // Enhanced ad-free mode
  const enableAdFreeMode = useCallback(async (hours: number) => {
    const adFreeUntil = Date.now() + (hours * 60 * 60 * 1000);
    setIsAdFree(true);
    await AsyncStorage.setItem(STORAGE_KEYS.adFreeUntil, adFreeUntil.toString());
    
    console.log(`🆓 Ad-free mode enabled for ${hours} hours`);
    
    // Set timer to disable ad-free mode
    setTimeout(() => {
      setIsAdFree(false);
      showInfo('Ad-free period has ended. Thank you for supporting our app!');
    }, hours * 60 * 60 * 1000);
  }, []);

  // Refresh ad instance manually (for debugging)
  const refreshAdInstance = useCallback(async (type: 'interstitial' | 'rewarded') => {
    const instance = adInstances[type];
    if (instance) {
      console.log(`🔄 Manually refreshing ${type} ad instance...`);
      await preloadAd(instance, type);
    }
  }, [adInstances]);

  // Show ad inspector for debugging
  const showAdInspector = useCallback(() => {
    if (mobileAds && __DEV__) {
      try {
        mobileAds().openAdInspector();
      } catch (error) {
        console.error('❌ Failed to open ad inspector:', error);
      }
    }
  }, []);

  // Load stored data on mount
  const loadStoredData = useCallback(async () => {
    try {
      const [
        storedRefreshCount,
        storedLookupCount,
        storedGenerationCount,
        storedAdFreeUntil,
        storedLastAdShown,
        storedConsentStatus,
        storedSessionData,
      ] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.refreshCount),
        AsyncStorage.getItem(STORAGE_KEYS.lookupCount),
        AsyncStorage.getItem(STORAGE_KEYS.generationCount),
        AsyncStorage.getItem(STORAGE_KEYS.adFreeUntil),
        AsyncStorage.getItem(STORAGE_KEYS.lastAdShown),
        AsyncStorage.getItem(STORAGE_KEYS.consentStatus),
        AsyncStorage.getItem(STORAGE_KEYS.sessionData),
      ]);
      
      setRefreshCount(parseInt(storedRefreshCount || '0', 10));
      setLookupCount(parseInt(storedLookupCount || '0', 10));
      setGenerationCount(parseInt(storedGenerationCount || '0', 10));
      setLastAdShown(parseInt(storedLastAdShown || '0', 10));
      setHasConsent(JSON.parse(storedConsentStatus || 'false'));
      
      // Check ad-free status
      const adFreeUntil = parseInt(storedAdFreeUntil || '0', 10);
      if (adFreeUntil > Date.now()) {
        setIsAdFree(true);
      }
      
      // Load session data
      if (storedSessionData) {
        try {
          const parsedSession = JSON.parse(storedSessionData);
          setSessionData(parsedSession);
        } catch (error) {
          console.error('❌ Failed to parse session data:', error);
        }
      }
      
    } catch (error) {
      console.error('❌ Failed to load stored data:', error);
    }
  }, []);

  // App state change handler for better ad lifecycle management
  const handleAppStateChange = useCallback((nextAppState: AppStateStatus) => {
    if (appStateRef.current.match(/inactive|background/) && nextAppState === 'active') {
      console.log('📱 App became active, refreshing ad instances...');
      
      // Refresh ad instances when app comes to foreground
      Object.entries(adInstances).forEach(([type, instance]) => {
        if (instance && !instance.isLoaded && !instance.isLoading) {
          preloadAd(instance, type);
        }
      });
    }
    
    appStateRef.current = nextAppState;
  }, [adInstances]);

  // Initialize everything on mount
  useEffect(() => {
    let isMounted = true;
    
    const initialize = async () => {
      if (!isMounted) return;
      
      // Load stored data first
      await loadStoredData();
      
      // Initialize ads SDK
      await initializeAdsSDK();
    };
    
    initialize();
    
    // Set up app state listener
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    
    return () => {
      isMounted = false;
      subscription?.remove();
    };
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Clear all timeouts
      retryTimeoutsRef.current.forEach(clearTimeout);
      
      // Remove all event listeners
      cleanupFunctionsRef.current.forEach(cleanup => cleanup());
      
      console.log('🧹 AdContext cleanup completed');
    };
  }, []);

  const contextValue: AdContextType = {
    showInterstitialAd,
    showRewardedAd,
    showRewardedAdForAction,
    canShowAd,
    incrementAction,
    isAdFree,
    enableAdFreeMode,
    isInitialized,
    hasConsent,
    isLoading,
    adInstances,
    refreshAdInstance,
    showAdInspector,
  };

  return (
    <AdContext.Provider value={contextValue}>
      {children}
    </AdContext.Provider>
  );
}

export function useAds() {
  const context = useContext(AdContext);
  if (context === undefined) {
    throw new Error('useAds must be used within an AdProvider');
  }
  return context;
} 