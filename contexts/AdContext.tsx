import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Alert } from 'react-native';
import { getAdUnitIds } from '../constants/AdMobConfig';
import { useGlobalToast } from '../hooks/useGlobalToast';

// Conditional import to prevent errors in Expo Go
let mobileAds: any = null;
let InterstitialAd: any = null;
let RewardedAd: any = null;
let AdEventType: any = null;
let RewardedAdEventType: any = null;
let TestIds: any = null;

// Google UMP SDK for consent management
let UMP: any = null;

// Check if we're running in Expo Go
const isExpoGo = Constants.appOwnership === 'expo';

if (!isExpoGo) {
  try {
    const googleMobileAds = require('react-native-google-mobile-ads');
    mobileAds = googleMobileAds.default;
    InterstitialAd = googleMobileAds.InterstitialAd;
    RewardedAd = googleMobileAds.RewardedAd;
    AdEventType = googleMobileAds.AdEventType;
    RewardedAdEventType = googleMobileAds.RewardedAdEventType;
    TestIds = googleMobileAds.TestIds;
    
    // Import UMP SDK
    UMP = require('react-native-google-ump');
  } catch (error) {
    console.log('⚠️ Google Mobile Ads not available in current environment');
  }
}

interface AdContextType {
  showInterstitialAd: () => Promise<void>;
  showRewardedAd: (onReward: () => void) => Promise<void>;
  showRewardedAdForAction: (action: 'untrack' | 'add_extra' | 'export', onReward: () => void, onFail?: () => void) => Promise<void>;
  canShowAd: (type: 'refresh' | 'lookup' | 'generation') => boolean;
  incrementAction: (type: 'refresh' | 'lookup' | 'generation') => void;
  isAdFree: boolean;
  enableAdFreeMode: (hours: number) => void;
  isInitialized: boolean;
  hasConsent: boolean;
}

const AdContext = createContext<AdContextType | undefined>(undefined);

// Storage keys
const STORAGE_KEYS = {
  refreshCount: 'ad_refresh_count',
  lookupCount: 'ad_lookup_count', 
  generationCount: 'ad_generation_count',
  adFreeUntil: 'ad_free_until',
  lastAdShown: 'last_ad_shown',
  consentStatus: 'ad_consent_status',
};

export function AdProvider({ children }: { children: React.ReactNode }) {
  const [refreshCount, setRefreshCount] = useState(0);
  const [lookupCount, setLookupCount] = useState(0);
  const [generationCount, setGenerationCount] = useState(0);
  const [isAdFree, setIsAdFree] = useState(false);
  const [lastAdShown, setLastAdShown] = useState(0);
  const [isAdsInitialized, setIsAdsInitialized] = useState(false);
  const [hasConsent, setHasConsent] = useState(false);
  
  const { showError, showInfo, showSuccess } = useGlobalToast();
  const isMobileAdsStartCalledRef = useRef(false);
  
  // Use any type for refs since we're conditionally importing
  const interstitialRef = useRef<any>(null);
  const rewardedRef = useRef<any>(null);

  // Initialize AdMob following Google's official guidelines
  // Source: https://developers.google.com/admob/android/quick-start#initialize_the_google_mobile_ads_sdk
  const initializeAds = useCallback(async () => {
    if (isExpoGo || !mobileAds || !UMP) {
      console.log('📺 Ads not available in current environment');
      setIsAdsInitialized(false);
      return;
    }

    try {
      console.log('🎯 Starting ads initialization...');
      
      // First, handle consent
      await requestConsentInformation();
      
      // Initialize the Google Mobile Ads SDK after consent
      if (!isMobileAdsStartCalledRef.current) {
        console.log('🎯 Initializing Google Mobile Ads SDK...');
        const adapterStatuses = await mobileAds().initialize();
        console.log('🎯 Mobile Ads SDK initialized:', adapterStatuses);
        isMobileAdsStartCalledRef.current = true;
      }
      
      // Create ad instances
      createAdInstances();
      
      setIsAdsInitialized(true);
      console.log('✅ Ads initialization completed');
      
    } catch (error) {
      console.error('❌ Ads initialization failed:', error);
      setIsAdsInitialized(false);
    }
  }, []);

  // Initialize AdMob on component mount
  useEffect(() => {
    let isMounted = true;

    const initializeAdsOnMount = async () => {
      if (!isAdsInitialized && isMounted) {
        await initializeAds();
      }
    };

    initializeAdsOnMount();

    return () => {
      isMounted = false;
    };
  }, [initializeAds, isAdsInitialized]);

  // Load counters on mount
  useEffect(() => {
    loadCounters();
    checkAdFreeStatus();
  }, []);

  const requestConsentInformation = async () => {
    if (!UMP) {
      console.log('📋 UMP SDK not available, skipping consent');
      setHasConsent(false);
      return;
    }

    try {
      console.log('📋 Requesting consent information...');
      
      // Request consent information update
      const consentInfo = await UMP.requestConsentInfoUpdate();
      
      console.log('📋 Consent info received:', {
        isConsentFormAvailable: consentInfo.isConsentFormAvailable,
        consentStatus: consentInfo.consentStatus
      });
      
      // Show consent form if required
      if (consentInfo.isConsentFormAvailable) {
        console.log('📋 Showing consent form...');
        const consentResult = await UMP.showConsentFormIfRequired();
        
        console.log('📋 Consent form result:', {
          status: consentResult.status,
          canRequestAds: consentResult.canRequestAds
        });
        
        setHasConsent(consentResult.canRequestAds || false);
        await AsyncStorage.setItem(STORAGE_KEYS.consentStatus, JSON.stringify(consentResult.canRequestAds || false));
      } else {
        // No consent form needed, check if we can request ads
        const canRequestAds = consentInfo.consentStatus === 'OBTAINED' || consentInfo.consentStatus === 'NOT_REQUIRED';
        setHasConsent(canRequestAds);
        await AsyncStorage.setItem(STORAGE_KEYS.consentStatus, JSON.stringify(canRequestAds));
        
        console.log('📋 No consent form required, can request ads:', canRequestAds);
      }
      
    } catch (error) {
      console.log('📋 Consent gathering failed, proceeding with limited ads:', error);
      // Fallback to limited ads
      setHasConsent(false);
      await AsyncStorage.setItem(STORAGE_KEYS.consentStatus, JSON.stringify(false));
    }
  };

  const createAdInstances = () => {
    if (!InterstitialAd || !RewardedAd || !AdEventType || !RewardedAdEventType) {
      console.log('📺 Ad classes not available, skipping ad instance creation');
      return;
    }

    try {
      const adUnitIds = getAdUnitIds();
      
      // Create Interstitial Ad
      const interstitialAdUnitId = __DEV__ ? TestIds.INTERSTITIAL : adUnitIds.interstitial;
      interstitialRef.current = InterstitialAd.createForAdRequest(interstitialAdUnitId, {
        requestNonPersonalizedAdsOnly: !hasConsent,
      });
      
      // Add event listeners for interstitial
      interstitialRef.current.addAdEventListener(AdEventType.LOADED, () => {
        console.log('📺 Interstitial ad loaded successfully');
      });
      
      interstitialRef.current.addAdEventListener(AdEventType.ERROR, (error: any) => {
        console.error('📺 Interstitial ad error:', error);
      });
      
      interstitialRef.current.addAdEventListener(AdEventType.CLOSED, () => {
        console.log('📺 Interstitial ad closed');
        // Load next ad after a delay
        setTimeout(loadInterstitialAd, 1000);
      });
      
      // Create Rewarded Ad
      const rewardedAdUnitId = __DEV__ ? TestIds.REWARDED : adUnitIds.rewarded;
      rewardedRef.current = RewardedAd.createForAdRequest(rewardedAdUnitId, {
        requestNonPersonalizedAdsOnly: !hasConsent,
      });
      
      // Add event listeners for rewarded ad with proper error handling
      try {
        rewardedRef.current.addAdEventListener(RewardedAdEventType.LOADED, () => {
          console.log('🎁 Rewarded ad loaded successfully');
        });
        
        rewardedRef.current.addAdEventListener(RewardedAdEventType.ERROR, (error: any) => {
          console.error('🎁 Rewarded ad error:', error);
        });
        
        rewardedRef.current.addAdEventListener(RewardedAdEventType.CLOSED, () => {
          console.log('🎁 Rewarded ad closed');
          // Load next ad after a delay
          setTimeout(loadRewardedAd, 1000);
        });
      } catch (eventError) {
        console.error('🎁 Failed to add rewarded ad event listeners:', eventError);
        // Continue without event listeners if they fail
      }
      
      // Load initial ads
      loadInterstitialAd();
      loadRewardedAd();
      
      console.log('📺 Ad instances created and loading...');
    } catch (error) {
      console.error('📺 Failed to create ad instances:', error);
    }
  };

  const loadInterstitialAd = () => {
    if (interstitialRef.current && !interstitialRef.current.loaded) {
      try {
        interstitialRef.current.load();
        console.log('📺 Loading interstitial ad...');
      } catch (error) {
        console.error('📺 Failed to load interstitial ad:', error);
      }
    }
  };

  const loadRewardedAd = () => {
    if (rewardedRef.current && !rewardedRef.current.loaded) {
      try {
        rewardedRef.current.load();
        console.log('🎁 Loading rewarded ad...');
      } catch (error) {
        console.error('🎁 Failed to load rewarded ad:', error);
      }
    }
  };

  const loadCounters = async () => {
    try {
      const [refresh, lookup, generation, lastAd, consent] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.refreshCount),
        AsyncStorage.getItem(STORAGE_KEYS.lookupCount),
        AsyncStorage.getItem(STORAGE_KEYS.generationCount),
        AsyncStorage.getItem(STORAGE_KEYS.lastAdShown),
        AsyncStorage.getItem(STORAGE_KEYS.consentStatus),
      ]);

      setRefreshCount(refresh ? parseInt(refresh) : 0);
      setLookupCount(lookup ? parseInt(lookup) : 0);
      setGenerationCount(generation ? parseInt(generation) : 0);
      setLastAdShown(lastAd ? parseInt(lastAd) : 0);
      setHasConsent(consent ? JSON.parse(consent) : false);
    } catch (error) {
      console.log('Failed to load ad counters:', error);
    }
  };

  const checkAdFreeStatus = async () => {
    try {
      const adFreeUntil = await AsyncStorage.getItem(STORAGE_KEYS.adFreeUntil);
      if (adFreeUntil) {
        const until = parseInt(adFreeUntil);
        setIsAdFree(Date.now() < until);
      }
    } catch (error) {
      console.log('Failed to check ad-free status:', error);
    }
  };

  const canShowAd = (type: 'refresh' | 'lookup' | 'generation'): boolean => {
    if (isAdFree || !isAdsInitialized) return false;
    
    // Minimum 60 seconds between ads
    if (Date.now() - lastAdShown < 60000) return false;

    switch (type) {
      case 'refresh':
        return refreshCount > 0 && refreshCount % 5 === 0;
      case 'lookup':
        return lookupCount > 0 && lookupCount % 3 === 0;
      case 'generation':
        return generationCount > 0 && generationCount % 10 === 0;
      default:
        return false;
    }
  };

  const incrementAction = async (type: 'refresh' | 'lookup' | 'generation') => {
    try {
      let newCount = 0;
      
      switch (type) {
        case 'refresh':
          newCount = refreshCount + 1;
          setRefreshCount(newCount);
          await AsyncStorage.setItem(STORAGE_KEYS.refreshCount, newCount.toString());
          break;
        case 'lookup':
          newCount = lookupCount + 1;
          setLookupCount(newCount);
          await AsyncStorage.setItem(STORAGE_KEYS.lookupCount, newCount.toString());
          break;
        case 'generation':
          newCount = generationCount + 1;
          setGenerationCount(newCount);
          await AsyncStorage.setItem(STORAGE_KEYS.generationCount, newCount.toString());
          break;
      }
    } catch (error) {
      console.log('Failed to increment counter:', error);
    }
  };

  const showInterstitialAd = useCallback(async (): Promise<void> => {
    // Skip in Expo Go
    if (isExpoGo || !mobileAds || !InterstitialAd) {
      console.log('⚠️ Interstitial ads not available in Expo Go');
      return;
    }

    try {
      // Check if interstitial ad instance exists
      if (!interstitialRef.current) {
        console.log('📺 Interstitial ad not initialized');
        return;
      }

      const isLoaded = interstitialRef.current.loaded;
      if (isLoaded) {
        await interstitialRef.current.show();
        setLastAdShown(Date.now());
        await AsyncStorage.setItem(STORAGE_KEYS.lastAdShown, Date.now().toString());
        
        // Load next ad
        setTimeout(loadInterstitialAd, 1000);
      }
    } catch (error) {
      console.log('Failed to show interstitial ad:', error);
    }
  }, []);

  const showRewardedAd = useCallback(async (onReward: () => void): Promise<void> => {
    // Skip in Expo Go
    if (isExpoGo || !mobileAds || !RewardedAd || !RewardedAdEventType) {
      console.log('⚠️ Rewarded ads not available in Expo Go');
      onReward(); // Still execute the reward action for testing
      return;
    }

    try {
      if (!rewardedRef.current) {
        console.log('🎁 Rewarded ad not initialized');
        onReward(); // Execute action anyway
        return;
      }

      const isLoaded = rewardedRef.current.loaded;
      if (isLoaded) {
        // Set up reward listener with error handling
        let unsubscribe: (() => void) | null = null;
        try {
          unsubscribe = rewardedRef.current.addAdEventListener(RewardedAdEventType.EARNED_REWARD, () => {
            console.log('🎁 User earned reward');
            onReward();
            if (unsubscribe) unsubscribe();
          });
        } catch (eventError) {
          console.log('🎁 Failed to add reward event listener, executing action anyway:', eventError);
          onReward();
          return;
        }

        await rewardedRef.current.show();
        
        // Load next ad
        setTimeout(loadRewardedAd, 1000);
      } else {
        console.log('🎁 Rewarded ad not loaded, executing action anyway');
        onReward();
      }
    } catch (error) {
      console.log('Failed to show rewarded ad:', error);
      onReward(); // Execute action anyway
    }
  }, []);

  const showRewardedAdForAction = useCallback(async (
    action: 'untrack' | 'add_extra' | 'export', 
    onReward: () => void, 
    onFail?: () => void
  ): Promise<void> => {
    // Skip in Expo Go - just execute the reward action
    if (isExpoGo || !mobileAds || !RewardedAd) {
      console.log(`⚠️ Rewarded ads not available in Expo Go - executing ${action} action directly`);
      onReward();
      return;
    }

    const actionMessages = {
      untrack: {
        title: 'Watch Ad to Untrack Email',
        message: 'Watch a short ad to remove this email from your lookup list.',
        notReady: 'Ad not ready. Please try again in a moment.',
        failed: 'Unable to load ad. Please try again later.'
      },
      add_extra: {
        title: 'Watch Ad for Extra Inbox',
        message: 'Watch a short ad to add more than 5 email addresses to your lookup list.',
        notReady: 'Ad not ready. Please try again in a moment.',
        failed: 'Unable to load ad. Please try again later.'
      },
      export: {
        title: 'Watch Ad to Export Emails',
        message: 'Watch a short ad to download all your emails as an Excel file.',
        notReady: 'Ad not ready. Please try again in a moment.',
        failed: 'Unable to load ad. Please try again later.'
      }
    };

    const messages = actionMessages[action];

    try {
      // Check if rewarded ad instance exists
      if (!rewardedRef.current) {
        console.log('🎁 Rewarded ad not initialized, executing action anyway');
        onReward();
        return;
      }

      const isLoaded = rewardedRef.current.loaded;
      console.log('🎁 Rewarded ad loaded:', isLoaded);
      
      if (isLoaded) {
        // Show confirmation dialog
        Alert.alert(
          messages.title,
          messages.message,
          [
            { text: 'Cancel', style: 'cancel', onPress: onFail },
            { 
              text: 'Watch Ad', 
              onPress: async () => {
                try {
                  // Set up reward listener with error handling
                  let unsubscribe: (() => void) | null = null;
                  try {
                    unsubscribe = rewardedRef.current!.addAdEventListener(RewardedAdEventType.EARNED_REWARD, () => {
                      console.log('🎁 Rewarded ad completed successfully');
                      onReward();
                      if (unsubscribe) unsubscribe();
                    });
                  } catch (eventError) {
                    console.log('🎁 Failed to add reward event listener, executing action anyway:', eventError);
                    onReward();
                    return;
                  }

                  await rewardedRef.current!.show();
                  
                  // Load next ad
                  setTimeout(loadRewardedAd, 1000);
                } catch (error) {
                  console.log('🎁 Failed to show rewarded ad:', error);
                  Alert.alert('Ad Failed', messages.failed, [{ text: 'OK' }]);
                  onFail?.();
                }
              }
            }
          ]
        );
      } else {
        console.log('🎁 Rewarded ad not ready, showing fallback option');
        Alert.alert(
          'Ad Not Ready', 
          messages.notReady + '\n\nWould you like to try the action anyway?',
          [
            { text: 'Cancel', style: 'cancel', onPress: onFail },
            { text: 'Try Anyway', onPress: onReward }
          ]
        );
      }
    } catch (error) {
      console.log('🎁 Error in showRewardedAdForAction:', error);
      Alert.alert(
        'Ad Error', 
        messages.failed + '\n\nWould you like to try the action anyway?',
        [
          { text: 'Cancel', style: 'cancel', onPress: onFail },
          { text: 'Try Anyway', onPress: onReward }
        ]
      );
    }
  }, []);

  const enableAdFreeMode = async (hours: number) => {
    const until = Date.now() + (hours * 60 * 60 * 1000);
    setIsAdFree(true);
    await AsyncStorage.setItem(STORAGE_KEYS.adFreeUntil, until.toString());
    
    // Set timer to disable ad-free mode
    setTimeout(() => {
      setIsAdFree(false);
    }, hours * 60 * 60 * 1000);
  };

  const value = {
    showInterstitialAd,
    showRewardedAd,
    showRewardedAdForAction,
    canShowAd,
    incrementAction,
    isAdFree,
    enableAdFreeMode,
    isInitialized: isAdsInitialized,
    hasConsent,
  };

  return (
    <AdContext.Provider value={value}>
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