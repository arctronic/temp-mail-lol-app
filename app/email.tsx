import * as Clipboard from 'expo-clipboard';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { ThemedText } from '../components/ThemedText';
import { ThemedView } from '../components/ThemedView';
import { IconSymbol } from '../components/ui/IconSymbol';
import { useEmail } from '../contexts/EmailContext';
import { useThemeColor } from '../hooks/useThemeColor';

// Import components from the email directory
import { EmailAttachments } from '../components/email/EmailAttachments';
import { EmailContent } from '../components/email/EmailContent';

export default function EmailDetailScreen() {
  const { id } = useLocalSearchParams();
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({}, 'border');
  const accentColor = useThemeColor({}, 'tint');
  const [showDetails, setShowDetails] = useState(false);
  const { emails, refetch } = useEmail();
  
  // Disable initial render loading state entirely
  const [isInitialRender, setIsInitialRender] = useState(false);
  
  // Find the email by id
  const email = emails.find(e => e.id?.toString() === id?.toString());
  
  // Setup a dummy email to render while waiting for real data
  const dummyEmail = {
    id: id?.toString() || "temp-id",
    date: { $date: new Date().toISOString() },
    sender: "Loading sender...",
    subject: "Loading subject...",
    receiver: "Loading receiver...",
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

  const date = new Date(displayEmail.date.$date);
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
    // Navigate back to the drawer home screen
    router.replace('/(drawer)');
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
                  name={showDetails ? "chevron.up" : "chevron.down"} 
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

      {/* Fixed position back button at the bottom of screen */}
      <View style={[styles.bottomNavContainer, { backgroundColor, borderTopColor: borderColor }]}>
        <Pressable
          style={({ pressed }) => [
            styles.inboxButton,
            { 
              backgroundColor: accentColor,
              opacity: pressed ? 0.8 : 1 
            }
          ]}
          onPress={goBack}
        >
          <IconSymbol name="tray.fill" size={20} color="white" />
          <ThemedText style={styles.inboxButtonText}>Return to Inbox</ThemedText>
        </Pressable>
      </View>
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
    paddingHorizontal: 8,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
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
    paddingTop: 12,
    gap: 16,
    paddingBottom: 100, // Add more padding for the fixed button
  },
  subjectContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  subjectIcon: {
    marginRight: 6,
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
    gap: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
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
  bottomNavContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    borderTopWidth: 1,
    backgroundColor: 'rgba(255,255,255,0.9)',  // Semi-transparent background
    shadowColor: '#000',                        // Add subtle shadow
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,                              // Android shadow
  },
  inboxButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    width: '100%',
    gap: 8,
  },
  inboxButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
}); 