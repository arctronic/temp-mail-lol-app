import React, {useState} from 'react';
import {View, StyleSheet} from 'react-native';
import {BannerAd, BannerAdSize, AdEventType} from 'react-native-google-mobile-ads';
import {useTheme} from 'react-native-paper';
import AdMobService from '../services/AdMobService';

interface BannerAdComponentProps {
  size?: BannerAdSize;
  style?: any;
  onAdLoaded?: () => void;
  onAdFailedToLoad?: (error: any) => void;
}

const BannerAdComponent: React.FC<BannerAdComponentProps> = ({
  size = BannerAdSize.ADAPTIVE_BANNER,
  style,
  onAdLoaded,
  onAdFailedToLoad,
}) => {
  const theme = useTheme();
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const bannerProps = AdMobService.getBannerAdProps();

  const handleAdLoaded = () => {
    setIsLoaded(true);
    setHasError(false);
    onAdLoaded?.();
  };

  const handleAdFailedToLoad = (error: any) => {
    setIsLoaded(false);
    setHasError(true);
    onAdFailedToLoad?.(error);
  };

  const handleAdOpened = () => {
    // Ad opened - no logging needed
  };

  const handleAdClosed = () => {
    // Ad closed - no logging needed
  };

  // Don't render if there's an error or ad hasn't loaded
  if (hasError || !isLoaded) {
    return null;
  }

  return (
    <View style={[styles.container, style]}>
      <BannerAd
        unitId={bannerProps.unitId}
        size={size}
        requestOptions={bannerProps.requestOptions}
        onAdLoaded={handleAdLoaded}
        onAdFailedToLoad={handleAdFailedToLoad}
        onAdOpened={handleAdOpened}
        onAdClosed={handleAdClosed}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
});

export default BannerAdComponent;

