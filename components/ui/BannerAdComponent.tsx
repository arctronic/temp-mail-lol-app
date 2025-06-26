import Constants from 'expo-constants';
import { StyleSheet } from 'react-native';
import { useAds } from '../../contexts/AdContext';

// Check if we're running in Expo Go
const isExpoGo = Constants.appOwnership === 'expo';

interface BannerAdComponentProps {
  size?: string;
  style?: any;
}

export function BannerAdComponent({ 
  size = 'ANCHORED_ADAPTIVE_BANNER', 
  style 
}: BannerAdComponentProps) {
  const { isInitialized, hasConsent, isAdFree } = useAds();

  // Don't show ads in Expo Go, if not initialized, ad-free mode, or no consent
  if (isExpoGo || !isInitialized || isAdFree) {
    return null;
  }

  // For now, just return null until we have a development build
  // This prevents the RNGoogleMobileAdsModule error in Expo Go
  console.log('⚠️ Banner ads require a development build (not Expo Go)');
  return null;
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
});

export default BannerAdComponent; 