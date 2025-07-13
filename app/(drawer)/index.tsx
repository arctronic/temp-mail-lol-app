import { EmailGenerator } from '@/components/email/EmailGenerator';
import { EmailList } from '@/components/email/EmailList';
import { BannerAdComponent } from '@/components/ui/BannerAdComponent';
import { useEmail } from '@/contexts/EmailContext';
import { useThemeColor } from '@/hooks/useThemeColor';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const backgroundColor = useThemeColor({}, 'background');
  const { generatedEmail } = useEmail();
  const insets = useSafeAreaInsets();

  return (
    <View 
      style={[
        styles.container, 
        { 
          backgroundColor,
          paddingTop: 20, // Add proper top spacing after header
          paddingBottom: Math.max(insets.bottom, 10) 
        }
      ]}
    >
      <EmailGenerator />
      <View style={styles.emailListContainer}>
        <EmailList />
      </View>
      
      {/* Banner Ad at bottom */}
      <BannerAdComponent 
        position="bottom"
        size="adaptive"
        style={styles.bannerContainer}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  emailListContainer: {
    flex: 1,
    marginTop: 4,
  },
  bannerContainer: {
    marginVertical: 8,
  }
}); 