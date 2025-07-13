import Constants from 'expo-constants';
import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import { Platform, StyleSheet, View, ViewStyle } from 'react-native';
import { AdMobConfig, AdUtils, getAdUnitIds } from '../../constants/AdMobConfig';
import { useAds } from '../../contexts/AdContext';

// Check if we're running in Expo Go
const isExpoGo = Constants.appOwnership === 'expo';

// Conditional import to prevent errors in Expo Go
let BannerAd: any = null;
let BannerAdSize: any = null;
let AdEventType: any = null;

if (!isExpoGo) {
  try {
    const googleMobileAds = require('react-native-google-mobile-ads');
    BannerAd = googleMobileAds.BannerAd;
    BannerAdSize = googleMobileAds.BannerAdSize;
    AdEventType = googleMobileAds.AdEventType;
  } catch (error) {
    console.log('📺 Banner ad components not available');
  }
}

interface BannerAdComponentProps {
  size?: 'standard' | 'large' | 'medium_rectangle' | 'adaptive';
  position?: 'top' | 'bottom';
  style?: ViewStyle;
  collapsible?: boolean;
  testMode?: boolean;
  onAdLoaded?: () => void;
  onAdFailedToLoad?: (error: any) => void;
  onAdClicked?: () => void;
  onAdClosed?: () => void;
  onAdOpened?: () => void;
}

export const BannerAdComponent = memo(({
  size = 'adaptive',
  position = 'bottom',
  style,
  collapsible = false,
  testMode = __DEV__,
  onAdLoaded,
  onAdFailedToLoad,
  onAdClicked,
  onAdClosed,
  onAdOpened,
}: BannerAdComponentProps) => {
  // Hooks must be called at the top level before any conditional returns
  const { isAdFree, isInitialized, hasConsent } = useAds();
  
  // Local state
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [adHeight, setAdHeight] = useState(0);
  
  // Refs
  const retryTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(true);
  const loadAttemptRef = useRef(0);

  // Get ad unit ID
  const getAdUnitId = useCallback(() => {
    const adUnitIds = getAdUnitIds();
    return testMode ? adUnitIds.banner : adUnitIds.banner;
  }, [testMode]);

  // Get banner size based on prop and configuration
  const getBannerSize = useCallback(() => {
    if (!BannerAdSize) return null;
    
    switch (size) {
      case 'standard':
        return BannerAdSize.BANNER; // 320x50
      case 'large':
        return BannerAdSize.LARGE_BANNER; // 320x100
      case 'medium_rectangle':
        return BannerAdSize.MEDIUM_RECTANGLE; // 300x250
      case 'adaptive':
      default:
        // Use adaptive banner for better performance (Google's recommendation)
        return AdMobConfig.adDisplay.banner.useAdaptiveBanners
          ? BannerAdSize.ANCHORED_ADAPTIVE_BANNER
          : BannerAdSize.BANNER;
    }
  }, [size]);

  // Handle ad loaded event
  const handleAdLoaded = useCallback((event?: any) => {
    if (!mountedRef.current) return;
    
    console.log('📺 Banner ad loaded successfully');
    setIsLoaded(true);
    setLoadError(null);
    setRetryCount(0);
    
    // Extract ad height for layout purposes
    if (event?.nativeEvent?.height) {
      setAdHeight(event.nativeEvent.height);
    }
    
    onAdLoaded?.();
  }, [onAdLoaded]);

  // Handle ad failed to load event
  const handleAdFailedToLoad = useCallback((error: any) => {
    if (!mountedRef.current) return;
    
    console.error('📺 Banner ad failed to load:', error);
    setIsLoaded(false);
    setLoadError(error?.message || 'Unknown error');
    
    // Implement retry logic with exponential backoff
    if (retryCount < AdMobConfig.adLoading.retryAttempts) {
      const delay = AdMobConfig.adLoading.exponentialBackoff
        ? AdUtils.calculateBackoffDelay(retryCount + 1, AdMobConfig.adLoading.retryDelayMs)
        : AdMobConfig.adLoading.retryDelayMs;
      
      console.log(`📺 Retrying banner ad load in ${delay}ms (attempt ${retryCount + 1})`);
      
      retryTimeoutRef.current = setTimeout(() => {
        if (mountedRef.current) {
          setRetryCount(prev => prev + 1);
          loadAttemptRef.current += 1;
        }
      }, delay);
    }
    
    onAdFailedToLoad?.(error);
  }, [retryCount, onAdFailedToLoad]);

  // Handle ad clicked event
  const handleAdClicked = useCallback(() => {
    console.log('📺 Banner ad clicked');
    onAdClicked?.();
  }, [onAdClicked]);

  // Handle ad closed event
  const handleAdClosed = useCallback(() => {
    console.log('📺 Banner ad closed');
    onAdClosed?.();
  }, [onAdClosed]);

  // Handle ad opened event
  const handleAdOpened = useCallback(() => {
    console.log('📺 Banner ad opened');
    onAdOpened?.();
  }, [onAdOpened]);

  // Cleanup function
  const cleanup = useCallback(() => {
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }
  }, []);

  // Setup and cleanup effects
  useEffect(() => {
    mountedRef.current = true;
    
    return () => {
      mountedRef.current = false;
      cleanup();
    };
  }, [cleanup]);

  // Retry effect
  useEffect(() => {
    // This effect will trigger when loadAttemptRef changes via the retry mechanism
    // No need to do anything here since the BannerAd component will re-render
  }, [loadAttemptRef.current]);

  // Don't render if ads are not available or user is ad-free
  if (isExpoGo || !BannerAd || !BannerAdSize || isAdFree || !isInitialized) {
    return null;
  }

  // Build banner ad request configuration
  const requestConfiguration = {
    requestNonPersonalizedAdsOnly: !hasConsent,
    keywords: AdMobConfig.adLoading.keywords,
    contentUrl: AdMobConfig.adLoading.contentUrl,
  };

  // Build banner props
  const bannerProps = {
    unitId: getAdUnitId(),
    size: getBannerSize(),
    requestOptions: requestConfiguration,
    
    // Event handlers
    onAdLoaded: handleAdLoaded,
    onAdFailedToLoad: handleAdFailedToLoad,
    onAdClicked: handleAdClicked,
    onAdClosed: handleAdClosed,
    onAdOpened: handleAdOpened,
    
    // Collapsible banner configuration (if supported)
    ...(collapsible && AdMobConfig.adDisplay.banner.enableCollapsible && {
      collapsiblePlacement: AdMobConfig.adDisplay.banner.collapsibleDirection,
    }),
  };

  // Container styles based on position and configuration
  const containerStyle = [
    styles.container,
    position === 'top' && styles.topContainer,
    position === 'bottom' && styles.bottomContainer,
    adHeight > 0 && { height: adHeight },
    style,
  ];

  return (
    <View style={containerStyle}>
      <BannerAd
        {...bannerProps}
        style={styles.bannerAd}
      />
      
      {/* Debug information in development */}
      {__DEV__ && (
        <View style={styles.debugInfo}>
          {/* Debug info can be added here if needed */}
        </View>
      )}
    </View>
  );
});

BannerAdComponent.displayName = 'BannerAdComponent';

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    overflow: 'hidden',
  },
  topContainer: {
    paddingTop: Platform.select({
      ios: 0,
      android: 0,
    }),
  },
  bottomContainer: {
    paddingBottom: Platform.select({
      ios: 0,
      android: 0,
    }),
  },
  bannerAd: {
    alignSelf: 'center',
  },
  debugInfo: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
    padding: 2,
    borderRadius: 4,
  },
});

// Export banner size constants for external use
export const BannerSizes = {
  STANDARD: 'standard' as const,
  LARGE: 'large' as const,
  MEDIUM_RECTANGLE: 'medium_rectangle' as const,
  ADAPTIVE: 'adaptive' as const,
};

export default BannerAdComponent; 