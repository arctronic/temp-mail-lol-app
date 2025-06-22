import * as Haptics from 'expo-haptics';
import React, { useState } from 'react';
import { Alert, Modal, Pressable, StyleSheet, TextInput } from 'react-native';
import { useThemeColor } from '../../hooks/useThemeColor';
import { ThemedText } from '../ThemedText';
import { ThemedView } from '../ThemedView';
import { IconSymbol } from './IconSymbol';

interface AddInboxModalProps {
  visible: boolean;
  onClose: () => void;
  onAddInbox: (email: string) => Promise<void>;
  canAddInbox: boolean;
  maxInboxes: number;
}

export function AddInboxModal({
  visible,
  onClose,
  onAddInbox,
  canAddInbox,
  maxInboxes,
}: AddInboxModalProps) {
  const [customEmail, setCustomEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');
  const borderColor = useThemeColor({}, 'border');
  const cardColor = useThemeColor({}, 'card');

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleAddCustomEmail = async () => {
    if (!canAddInbox) {
      Alert.alert(
        'Inbox Limit Reached',
        `You can monitor up to ${maxInboxes} inboxes. Remove one to add another.`,
        [{ text: 'OK' }]
      );
      return;
    }

    if (!customEmail.trim()) {
      Alert.alert('Invalid Email', 'Please enter an email address.');
      return;
    }

    if (!validateEmail(customEmail.trim())) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }

    try {
      setIsLoading(true);
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      await onAddInbox(customEmail.trim());
      setCustomEmail('');
      onClose();
    } catch (error) {
      console.error('Failed to add custom email:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateAndAdd = async () => {
    if (!canAddInbox) {
      Alert.alert(
        'Inbox Limit Reached',
        `You can monitor up to ${maxInboxes} inboxes. Remove one to add another.`,
        [{ text: 'OK' }]
      );
      return;
    }

    try {
      setIsLoading(true);
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      
      // Generate a new random email
      const randomId = Math.random().toString(36).substring(2, 10);
      const domains = ['1secmail.com', '1secmail.org', '1secmail.net'];
      const randomDomain = domains[Math.floor(Math.random() * domains.length)];
      const generatedEmail = `temp${randomId}@${randomDomain}`;
      
      await onAddInbox(generatedEmail);
      onClose();
    } catch (error) {
      console.error('Failed to generate and add email:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setCustomEmail('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <ThemedView style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={handleClose} />
        
        <ThemedView style={[styles.modal, { backgroundColor: cardColor, borderColor }]}>
          <ThemedView style={styles.header}>
            <ThemedText style={styles.title}>Add New Inbox</ThemedText>
            <Pressable
              style={({ pressed }) => [
                styles.closeButton,
                { opacity: pressed ? 0.7 : 1 }
              ]}
              onPress={handleClose}
            >
              <IconSymbol name="xmark" size={20} color={textColor} />
            </Pressable>
          </ThemedView>

          <ThemedView style={styles.content}>
            <ThemedText style={[styles.subtitle, { color: textColor }]}>
              Generate a new temporary email or add your own:
            </ThemedText>

            {/* Generate New Email Button */}
            <Pressable
              style={({ pressed }) => [
                styles.generateButton,
                {
                  backgroundColor: pressed ? `${tintColor}90` : tintColor,
                  opacity: (!canAddInbox || isLoading) ? 0.5 : 1,
                },
              ]}
              onPress={handleGenerateAndAdd}
              disabled={!canAddInbox || isLoading}
            >
              <IconSymbol name="wand.and.stars" size={20} color="#ffffff" />
              <ThemedText style={styles.generateButtonText}>
                Generate New Email
              </ThemedText>
            </Pressable>

            <ThemedView style={styles.divider}>
              <ThemedView style={[styles.dividerLine, { backgroundColor: borderColor }]} />
              <ThemedText style={[styles.dividerText, { color: textColor }]}>OR</ThemedText>
              <ThemedView style={[styles.dividerLine, { backgroundColor: borderColor }]} />
            </ThemedView>

            {/* Custom Email Input */}
            <ThemedView style={styles.inputContainer}>
              <ThemedText style={[styles.inputLabel, { color: textColor }]}>
                Custom Email Address:
              </ThemedText>
              <TextInput
                style={[
                  styles.textInput,
                  {
                    borderColor,
                    color: textColor,
                    backgroundColor: backgroundColor,
                  },
                ]}
                value={customEmail}
                onChangeText={setCustomEmail}
                placeholder="Enter email address"
                placeholderTextColor={`${textColor}60`}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isLoading}
              />
            </ThemedView>

            <Pressable
              style={({ pressed }) => [
                styles.addButton,
                {
                  backgroundColor: pressed ? `${tintColor}90` : tintColor,
                  opacity: (!canAddInbox || isLoading || !customEmail.trim()) ? 0.5 : 1,
                },
              ]}
              onPress={handleAddCustomEmail}
              disabled={!canAddInbox || isLoading || !customEmail.trim()}
            >
              <IconSymbol name="plus" size={16} color="#ffffff" />
              <ThemedText style={styles.addButtonText}>
                Add Email to Monitoring
              </ThemedText>
            </Pressable>

            {!canAddInbox && (
              <ThemedView style={[styles.warningContainer, { backgroundColor: `${borderColor}20` }]}>
                <IconSymbol name="exclamationmark.triangle" size={16} color={borderColor} />
                <ThemedText style={[styles.warningText, { color: borderColor }]}>
                  Inbox limit reached ({maxInboxes} max). Remove an inbox to add a new one.
                </ThemedText>
              </ThemedView>
            )}
          </ThemedView>
        </ThemedView>
      </ThemedView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modal: {
    width: '90%',
    maxWidth: 400,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    padding: 20,
    paddingTop: 8,
    gap: 16,
  },
  subtitle: {
    fontSize: 14,
    opacity: 0.8,
    textAlign: 'center',
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  generateButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    fontSize: 12,
    opacity: 0.6,
  },
  inputContainer: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  warningText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 16,
  },
}); 