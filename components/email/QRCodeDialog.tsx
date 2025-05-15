import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useEmail } from '@/contexts/EmailContext';
import { useThemeColor } from '@/hooks/useThemeColor';
import * as Sharing from 'expo-sharing';
import React from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import ViewShot from 'react-native-view-shot';

interface QRCodeDialogProps {
  visible: boolean;
  onClose: () => void;
}

export const QRCodeDialog = ({ visible, onClose }: QRCodeDialogProps) => {
  const { generatedEmail } = useEmail();
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({}, 'border');
  const viewShotRef = React.useRef<ViewShot>(null);

  const handleShare = async () => {
    try {
      if (!viewShotRef.current) return;

      const uri = await viewShotRef.current.capture();
      
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri);
      } else {
        throw new Error('Sharing is not available on this device');
      }
    } catch (error) {
      console.error('Error sharing QR code:', error);
      // TODO: Show error alert
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <ThemedView style={styles.modalContainer}>
        <ThemedView style={[styles.dialog, { borderColor }]}>
          <View style={styles.header}>
            <ThemedText style={styles.title}>Share Email Address</ThemedText>
            <Pressable
              style={({ pressed }) => [
                styles.closeButton,
                { opacity: pressed ? 0.7 : 1 }
              ]}
              onPress={onClose}
            >
              <IconSymbol name="xmark" size={24} color={textColor} />
            </Pressable>
          </View>

          <ViewShot
            ref={viewShotRef}
            style={styles.qrContainer}
            options={{ format: 'png', quality: 1 }}
          >
            <ThemedView style={styles.qrWrapper}>
              <QRCode
                value={generatedEmail}
                size={200}
                backgroundColor="white"
                color="black"
              />
              <ThemedText style={styles.emailText}>{generatedEmail}</ThemedText>
            </ThemedView>
          </ViewShot>

          <Pressable
            style={({ pressed }) => [
              styles.shareButton,
              { opacity: pressed ? 0.7 : 1 }
            ]}
            onPress={handleShare}
          >
            <IconSymbol name="square.and.arrow.up" size={20} color={textColor} />
            <ThemedText style={styles.shareButtonText}>Share QR Code</ThemedText>
          </Pressable>
        </ThemedView>
      </ThemedView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 16,
  },
  dialog: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  closeButton: {
    padding: 4,
  },
  qrContainer: {
    padding: 24,
    alignItems: 'center',
  },
  qrWrapper: {
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 8,
    alignItems: 'center',
    gap: 16,
  },
  emailText: {
    fontSize: 14,
    textAlign: 'center',
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    borderTopWidth: 1,
  },
  shareButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
}); 