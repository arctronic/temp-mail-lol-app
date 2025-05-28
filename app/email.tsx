import * as Clipboard from 'expo-clipboard';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { ThemedText } from '../components/ThemedText';
import { ThemedView } from '../components/ThemedView';
import { AppHeader } from '../components/ui/AppHeader';
import { IconSymbol } from '../components/ui/IconSymbol';
import { Email, useEmail } from '../contexts/EmailContext';
import { useLookup } from '../contexts/LookupContext';
import { useThemeColor } from '../hooks/useThemeColor';

// Import components from the email directory
import { EmailAttachments } from '../components/email/EmailAttachments';
import { EmailContent } from '../components/email/EmailContent';

export default function EmailDetailScreen() {
  const params = useLocalSearchParams();
  const { id, fromLookup, autoMarkRead } = params;
  const isFromLookup = fromLookup === 'true';
  const shouldAutoMarkRead = autoMarkRead === 'true';
  
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({}, 'border');
  const accentColor = useThemeColor({}, 'tint');
  const [showDetails, setShowDetails] = useState(false);
  
  const { emails, refetch } = useEmail();
  const { lookupEmails, markEmailAsRead } = useLookup();
  
  // Find the email either in regular emails or lookup emails
  let email: Email | undefined;
  
  if (isFromLookup) {
    // Look through all lookup emails for this message
    for (const lookupEmail of lookupEmails) {
      const found = lookupEmail.messages.find(
        m => m.id?.toString() === id?.toString()
      );
      if (found) {
        email = found;
        break;
      }
    }
  } else {
    // Find in regular emails
    email = emails.find(e => e.id?.toString() === id?.toString());
  }
  
  // Setup a dummy email to render while waiting for real data
  const dummyEmail = {
    id: id?.toString() || "temp-id",
    date: { $date: new Date().toISOString() },
    sender: params.from?.toString() || "Loading sender...",
    subject: params.subject?.toString() || "Loading subject...",
    receiver: params.to?.toString() || "Loading receiver...",
    message: "Loading message content...",
    attachments: [],
    created_at: { $date: new Date().toISOString() },
    updated_at: { $date: new Date().toISOString() }
  };

  // Use real email if available, otherwise use dummy
  const displayEmail = email || dummyEmail;
  
  // Auto-mark as read if opened from notification
  useEffect(() => {
    if (shouldAutoMarkRead && isFromLookup && email && params.to) {
      markEmailAsRead(params.to.toString(), email.id);
    }
  }, [shouldAutoMarkRead, isFromLookup, email?.id, params.to, markEmailAsRead]);
  
  const date = new Date(params.date?.toString() || displayEmail.date.$date);
  const formattedDate = date.toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  // Get sender name without email address
  const senderName = displayEmail.sender.replace(/<.*>/, '').trim();
  const senderInitial = senderName.charAt(0).toUpperCase();
  
  // Extract email address from sender
  const emailRegex = /<([^>]+)>/;
  const match = displayEmail.sender.match(emailRegex);
  const senderEmail = match ? match[1] : displayEmail.sender;

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
            goBack();
          }
        }
      ]
    );
  };

  const handleShare = async () => {
    try {
      await Clipboard.setStringAsync(`
From: ${displayEmail.sender}
Subject: ${displayEmail.subject}
Date: ${formattedDate}

${displayEmail.message}
      `);
      Alert.alert('Copied to clipboard', 'Email content copied to clipboard');
    } catch (error) {
      Alert.alert('Error', 'Failed to copy email content');
    }
  };

  const goBack = () => {
    // Navigate back based on where the user came from
    if (isFromLookup) {
      router.push('/lookup' as any);
    } else {
      router.replace('/(drawer)');
    }
  };

  return (
    <ThemedView style={styles.container}>
      <AppHeader 
        title={displayEmail.subject || '(No subject)'} 
        showBackButton={true}
        rightAction={{
          icon: "square.and.arrow.up",
          onPress: handleShare
        }}
      />

      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
      >
        <View style={styles.subjectContainer}>
          <IconSymbol name="envelope" size={18} color={textColor} style={styles.subjectIcon} />
          <ThemedText style={styles.subject}>
            {displayEmail.subject || '(No subject)'}
          </ThemedText>
        </View>

        <View style={styles.senderContainer}>
          <View style={[styles.avatar, { backgroundColor: accentColor }]}>
            <ThemedText style={styles.avatarText}>{senderInitial}</ThemedText>
          </View>
          
          <View style={styles.senderInfo}>
            <View style={styles.senderNameRow}>
              <ThemedText style={styles.senderName}>{senderName}</ThemedText>
              <Pressable
                style={({ pressed }) => [
                  styles.actionButton,
                  { opacity: pressed ? 0.7 : 1 }
                ]}
                onPress={handleDelete}
              >
                <IconSymbol name="trash" size={18} color={textColor} />
              </Pressable>
            </View>
            <ThemedText style={styles.senderEmail} numberOfLines={1}>{senderEmail}</ThemedText>
            <ThemedText style={styles.date}>{formattedDate}</ThemedText>
          </View>
        </View>
        
        {/* Details button */}
        <Pressable
          style={({ pressed }) => [
            styles.detailsButton,
            { 
              borderColor,
              opacity: pressed ? 0.7 : 1,
              backgroundColor: pressed ? `${accentColor}10` : 'transparent',
            }
          ]}
          onPress={() => setShowDetails(!showDetails)}
        >
          <ThemedText style={styles.detailsText}>
            {showDetails ? 'Hide Details' : 'Show Details'}
          </ThemedText>
          <IconSymbol 
            name={showDetails ? 'chevron.up' : 'chevron.down'} 
            size={16} 
            color={textColor} 
          />
        </Pressable>
        
        {/* Additional details when expanded */}
        {showDetails && (
          <View style={[styles.details, { borderColor }]}>
            <View style={styles.detailRow}>
              <ThemedText style={styles.detailLabel}>From:</ThemedText>
              <ThemedText style={styles.detailValue} numberOfLines={1}>{displayEmail.sender}</ThemedText>
            </View>
            <View style={styles.detailRow}>
              <ThemedText style={styles.detailLabel}>To:</ThemedText>
              <ThemedText style={styles.detailValue} numberOfLines={1}>{displayEmail.receiver}</ThemedText>
            </View>
            <View style={styles.detailRow}>
              <ThemedText style={styles.detailLabel}>Date:</ThemedText>
              <ThemedText style={styles.detailValue}>{formattedDate}</ThemedText>
            </View>
          </View>
        )}
        
        {/* Email content */}
        <EmailContent htmlContent={displayEmail.message} />
        
        {/* Email attachments */}
        {displayEmail.attachments && displayEmail.attachments.length > 0 && (
          <EmailAttachments attachments={displayEmail.attachments} />
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 60,
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 60,
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 8,
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
  },
  toolbarActions: {
    flexDirection: 'row',
    gap: 12,
  },
  toolbarButton: {
    padding: 8,
    borderRadius: 8,
  },
  subjectContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  subjectIcon: {
    marginRight: 10,
  },
  subject: {
    fontSize: 22,
    fontWeight: 'bold',
    flex: 1,
  },
  senderContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 18,
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
  senderEmail: {
    fontSize: 14,
    opacity: 0.7,
    marginTop: 2,
  },
  date: {
    fontSize: 12,
    opacity: 0.5,
    marginTop: 4,
  },
  actionButton: {
    padding: 6,
    borderRadius: 20,
  },
  detailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 16,
  },
  detailsText: {
    fontSize: 14,
    fontWeight: '500',
  },
  details: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  detailLabel: {
    width: 50,
    fontSize: 14,
    fontWeight: '500',
  },
  detailValue: {
    flex: 1,
    fontSize: 14,
  },
}); 