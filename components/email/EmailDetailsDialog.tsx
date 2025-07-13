import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Email, useEmail } from '@/contexts/EmailContext';
import { useThemeColor } from '@/hooks/useThemeColor';
import * as Clipboard from 'expo-clipboard';
import React, { useEffect, useState } from 'react';
import { Alert, Image, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { EmailAttachments } from './EmailAttachments';
import { EmailContent } from './EmailContent';

// Helper function to get favicon URL (same as EmailList)
const getFaviconUrl = (domain: string) => {
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
};

interface EmailDetailsDialogProps {
  email: Email | null;
  onClose: () => void;
}

export const EmailDetailsDialog = ({ email, onClose }: EmailDetailsDialogProps) => {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({}, 'border');
  const accentColor = useThemeColor({}, 'tint');
  const [showDetails, setShowDetails] = useState(false);
  const [faviconError, setFaviconError] = useState(false);
  const { refetch } = useEmail();

  // Helper functions (same as EmailList)
  const getSenderName = (sender: string) => {
    if (!sender) return '';
    // Extract name from "Name <email>" format or just return email
    const match = sender.match(/^(.*?)\s*<.*>$/);
    if (match && match[1].trim()) {
      return match[1].trim();
    }
    return sender.split('@')[0];
  };

  const getSenderEmail = (sender: string) => {
    if (!sender) return '';
    const match = sender.match(/<(.+)>/);
    return match ? match[1] : sender;
  };

  const getSenderDomain = (sender: string) => {
    const emailAddress = getSenderEmail(sender);
    const domain = emailAddress.split('@')[1];
    if (!domain) return '';
    
    // Extract main domain by taking the last two parts (domain.tld)
    // This handles cases like mail.facebook.com -> facebook.com
    const domainParts = domain.split('.');
    if (domainParts.length >= 2) {
      // Take the last two parts (e.g., facebook.com from mail.facebook.com)
      return domainParts.slice(-2).join('.');
    }
    return domain;
  };

  // Reset favicon error when email changes
  useEffect(() => {
    setFaviconError(false);
  }, [email?.sender]);

  if (!email) return null;

  const date = new Date(email.date.$date);
  const formattedDate = date.toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const senderName = getSenderName(email.sender);
  const senderInitial = senderName.charAt(0).toUpperCase();
  const senderEmail = getSenderEmail(email.sender);

  const handleReply = () => {
    Alert.alert(
      'Reply Feature',
      'Reply functionality is not implemented in this demo.',
      [{ text: 'OK' }]
    );
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Email',
      'Are you sure you want to delete this email?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            Alert.alert('Email deleted', 'The email has been deleted.');
            onClose();
          }
        }
      ]
    );
  };

  const handleShare = async () => {
    try {
      await Clipboard.setStringAsync(`
From: ${email.sender}
Subject: ${email.subject}
Date: ${formattedDate}

${email.message}
      `);
      Alert.alert('Copied to clipboard', 'Email content copied to clipboard');
    } catch (error) {
      Alert.alert('Error', 'Failed to copy email content');
    }
  };

  return (
    <Modal
      visible={!!email}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <ThemedView style={styles.container}>
        <View style={[styles.toolbar, { borderBottomColor: borderColor }]}>
          <Pressable
            style={({ pressed }) => [
              styles.toolbarButton,
              { opacity: pressed ? 0.7 : 1 }
            ]}
            onPress={onClose}
          >
            <IconSymbol name="chevron.left" size={24} color={textColor} />
          </Pressable>
          
          <View style={styles.toolbarActions}>
            <Pressable
              style={({ pressed }) => [
                styles.toolbarButton,
                { opacity: pressed ? 0.7 : 1 }
              ]}
              onPress={refetch}
            >
              <IconSymbol name="arrow.clockwise" size={20} color={textColor} />
            </Pressable>
            <Pressable
              style={({ pressed }) => [
                styles.toolbarButton,
                { opacity: pressed ? 0.7 : 1 }
              ]}
              onPress={handleDelete}
            >
              <IconSymbol name="trash" size={20} color={textColor} />
            </Pressable>
            <Pressable
              style={({ pressed }) => [
                styles.toolbarButton,
                { opacity: pressed ? 0.7 : 1 }
              ]}
              onPress={handleShare}
            >
              <IconSymbol name="square.and.arrow.up" size={20} color={textColor} />
            </Pressable>
          </View>
        </View>

        <ScrollView 
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
        >
          <ThemedText style={styles.subject}>
            {email.subject || '(No subject)'}
          </ThemedText>

          <View style={styles.senderContainer}>
            <View style={[
              styles.avatar, 
              { backgroundColor: faviconError ? accentColor : 'transparent' }
            ]}>
              {!faviconError ? (
                <Image
                  source={{ uri: getFaviconUrl(getSenderDomain(email.sender)) }}
                  style={styles.faviconImage}
                  onError={() => setFaviconError(true)}
                  onLoad={() => setFaviconError(false)}
                />
              ) : (
                <Text style={[styles.avatarText, { color: '#fff' }]}>
                  {senderInitial}
                </Text>
              )}
            </View>
            
            <View style={styles.senderInfo}>
              <View style={styles.senderNameRow}>
                <ThemedText style={styles.senderName}>{senderName}</ThemedText>
                <ThemedText style={styles.dateText}>{date.toLocaleDateString()}</ThemedText>
              </View>
              
              <View style={styles.emailDetailsRow}>
                <ThemedText style={styles.recipientText}>
                  to me
                </ThemedText>
                <Pressable
                  style={({ pressed }) => [
                    styles.detailsButton,
                    { opacity: pressed ? 0.7 : 1 }
                  ]}
                  onPress={() => setShowDetails(!showDetails)}
                >
                  <IconSymbol 
                    name={showDetails ? "arrow.up" : "arrow.down"} 
                    size={16} 
                    color={textColor} 
                  />
                </Pressable>
              </View>
            </View>
          </View>

          {showDetails && (
            <ThemedView style={[styles.detailsContainer, { borderColor }]}>
              <View style={styles.detailRow}>
                <ThemedText style={styles.detailLabel}>From:</ThemedText>
                <ThemedText style={styles.detailValue}>{senderEmail}</ThemedText>
              </View>
              <View style={styles.detailRow}>
                <ThemedText style={styles.detailLabel}>To:</ThemedText>
                <ThemedText style={styles.detailValue}>{email.receiver}</ThemedText>
              </View>
              <View style={styles.detailRow}>
                <ThemedText style={styles.detailLabel}>Date:</ThemedText>
                <ThemedText style={styles.detailValue}>{formattedDate}</ThemedText>
              </View>
            </ThemedView>
          )}

          <View style={styles.messageContainer}>
            {email.attachments && email.attachments.length > 0 && (
              <EmailAttachments attachments={email.attachments} />
            )}
            <EmailContent 
              htmlContent={email.message}
              allowExternalImages={false}
            />
          </View>
          
          <View style={styles.actionBar}>
            <Pressable
              style={({ pressed }) => [
                styles.actionButton,
                { 
                  backgroundColor: accentColor,
                  opacity: pressed ? 0.8 : 1 
                }
              ]}
              onPress={handleReply}
            >
              <IconSymbol name="arrowshape.turn.up.left.fill" size={16} color="white" />
              <ThemedText style={styles.actionButtonText}>Reply</ThemedText>
            </Pressable>
          </View>
        </ScrollView>
      </ThemedView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  toolbarButton: {
    padding: 8,
  },
  toolbarActions: {
    flexDirection: 'row',
    gap: 4,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    gap: 16,
  },
  subject: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 8,
  },
  senderContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '600',
    color: 'white',
  },
  senderInfo: {
    flex: 1,
  },
  senderNameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  senderName: {
    fontSize: 16,
    fontWeight: '600',
  },
  dateText: {
    fontSize: 14,
    opacity: 0.7,
  },
  emailDetailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  recipientText: {
    fontSize: 14,
    opacity: 0.7,
  },
  detailsButton: {
    padding: 4,
    marginLeft: 4,
  },
  detailsContainer: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    gap: 8,
  },
  detailLabel: {
    fontSize: 14,
    opacity: 0.7,
    width: 48,
  },
  detailValue: {
    fontSize: 14,
    flex: 1,
  },
  messageContainer: {
    gap: 16,
  },
  actionBar: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 8,
  },
  actionButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  faviconImage: {
    width: '100%',
    height: '100%',
    borderRadius: 24,
  },
}); 