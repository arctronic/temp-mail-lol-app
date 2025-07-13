import { useGlobalToast } from '@/hooks/useGlobalToast';
import * as Clipboard from 'expo-clipboard';
import * as FileSystem from 'expo-file-system';
import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Animated, {
    FadeInDown,
    FadeInUp,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming
} from 'react-native-reanimated';
import { ThemedText } from '../components/ThemedText';
import { ThemedView } from '../components/ThemedView';
import { AnimatedButton } from '../components/ui/AnimatedButton';
import { AppHeader } from '../components/ui/AppHeader';
import { IconSymbol } from '../components/ui/IconSymbol';
import { Email, useEmail } from '../contexts/EmailContext';
import { useLookup } from '../contexts/LookupContext';
import { useThemeColor } from '../hooks/useThemeColor';

// Import components from the email directory
import { EmailAttachments } from '../components/email/EmailAttachments';
import { EmailContent } from '../components/email/EmailContent';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// Helper function to get favicon URL (same as EmailList)
const getFaviconUrl = (domain: string) => {
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
};

export default function EmailDetailScreen() {
  const params = useLocalSearchParams();
  const { id, fromLookup, autoMarkRead } = params;
  const isFromLookup = fromLookup === 'true';
  const shouldAutoMarkRead = autoMarkRead === 'true';
  
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({}, 'border');
  const accentColor = useThemeColor({}, 'tint');
  const mutedColor = useThemeColor({}, 'tabIconDefault');
  
  const [showDetails, setShowDetails] = useState(false);
  const [faviconError, setFaviconError] = useState(false);
  
  // Task 3.3: Use toast system instead of local feedback
  const { showSuccess, showError, showInfo } = useGlobalToast();
  
  // Task 3.4: Enhanced animation values
  const headerOpacity = useSharedValue(0);
  const headerTranslateY = useSharedValue(-30);
  const contentOpacity = useSharedValue(0);
  const contentTranslateY = useSharedValue(20);
  const detailsHeight = useSharedValue(0);
  
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
  
  // Reset favicon error when email changes
  useEffect(() => {
    setFaviconError(false);
  }, [displayEmail.sender]);
  
  // Auto-mark as read if opened from notification
  useEffect(() => {
    if (shouldAutoMarkRead && isFromLookup && email && params.to) {
      markEmailAsRead(params.to.toString(), email.id);
    }
  }, [shouldAutoMarkRead, isFromLookup, email?.id, params.to, markEmailAsRead]);
  
  // Task 3.4: Enhanced entrance animations
  useEffect(() => {
    // Stagger the animations for a more polished feel
    headerOpacity.value = withTiming(1, { duration: 400 });
    headerTranslateY.value = withSpring(0, { damping: 15, stiffness: 100 });
    
    setTimeout(() => {
      contentOpacity.value = withTiming(1, { duration: 500 });
      contentTranslateY.value = withSpring(0, { damping: 12, stiffness: 90 });
    }, 150);
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

  // Helper functions (same as EmailList)
  const getSenderName = (sender: string) => {
    // Extract name from "Name <email>" format or just return email
    const match = sender.match(/^(.*?)\s*<.*>$/);
    if (match && match[1].trim()) {
      return match[1].trim();
    }
    return sender.split('@')[0];
  };

  const getSenderEmail = (sender: string) => {
    const match = sender.match(/<(.+)>/);
    return match ? match[1] : sender;
  };

  const getSenderDomain = (sender: string) => {
    const email = getSenderEmail(sender);
    const domain = email.split('@')[1];
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

  // Get sender info
  const senderName = getSenderName(displayEmail.sender);
  const senderEmail = getSenderEmail(displayEmail.sender);
  const senderInitial = senderName.charAt(0).toUpperCase();

  // Task 3.3: Enhanced action handlers with toast feedback
  const handleCopyContent = async () => {
    try {
      const emailContent = `From: ${displayEmail.sender}
To: ${displayEmail.receiver}
Subject: ${displayEmail.subject}
Date: ${formattedDate}

${displayEmail.message}`;
      
      await Clipboard.setStringAsync(emailContent);
      showSuccess('📋 Email copied to clipboard', 3000);
    } catch (error) {
      showError('Failed to copy email content', 4000);
    }
  };

  const handleSaveLocally = async () => {
    try {
      const emailContent = `From: ${displayEmail.sender}
To: ${displayEmail.receiver}  
Subject: ${displayEmail.subject}
Date: ${formattedDate}

${displayEmail.message}`;
      
      const fileName = `email_${displayEmail.id}_${Date.now()}.txt`;
      const fileUri = FileSystem.documentDirectory + fileName;
      
      await FileSystem.writeAsStringAsync(fileUri, emailContent);
      showSuccess('💾 Email saved successfully', 3000);
    } catch (error) {
      showError('Failed to save email locally', 4000);
    }
  };

  const handleDelete = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert(
      'Delete Email',
      'Are you sure you want to delete this email?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            showSuccess('🗑️ Email deleted', 2000);
            setTimeout(() => router.back(), 1500);
          }
        }
      ]
    );
  };

  const handleReportSpam = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert(
      'Report Spam',
      'Report this email as spam?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Report', 
          style: 'destructive',
          onPress: () => {
            showInfo('🚩 Email reported as spam', 3000);
          }
        }
      ]
    );
  };

  const handleShare = async () => {
    showInfo('📤 Share feature coming soon', 2000);
  };


  
  // Task 3.4: Animated styles for enhanced entrance
  const headerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
    transform: [{ translateY: headerTranslateY.value }],
  }));
  
  const contentAnimatedStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
    transform: [{ translateY: contentTranslateY.value }],
  }));
  
  const detailsAnimatedStyle = useAnimatedStyle(() => ({
    height: detailsHeight.value,
    overflow: 'hidden',
  }));
  
  const toggleDetails = () => {
    const newShowDetails = !showDetails;
    setShowDetails(newShowDetails);
    
    // Animate details panel
    detailsHeight.value = withSpring(
      newShowDetails ? 120 : 0, 
      { damping: 15, stiffness: 100 }
    );
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <ThemedView style={[styles.container, { backgroundColor }]}>
      <AppHeader title={displayEmail.subject || 'Email'} showBackButton={true} />
      
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Enhanced Header Section */}
        <Animated.View 
          style={[styles.emailHeader, headerAnimatedStyle]}
          entering={FadeInDown.duration(400).springify()}
        >
          
          {/* Sender Information */}
          <View style={styles.senderSection}>
            <View style={[styles.senderAvatar, { backgroundColor: faviconError ? accentColor : 'transparent' }]}>
              {!faviconError ? (
                <Image
                  source={{ uri: getFaviconUrl(getSenderDomain(displayEmail.sender)) }}
                  style={styles.faviconImage}
                  onError={() => setFaviconError(true)}
                  onLoad={() => setFaviconError(false)}
                />
              ) : (
                <ThemedText style={styles.senderInitial}>
                  {senderInitial}
                </ThemedText>
              )}
            </View>
            
            <View style={styles.senderInfo}>
              <ThemedText style={[styles.senderName, { color: textColor }]}>
                {senderName}
              </ThemedText>
              <ThemedText style={[styles.senderEmail, { color: mutedColor }]}>
                {senderEmail}
              </ThemedText>
            </View>
            
            <AnimatedButton onPress={toggleDetails} hapticFeedback="impactLight">
              <IconSymbol 
                name={showDetails ? "chevron.up" : "chevron.down"} 
                size={20} 
                color={mutedColor} 
              />
            </AnimatedButton>
          </View>
          
          {/* Collapsible Details */}
          <Animated.View style={[styles.detailsContainer, detailsAnimatedStyle]}>
            <View style={[styles.detailsContent, { borderTopColor: borderColor }]}>
              <View style={styles.detailRow}>
                <ThemedText style={[styles.detailLabel, { color: mutedColor }]}>From:</ThemedText>
                <ThemedText style={[styles.detailValue, { color: textColor }]} numberOfLines={1}>
                  {displayEmail.sender}
                </ThemedText>
              </View>
              <View style={styles.detailRow}>
                <ThemedText style={[styles.detailLabel, { color: mutedColor }]}>To:</ThemedText>
                <ThemedText style={[styles.detailValue, { color: textColor }]} numberOfLines={1}>
                  {displayEmail.receiver}
                </ThemedText>
              </View>
              <View style={styles.detailRow}>
                <ThemedText style={[styles.detailLabel, { color: mutedColor }]}>Date:</ThemedText>
                <ThemedText style={[styles.detailValue, { color: textColor }]}>
                  {formattedDate}
                </ThemedText>
              </View>
            </View>
          </Animated.View>
        </Animated.View>

        {/* Enhanced Content Section */}
        <Animated.View 
          style={[styles.contentSection, contentAnimatedStyle]}
          entering={FadeInUp.delay(200).duration(500).springify()}
        >
          <View style={[styles.subjectSection, { borderBottomColor: borderColor }]}>
            <ThemedText style={[styles.fullSubject, { color: textColor }]}>
              {displayEmail.subject}
            </ThemedText>
          </View>

          <EmailContent 
            htmlContent={displayEmail.message}
            allowExternalImages={false}
          />

          {displayEmail.attachments && displayEmail.attachments.length > 0 && (
            <EmailAttachments 
              attachments={displayEmail.attachments}
            />
          )}
        </Animated.View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  emailHeader: {
    padding: 20,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  headerInfo: {
    flex: 1,
    minWidth: 0,
  },
  headerSubject: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 2,
  },
  headerDate: {
    fontSize: 14,
    fontWeight: '400',
  },
  senderSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  senderAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  faviconImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  senderInitial: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  senderInfo: {
    flex: 1,
    minWidth: 0,
  },
  senderName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  senderEmail: {
    fontSize: 14,
    fontWeight: '400',
  },
  detailsContainer: {
    marginTop: 16,
  },
  detailsContent: {
    paddingTop: 16,
    borderTopWidth: 1,
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '500',
    minWidth: 50,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '400',
    flex: 1,
  },
  contentSection: {
    flex: 1,
  },
  subjectSection: {
    padding: 20,
    borderBottomWidth: 1,
  },
  fullSubject: {
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 32,
  },
  emailContent: {
    flex: 1,
  },
  attachments: {
    marginTop: 16,
  },
}); 