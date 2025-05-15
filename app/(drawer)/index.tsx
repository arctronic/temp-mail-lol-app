import { EmailGenerator } from '@/components/email/EmailGenerator';
import { EmailList } from '@/components/email/EmailList';
import { QRCodeDialog } from '@/components/email/QRCodeDialog';
import { useEmail } from '@/contexts/EmailContext';
import { useThemeColor } from '@/hooks/useThemeColor';
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';

export default function HomeScreen() {
  const backgroundColor = useThemeColor({}, 'background');
  const { generatedEmail } = useEmail();
  const [qrVisible, setQRVisible] = useState(false);

  return (
    <View style={[styles.container, { backgroundColor }]}>
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
  }
}); 