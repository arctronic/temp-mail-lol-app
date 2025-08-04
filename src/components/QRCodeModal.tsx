import React from 'react';
import {View, StyleSheet, Dimensions} from 'react-native';
import {
  Modal,
  Portal,
  Text,
  Button,
  Card,
  useTheme,
} from 'react-native-paper';
import QRCode from 'react-native-qrcode-svg';
import CopyButton from './CopyButton';

interface QRCodeModalProps {
  visible: boolean;
  onDismiss: () => void;
  email: string;
  title?: string;
}

const QRCodeModal: React.FC<QRCodeModalProps> = ({
  visible,
  onDismiss,
  email,
  title = 'Share Email Address',
}) => {
  const theme = useTheme();
  const screenWidth = Dimensions.get('window').width;
  const qrSize = Math.min(screenWidth * 0.6, 250);

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={[
          styles.modalContainer,
          {backgroundColor: theme.colors.surface},
        ]}>
        <Card style={styles.card}>
          <Card.Content style={styles.cardContent}>
            <Text
              variant="headlineSmall"
              style={[styles.title, {color: theme.colors.onSurface}]}>
              {title}
            </Text>
            
            <View style={styles.qrContainer}>
              <QRCode
                value={email}
                size={qrSize}
                color={theme.colors.onSurface}
                backgroundColor={theme.colors.surface}
                logo={require('../assets/logo.png')} // You would add your logo here
                logoSize={qrSize * 0.2}
                logoBackgroundColor={theme.colors.surface}
                logoMargin={2}
                logoBorderRadius={8}
              />
            </View>
            
            <View style={styles.emailContainer}>
              <Text
                variant="bodyLarge"
                style={[styles.emailText, {color: theme.colors.onSurface}]}>
                {email}
              </Text>
              <CopyButton
                text={email}
                successMessage="Email address copied!"
                size={20}
              />
            </View>
            
            <Text
              variant="bodyMedium"
              style={[styles.description, {color: theme.colors.onSurfaceVariant}]}>
              Scan this QR code to quickly share your temporary email address
            </Text>
            
            <View style={styles.buttonContainer}>
              <Button
                mode="contained"
                onPress={onDismiss}
                style={styles.button}>
                Close
              </Button>
            </View>
          </Card.Content>
        </Card>
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    margin: 20,
    borderRadius: 12,
  },
  card: {
    elevation: 8,
  },
  cardContent: {
    padding: 24,
    alignItems: 'center',
  },
  title: {
    textAlign: 'center',
    marginBottom: 24,
    fontWeight: '600',
  },
  qrContainer: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    elevation: 2,
  },
  emailContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  emailText: {
    flex: 1,
    textAlign: 'center',
    fontWeight: '500',
  },
  description: {
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  buttonContainer: {
    width: '100%',
  },
  button: {
    paddingVertical: 4,
  },
});

export default QRCodeModal;

