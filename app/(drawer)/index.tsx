import { EmailGenerator } from '@/components/email/EmailGenerator';
import { EmailList } from '@/components/email/EmailList';
import { QRCodeDialog } from '@/components/email/QRCodeDialog';
import { useEmail } from '@/contexts/EmailContext';
import { useThemeColor } from '@/hooks/useThemeColor';
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const backgroundColor = useThemeColor({}, 'background');
  const { generatedEmail } = useEmail();
  const [qrVisible, setQRVisible] = useState(false);
  const insets = useSafeAreaInsets();

  return (
    <View 
      style={[
        styles.container, 
        { 
          backgroundColor,
          paddingBottom: Math.max(insets.bottom, 10) 
        }
      ]}
    >
      <EmailGenerator onOpenQRModal={() => setQRVisible(true)} />
      <View style={styles.emailListContainer}>
        <EmailList />
      </View>
      <QRCodeDialog visible={qrVisible} onClose={() => setQRVisible(false)} />
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
    marginTop: 12,
  }
}); 