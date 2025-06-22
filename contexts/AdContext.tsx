import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Alert } from 'react-native';

// AdMob imports (install: expo install expo-ads-admob)
let AdMobBanner: any = null;
let AdMobInterstitial: any = null;
let AdMobRewarded: any = null;

try {
  const AdMob = require('expo-ads-admob');
  AdMobBanner = AdMob.AdMobBanner;
  AdMobInterstitial = AdMob.AdMobInterstitial;
  AdMobRewarded = AdMob.AdMobRewarded;
} catch (error) {
  console.log('AdMob not available');
}

interface AdContextType {
  showInterstitialAd: () => Promise<void>;
  showRewardedAd: (onReward: () => void) => Promise<void>;
  canShowAd: (type: 'refresh' | 'lookup' | 'generation') => boolean;
  incrementAction: (type: 'refresh' | 'lookup' | 'generation') => void;
  isAdFree: boolean;
  enableAdFreeMode: (hours: number) => void;
}

const AdContext = createContext<AdContextType | undefined>(undefined);

// Ad unit IDs (replace with your actual AdMob IDs)
const AD_UNIT_IDS = {
  banner: __DEV__ ? 'ca-app-pub-3940256099942544/6300978111' : 'YOUR_BANNER_ID',
  interstitial: __DEV__ ? 'ca-app-pub-3940256099942544/1033173712' : 'YOUR_INTERSTITIAL_ID',
  rewarded: __DEV__ ? 'ca-app-pub-3940256099942544/5224354917' : 'YOUR_REWARDED_ID',
};

// Storage keys
const STORAGE_KEYS = {
  refreshCount: 'ad_refresh_count',
  lookupCount: 'ad_lookup_count', 
  generationCount: 'ad_generation_count',
  adFreeUntil: 'ad_free_until',
  lastAdShown: 'last_ad_shown',
};

export function AdProvider({ children }: { children: React.ReactNode }) {
  const [refreshCount, setRefreshCount] = useState(0);
  const [lookupCount, setLookupCount] = useState(0);
  const [generationCount, setGenerationCount] = useState(0);
  const [isAdFree, setIsAdFree] = useState(false);
  const [lastAdShown, setLastAdShown] = useState(0);

  // Load counters on mount
  useEffect(() => {
    loadCounters();
    checkAdFreeStatus();
  }, []);

  // Initialize AdMob
  useEffect(() => {
    if (AdMobInterstitial && AdMobRewarded) {
      initializeAds();
    }
  }, []);

  const initializeAds = async () => {
    try {
      // Set ad unit IDs
      await AdMobInterstitial.setAdUnitID(AD_UNIT_IDS.interstitial);
      await AdMobRewarded.setAdUnitID(AD_UNIT_IDS.rewarded);
      
      // Request ads
      await AdMobInterstitial.requestAdAsync();
      await AdMobRewarded.requestAdAsync();
    } catch (error) {
      console.log('Failed to initialize ads:', error);
    }
  };

  const loadCounters = async () => {
    try {
      const [refresh, lookup, generation, lastAd] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.refreshCount),
        AsyncStorage.getItem(STORAGE_KEYS.lookupCount),
        AsyncStorage.getItem(STORAGE_KEYS.generationCount),
        AsyncStorage.getItem(STORAGE_KEYS.lastAdShown),
      ]);

      setRefreshCount(refresh ? parseInt(refresh) : 0);
      setLookupCount(lookup ? parseInt(lookup) : 0);
      setGenerationCount(generation ? parseInt(generation) : 0);
      setLastAdShown(lastAd ? parseInt(lastAd) : 0);
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
    if (isAdFree) return false;
    
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

  const showInterstitialAd = async (): Promise<void> => {
    if (!AdMobInterstitial || isAdFree) return;

    try {
      const isReady = await AdMobInterstitial.getIsReadyAsync();
      if (isReady) {
        await AdMobInterstitial.showAdAsync();
        setLastAdShown(Date.now());
        await AsyncStorage.setItem(STORAGE_KEYS.lastAdShown, Date.now().toString());
        
        // Request next ad
        setTimeout(() => {
          AdMobInterstitial.requestAdAsync();
        }, 1000);
      }
    } catch (error) {
      console.log('Failed to show interstitial ad:', error);
    }
  };

  const showRewardedAd = async (onReward: () => void): Promise<void> => {
    if (!AdMobRewarded) return;

    try {
      const isReady = await AdMobRewarded.getIsReadyAsync();
      if (isReady) {
        // Set up reward listener
        const rewardListener = AdMobRewarded.addEventListener('rewardedVideoUserDidEarnReward', () => {
          onReward();
          rewardListener.remove();
        });

        await AdMobRewarded.showAdAsync();
        
        // Request next ad
        setTimeout(() => {
          AdMobRewarded.requestAdAsync();
        }, 1000);
      } else {
        Alert.alert(
          'Ad Not Ready',
          'Please try again in a moment.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.log('Failed to show rewarded ad:', error);
      Alert.alert(
        'Ad Failed',
        'Unable to load ad. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

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
    canShowAd,
    incrementAction,
    isAdFree,
    enableAdFreeMode,
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