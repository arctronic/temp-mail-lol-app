import Constants from 'expo-constants';
import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { getAdUnitIds } from '../../constants/AdMobConfig';
import { useAds } from '../../contexts/AdContext';

// Conditional import to prevent errors in Expo Go
let BannerAd: any = null;
let TestIds: any = null;

// Check if we're running in Expo Go
const isExpoGo = Constants.appOwnership === 'expo';

if (!isExpoGo) {
  try {
    const googleMobileAds = require('react-native-google-mobile-ads');
    BannerAd = googleMobileAds.BannerAd;
    TestIds = googleMobileAds.TestIds;
  } catch (error) {
    console.log('⚠️ Google Mobile Ads not available in current environment');
  }
}

interface BannerAdComponentProps {
  size?: string;
  style?: any;
}

export function BannerAdComponent({ 
  size = 'ANCHORED_ADAPTIVE_BANNER', 
  style 
}: BannerAdComponentProps) {
  const { isInitialized, hasConsent, isAdFree } = useAds();
  const [adUnitId, setAdUnitId] = useState<string | null>(null);

  useEffect(() => {
    if (!isExpoGo && BannerAd) {
      const adUnitIds = getAdUnitIds();
      const bannerAdUnitId = __DEV__ ? TestIds.BANNER : adUnitIds.banner;
      setAdUnitId(bannerAdUnitId);
    }
  }, []);

  // Don't show ads in Expo Go, if not initialized, ad-free mode, or no consent
  if (isExpoGo || !isInitialized || isAdFree || !adUnitId || !BannerAd) {
    return null;
  }

  return (
    <View style={[styles.container, style]}>
      <BannerAd
        unitId={adUnitId}
        size={size}
        requestOptions={{
          requestNonPersonalizedAdsOnly: !hasConsent,
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
});

export default BannerAdComponent; 