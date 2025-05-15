import * as Clipboard from 'expo-clipboard';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { ThemedText } from '../components/ThemedText';
import { ThemedView } from '../components/ThemedView';
import { IconSymbol } from '../components/ui/IconSymbol';
import { Email, useEmail } from '../contexts/EmailContext';
import { useLookup } from '../contexts/LookupContext';
import { useThemeColor } from '../hooks/useThemeColor';

// Import components from the email directory
import { EmailAttachments } from '../components/email/EmailAttachments';
import { EmailContent } from '../components/email/EmailContent';

export default function EmailDetailScreen() {
  const params = useLocalSearchParams();
  const { id, fromLookup } = params;
  const isFromLookup = fromLookup === 'true';
  
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({}, 'border');
  const accentColor = useThemeColor({}, 'tint');
  const [showDetails, setShowDetails] = useState(false);
  
  const { emails, refetch } = useEmail();
  const { lookupEmails } = useLookup();
  
  // Disable initial render loading state entirely
  const [isInitialRender, setIsInitialRender] = useState(false);
  
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
  
  // Hide header for this screen
  useEffect(() => {
    // This is just a placeholder for any navigation config
    return () => {};
  }, []);

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
      <View style={[styles.toolbar, { borderBottomColor: borderColor }]}>
        <Pressable
          style={({ pressed }) => [
            styles.backButton,
            { 
              opacity: pressed ? 0.7 : 1,
              backgroundColor: pressed ? `${accentColor}20` : 'transparent'
            }
          ]}
          onPress={goBack}
        >
          <IconSymbol name="chevron.left" size={28} color={accentColor} />
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
              <ThemedText style={styles.detailValue}>{displayEmail.receiver}</ThemedText>
            </View>
            <View style={styles.detailRow}>
              <ThemedText style={styles.detailLabel}>Date:</ThemedText>
              <ThemedText style={styles.detailValue}>{formattedDate}</ThemedText>
            </View>
          </ThemedView>
        )}

        <View style={styles.messageContainer}>
          {displayEmail.attachments && displayEmail.attachments.length > 0 && (
            <EmailAttachments attachments={displayEmail.attachments} />
          )}
          <EmailContent message={displayEmail.message} />
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 10,
    borderRadius: 8,
  },
  toolbarButton: {
    padding: 10,
    marginLeft: 4,
  },
  toolbarActions: {
    flexDirection: 'row',
    gap: 8,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingTop: 16,
    gap: 20,
    paddingBottom: 30,
  },
  subjectContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  subjectIcon: {
    marginRight: 10,
    opacity: 0.7,
  },
  subject: {
    fontSize: 22,
    fontWeight: '600',
    flex: 1,
  },
  senderContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
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
  dateText: {
    fontSize: 14,
    opacity: 0.7,
  },
  emailDetailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  recipientText: {
    fontSize: 14,
    opacity: 0.7,
  },
  detailsButton: {
    padding: 6,
    marginLeft: 6,
  },
  detailsContainer: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 16,
    marginTop: 12,
    gap: 10,
  },
  detailRow: {
    flexDirection: 'row',
    gap: 12,
  },
  detailLabel: {
    fontSize: 14,
    opacity: 0.7,
    width: 54,
  },
  detailValue: {
    fontSize: 14,
    flex: 1,
  },
  messageContainer: {
    gap: 20,
  },
}); 