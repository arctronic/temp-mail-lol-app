import * as Clipboard from 'expo-clipboard';
import * as FileSystem from 'expo-file-system';
import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Animated, {
    FadeInDown,
    FadeInUp,
    SlideInRight,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming
} from 'react-native-reanimated';
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

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

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
  const [actionFeedback, setActionFeedback] = useState<string>('');
  
  // Animation values
  const headerOpacity = useSharedValue(0);
  const headerTranslateY = useSharedValue(-20);
  const contentOpacity = useSharedValue(0);
  const toolbarScale = useSharedValue(0.9);
  
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
  
  // Animation initialization
  useEffect(() => {
    headerOpacity.value = withTiming(1, { duration: 600 });
    headerTranslateY.value = withSpring(0, { damping: 15 });
    contentOpacity.value = withTiming(1, { duration: 800 });
    toolbarScale.value = withSpring(1, { damping: 12 });
  }, [headerOpacity, headerTranslateY, contentOpacity, toolbarScale]);
  
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

  // Enhanced action handlers with feedback
  const showActionFeedback = (message: string) => {
    setActionFeedback(message);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setTimeout(() => setActionFeedback(''), 2000);
  };

  const handleCopyContent = async () => {
    try {
      const emailContent = `From: ${displayEmail.sender}
To: ${displayEmail.receiver}
Subject: ${displayEmail.subject}
Date: ${formattedDate}

${displayEmail.message}`;
      
      await Clipboard.setStringAsync(emailContent);
      showActionFeedback('📋 Email copied to clipboard');
    } catch (error) {
      Alert.alert('Error', 'Failed to copy email content');
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
      showActionFeedback('💾 Email saved successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to save email locally');
    }
  };

  const handleDelete = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      'Delete Email',
      'Are you sure you want to delete this email?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            showActionFeedback('🗑️ Email deleted');
            setTimeout(() => goBack(), 1500);
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
            showActionFeedback('🚩 Email reported as spam');
          }
        }
      ]
    );
  };

  const handleShare = async () => {
    await handleCopyContent();
  };

  const goBack = () => {
    // Navigate back based on where the user came from
    if (isFromLookup) {
      router.push('/lookup' as any);
    } else {
      router.replace('/(drawer)');
    }
  };

  // Animated styles
  const headerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
    transform: [{ translateY: headerTranslateY.value }],
  }));

  const contentAnimatedStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
  }));

  const toolbarAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: toolbarScale.value }],
  }));

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
        showsVerticalScrollIndicator={false}
      >
        {/* Action Feedback */}
        {actionFeedback && (
          <Animated.View 
            style={[styles.feedbackContainer, { backgroundColor: accentColor }]}
            entering={FadeInDown.duration(300)}
            exiting={FadeInUp.duration(300)}
          >
            <ThemedText style={styles.feedbackText}>{actionFeedback}</ThemedText>
          </Animated.View>
        )}

        {/* Gmail-style Header */}
        <Animated.View style={[styles.emailHeader, headerAnimatedStyle]}>
          <Animated.View 
            style={styles.subjectContainer}
            entering={SlideInRight.delay(200).duration(600)}
          >
            <ThemedText style={styles.subject}>
              {displayEmail.subject || '(No subject)'}
            </ThemedText>
          </Animated.View>

          <Animated.View 
            style={styles.senderContainer}
            entering={SlideInRight.delay(400).duration(600)}
          >
            <View style={[styles.avatar, { backgroundColor: accentColor }]}>
              <ThemedText style={styles.avatarText}>{senderInitial}</ThemedText>
            </View>
            
            <View style={styles.senderInfo}>
              <View style={styles.senderNameRow}>
                <ThemedText style={styles.senderName}>{senderName}</ThemedText>
                <ThemedText style={styles.dateShort}>{date.toLocaleDateString()}</ThemedText>
              </View>
              <ThemedText style={styles.senderEmail} numberOfLines={1}>{senderEmail}</ThemedText>
              <ThemedText style={styles.recipientText}>to {displayEmail.receiver}</ThemedText>
            </View>
          </Animated.View>
        </Animated.View>
        
        {/* Enhanced Collapsible Header Info */}
        <AnimatedPressable
          style={({ pressed }) => [
            styles.detailsToggle,
            { 
              borderColor,
              backgroundColor: pressed ? `${accentColor}15` : 'transparent',
            }
          ]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setShowDetails(!showDetails);
          }}
        >
          <View style={styles.detailsToggleContent}>
            <IconSymbol 
              name="info.circle" 
              size={16} 
              color={mutedColor} 
              style={styles.detailsIcon}
            />
            <ThemedText style={[styles.detailsText, { color: mutedColor }]}>
              {showDetails ? 'Hide headers' : 'Show headers'}
            </ThemedText>
          </View>
          <IconSymbol 
            name={showDetails ? 'chevron.up' : 'chevron.down'} 
            size={14} 
            color={mutedColor} 
          />
        </AnimatedPressable>
        
        {/* Detailed headers when expanded */}
        {showDetails && (
          <Animated.View 
            style={[styles.detailsContainer, { borderColor }]}
            entering={FadeInDown.duration(300)}
          >
            <View style={styles.detailRow}>
              <ThemedText style={styles.detailLabel}>From:</ThemedText>
              <ThemedText style={styles.detailValue} numberOfLines={2}>{displayEmail.sender}</ThemedText>
            </View>
            <View style={styles.detailRow}>
              <ThemedText style={styles.detailLabel}>To:</ThemedText>
              <ThemedText style={styles.detailValue} numberOfLines={2}>{displayEmail.receiver}</ThemedText>
            </View>
            <View style={styles.detailRow}>
              <ThemedText style={styles.detailLabel}>Date:</ThemedText>
              <ThemedText style={styles.detailValue}>{formattedDate}</ThemedText>
            </View>
          </Animated.View>
        )}
        

        
        {/* Email content with animation */}
        <Animated.View style={contentAnimatedStyle}>
          <EmailContent htmlContent={displayEmail.message} />
        </Animated.View>
        
        {/* Email attachments */}
        {displayEmail.attachments && displayEmail.attachments.length > 0 && (
          <Animated.View entering={FadeInDown.delay(800).duration(400)}>
            <EmailAttachments attachments={displayEmail.attachments} />
          </Animated.View>
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
  feedbackContainer: {
    position: 'absolute',
    top: 0,
    left: 16,
    right: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    zIndex: 1000,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  feedbackText: {
    color: 'white',
    fontWeight: '600',
    textAlign: 'center',
    fontSize: 14,
  },
  emailHeader: {
    marginBottom: 20,
    marginTop: 8,
  },
  subjectContainer: {
    marginBottom: 16,
  },
  subject: {
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 32,
  },
  senderContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  avatarText: {
    fontSize: 22,
    fontWeight: '700',
    color: 'white',
  },
  senderInfo: {
    flex: 1,
    paddingTop: 2,
  },
  senderNameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  senderName: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
  },
  dateShort: {
    fontSize: 14,
    opacity: 0.6,
    fontWeight: '500',
  },
  senderEmail: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 2,
  },
  recipientText: {
    fontSize: 14,
    opacity: 0.6,
    fontStyle: 'italic',
  },
  detailsToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 16,
  },
  detailsToggleContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailsIcon: {
    marginRight: 8,
  },
  detailsText: {
    fontSize: 14,
    fontWeight: '500',
  },
  detailsContainer: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    backgroundColor: 'rgba(128, 128, 128, 0.05)',
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 10,
    alignItems: 'flex-start',
  },
  detailLabel: {
    width: 80,
    fontSize: 14,
    fontWeight: '600',
    opacity: 0.8,
  },
  detailValue: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },

}); 