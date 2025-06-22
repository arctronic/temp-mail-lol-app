import { FlashList } from '@shopify/flash-list';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Alert, LayoutAnimation, NativeScrollEvent, NativeSyntheticEvent, Pressable, StyleSheet } from 'react-native';
import { ThemedText } from '../../components/ThemedText';
import { ThemedView } from '../../components/ThemedView';
import { IconSymbol } from '../../components/ui/IconSymbol';
import { Email, useEmail } from '../../contexts/EmailContext';
import { LookupEmailWithMessages, useLookup } from '../../contexts/LookupContext';
import { useThemeColor } from '../../hooks/useThemeColor';
// EPIC 4 imports
import { AddInboxModal } from '../../components/ui/AddInboxModal';
import { AnimatedFAB } from '../../components/ui/AnimatedFAB';
import { CustomSnackbar } from '../../components/ui/CustomSnackbar';
import { InboxChipList } from '../../components/ui/InboxChipList';
import { useSnackbar } from '../../hooks/useSnackbar';

export default function LookupScreen() {
  const { 
    lookupEmails, 
    addEmailToLookup,
    addEmailToLookupWithLimit,
    removeEmailFromLookup, 
    refreshLookupEmails, 
    markEmailAsRead,
    getUnreadCount,
    getTotalUnreadCount,
    canAddInbox,
    undoRemoveInbox,
    maxInboxes,
    isLoading 
  } = useLookup();
  const { generatedEmail } = useEmail();
  const router = useRouter();
  
  // EPIC 4 State
  const [selectedInbox, setSelectedInbox] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [fabVisible, setFabVisible] = useState(true);
  const [expandedEmail, setExpandedEmail] = useState<string | null>(null);
  const [recentlyRemovedInbox, setRecentlyRemovedInbox] = useState<LookupEmailWithMessages | null>(null);
  const { snackbar, showSuccess, showWarning, showError, hideSnackbar } = useSnackbar();
  
  const scrollOffsetY = useRef(0);
  const scrollDirection = useRef<'up' | 'down'>('up');
  
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');
  const cardColor = useThemeColor({}, 'card');
  const borderColor = useThemeColor({}, 'border');
  const warningColor = useThemeColor({}, 'warning');
  
  // Format date from MongoDB date format
  const formatDate = useCallback((date: string | { $date: string }) => {
    const dateStr = typeof date === 'string' ? date : date.$date;
    return new Date(dateStr).toLocaleString();
  }, []);
  
  // Filter emails based on selected inbox
  const filteredEmails = useMemo(() => {
    if (!selectedInbox) return lookupEmails;
    return lookupEmails.filter(email => email.address === selectedInbox);
  }, [lookupEmails, selectedInbox]);
  
  // Group emails by domain for better organization
  const emailsByDomain = useMemo(() => {
    const domains = filteredEmails.reduce((acc, email) => {
      const domain = email.address.split('@')[1];
      if (!acc[domain]) acc[domain] = [];
      acc[domain].push(email);
      return acc;
    }, {} as Record<string, typeof filteredEmails>);
    
    return Object.entries(domains)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([domain, emails]) => ({
        domain,
        emails: emails.sort((a, b) => b.addedAt - a.addedAt),
      }));
  }, [filteredEmails]);

  // EPIC 4 Handlers
  const handleInboxSelect = useCallback((address: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedInbox(prev => prev === address ? null : address);
  }, []);

  const handleInboxRemove = useCallback((address: string) => {
    const inboxToRemove = lookupEmails.find(email => email.address === address);
    if (!inboxToRemove) return;

    Alert.alert(
      'Remove Inbox',
      `Remove ${address} from monitoring? All saved messages will be deleted.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Remove', 
          style: 'destructive', 
          onPress: async () => {
            try {
              LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
              
              await removeEmailFromLookup(address);
              setRecentlyRemovedInbox(inboxToRemove);
              
              // Clear selection if removed inbox was selected
              if (selectedInbox === address) {
                setSelectedInbox(null);
              }
              
              // Show undo snackbar
              showSuccess(`Removed ${address}`, {
                label: 'Undo',
                onPress: async () => {
                  if (recentlyRemovedInbox) {
                    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                    await undoRemoveInbox(recentlyRemovedInbox);
                    setRecentlyRemovedInbox(null);
                  }
                },
              });
            } catch (error) {
              showError('Failed to remove inbox');
            }
          }
        },
      ]
    );
  }, [lookupEmails, selectedInbox, removeEmailFromLookup, undoRemoveInbox, showSuccess, showError]);

  const handleAddInbox = useCallback(() => {
    if (!canAddInbox()) {
      showWarning(`You can monitor up to ${maxInboxes} inboxes. Remove one to add another.`);
      return;
    }
    setShowAddModal(true);
  }, [canAddInbox, maxInboxes, showWarning]);

  const handleAddInboxFromModal = useCallback(async (email: string) => {
    try {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      
      const result = await addEmailToLookupWithLimit(email);
      if (result.success) {
        showSuccess(`Added ${email} to monitoring`);
        // Select the newly added inbox
        setSelectedInbox(email);
      } else {
        showWarning(result.reason || 'Failed to add inbox');
      }
    } catch (error) {
      showError('Failed to add inbox');
    }
  }, [addEmailToLookupWithLimit, showSuccess, showWarning, showError]);

  const handleAddCurrentEmail = useCallback(async () => {
    if (generatedEmail) {
      await handleAddInboxFromModal(generatedEmail);
    }
  }, [generatedEmail, handleAddInboxFromModal]);

  const handleViewMessage = useCallback(async (email: Email) => {
    // Trigger haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    // Mark email as read if it's unread
    if (!email.read) {
      await markEmailAsRead(email.receiver, email.id);
    }
    
    // Navigate to message view with email data
    router.push({
      pathname: '/email',
      params: { 
        id: email.id,
        from: email.sender,
        to: email.receiver,
        subject: email.subject,
        date: typeof email.date === 'string' ? email.date : email.date.$date,
        fromLookup: 'true'
      }
    });
  }, [router, markEmailAsRead]);

  const toggleExpand = useCallback((address: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedEmail(prev => prev === address ? null : address);
  }, []);

  // FAB scroll handling
  const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const currentOffset = event.nativeEvent.contentOffset.y;
    const direction = currentOffset > scrollOffsetY.current ? 'down' : 'up';
    
    if (direction !== scrollDirection.current) {
      scrollDirection.current = direction;
      setFabVisible(direction === 'up' || currentOffset < 100);
    }
    
    scrollOffsetY.current = currentOffset;
  }, []);

  interface DomainGroup {
    domain: string;
    emails: typeof filteredEmails;
  }

  const renderEmailItem = useCallback(({ item: domainGroup }: { item: DomainGroup }) => (
    <ThemedView style={styles.domainGroup}>
      <ThemedView style={styles.domainHeader}>
        <ThemedView style={[styles.domainBadge, { backgroundColor: tintColor }]}>
          <IconSymbol name="at" size={14} color="#fff" />
        </ThemedView>
        <ThemedText style={styles.domainText}>{domainGroup.domain}</ThemedText>
      </ThemedView>
      
      {domainGroup.emails.map((email, emailIndex) => {
        const isExpanded = expandedEmail === email.address;
        
        return (
          <ThemedView key={`domain-${domainGroup.domain}-email-${email.address}-${email.addedAt}`} style={[styles.emailCard, { borderColor }]}>
            <Pressable
              style={({ pressed }) => [
                styles.emailHeader,
                { backgroundColor: pressed ? `${textColor}08` : 'transparent' }
              ]}
              onPress={() => toggleExpand(email.address)}
            >
              <ThemedView style={styles.emailMainInfo}>
                <ThemedText style={styles.emailAddress} numberOfLines={1}>
                  {email.address} ({email.messages.length})
                  {(email.unreadCount || 0) > 0 && (
                    <ThemedText style={[styles.unreadIndicator, { color: tintColor }]}>
                      {' '}• {email.unreadCount} new
                    </ThemedText>
                  )}
                </ThemedText>
                <ThemedText style={styles.emailMeta}>
                  Added {new Date(email.addedAt).toLocaleDateString()}
                </ThemedText>
              </ThemedView>
              <ThemedView style={styles.emailActions}>
                <ThemedView style={[styles.expandButton, { backgroundColor: `${textColor}10` }]}>
                  <IconSymbol 
                    name={isExpanded ? "chevron.up" : "chevron.down"} 
                    size={16} 
                    color={textColor}
                  />
                </ThemedView>
              </ThemedView>
            </Pressable>
            
            {isExpanded && (
              <ThemedView style={[styles.messagesList, { borderTopColor: borderColor }]}>
                {email.messages.length === 0 ? (
                  <ThemedView style={styles.noMessagesContainer}>
                    <IconSymbol name="envelope" size={24} color={textColor} style={{ opacity: 0.3 }} />
                    <ThemedText style={styles.noMessages}>
                      No messages yet
                    </ThemedText>
                    <ThemedText style={styles.noMessagesSubtext}>
                      New messages will appear here automatically
                    </ThemedText>
                  </ThemedView>
                ) : (
                  email.messages.map((message: Email, messageIndex: number) => (
                    <Pressable
                      key={`message-${email.address}-${message.id || messageIndex}-${messageIndex}-${typeof message.date === 'string' ? message.date : message.date.$date}`}
                      style={({ pressed }) => [
                        styles.messageItem,
                        { 
                          backgroundColor: pressed ? `${tintColor}10` : (!message.read ? `${textColor}05` : 'transparent'),
                          borderBottomColor: borderColor 
                        }
                      ]}
                      onPress={() => handleViewMessage(message)}
                    >
                      <ThemedView style={styles.messageInfo}>
                        <ThemedView style={styles.messageHeader}>
                          <ThemedText style={[
                            styles.messageSender,
                            !message.read && styles.unreadText
                          ]} numberOfLines={1}>
                            {message.sender}
                          </ThemedText>
                          {!message.read && (
                            <ThemedView style={[styles.unreadDot, { backgroundColor: tintColor }]} />
                          )}
                        </ThemedView>
                        <ThemedText style={[
                          styles.messageSubject,
                          !message.read && styles.unreadText
                        ]} numberOfLines={2}>
                          {message.subject || '(No subject)'}
                        </ThemedText>
                        <ThemedText style={styles.messageDate}>
                          {formatDate(message.date)}
                        </ThemedText>
                      </ThemedView>
                      <IconSymbol name="chevron.right" size={14} color={textColor} style={{ opacity: 0.5 }} />
                    </Pressable>
                  ))
                )}
              </ThemedView>
            )}
          </ThemedView>
        );
      })}
    </ThemedView>
  ), [expandedEmail, toggleExpand, handleViewMessage, formatDate, tintColor, cardColor, borderColor, textColor, warningColor]);
  
  return (
    <ThemedView style={[styles.container, { backgroundColor }]}>
      <ThemedView style={styles.header}>
        <ThemedView style={styles.titleContainer}>
          <ThemedView style={styles.titleWithBadge}>
            <ThemedText style={styles.title}>
              {selectedInbox ? `Monitoring: ${selectedInbox.split('@')[0]}...` : 'Inbox Monitoring'}
            </ThemedText>
            {getTotalUnreadCount() > 0 && (
              <ThemedView style={[styles.totalUnreadBadge, { backgroundColor: tintColor }]}>
                <ThemedText style={styles.totalUnreadText}>
                  {getTotalUnreadCount()}
                </ThemedText>
              </ThemedView>
            )}
          </ThemedView>
          <ThemedView style={styles.headerActions}>
            {isLoading && (
              <ThemedView style={styles.loadingIndicator}>
                <ActivityIndicator size="small" color={tintColor} />
                <ThemedText style={styles.loadingText}>Syncing...</ThemedText>
              </ThemedView>
            )}
            <Pressable
              style={({ pressed }) => [
                styles.syncButton,
                { 
                  opacity: pressed ? 0.7 : 1, 
                  backgroundColor: `${tintColor}15`,
                  borderColor: tintColor,
                }
              ]}
              onPress={refreshLookupEmails}
            >
              <IconSymbol name="arrow.clockwise" size={16} color={tintColor} />
            </Pressable>
          </ThemedView>
        </ThemedView>
      </ThemedView>

      {/* EPIC 4: Horizontal Chip List */}
      <InboxChipList
        lookupEmails={lookupEmails}
        selectedInbox={selectedInbox}
        onInboxSelect={handleInboxSelect}
        onInboxRemove={handleInboxRemove}
        onAddInbox={handleAddInbox}
        maxInboxes={maxInboxes}
      />

      {/* Email List */}
      <ThemedView style={styles.content}>
        {emailsByDomain.length === 0 ? (
          <ThemedView style={styles.emptyState}>
            <IconSymbol name="tray" size={64} color={borderColor} />
            <ThemedText style={[styles.emptyTitle, { color: textColor }]}>
              {lookupEmails.length === 0 ? 'No inboxes added yet' : 'No emails found'}
            </ThemedText>
            <ThemedText style={[styles.emptySubtitle, { color: borderColor }]}>
              {lookupEmails.length === 0 
                ? 'Add an inbox to start monitoring emails'
                : selectedInbox 
                  ? 'No emails in this inbox yet'
                  : 'Select an inbox or add a new one'
              }
            </ThemedText>
            {lookupEmails.length === 0 && (
              <Pressable
                style={({ pressed }) => [
                  styles.addFirstButton,
                  {
                    backgroundColor: pressed ? `${tintColor}90` : tintColor,
                  },
                ]}
                onPress={handleAddInbox}
              >
                <IconSymbol name="plus" size={20} color="#ffffff" />
                <ThemedText style={styles.addFirstButtonText}>Add First Inbox</ThemedText>
              </Pressable>
            )}
          </ThemedView>
        ) : (
          <FlashList
            data={emailsByDomain}
            renderItem={renderEmailItem}
            keyExtractor={(item, index) => `domain-${item.domain}-${index}-${item.emails.length}`}
            estimatedItemSize={120}
            contentContainerStyle={styles.listContent}
            onScroll={handleScroll}
            scrollEventThrottle={16}
          />
        )}
      </ThemedView>

      {/* EPIC 4: Animated FAB */}
      <AnimatedFAB
        visible={fabVisible}
        onPress={handleAddInbox}
        icon="plus"
        disabled={!canAddInbox()}
      />

      {/* EPIC 4: Add Inbox Modal */}
      <AddInboxModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAddInbox={handleAddInboxFromModal}
        canAddInbox={canAddInbox()}
        maxInboxes={maxInboxes}
      />

      {/* EPIC 4: Custom Snackbar */}
      <CustomSnackbar
        visible={snackbar.visible}
        message={snackbar.message}
        action={snackbar.action}
        type={snackbar.type}
        duration={snackbar.duration}
        onDismiss={hideSnackbar}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    paddingBottom: 8,
  },
  titleContainer: {
    gap: 12,
  },
  titleWithBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    flex: 1,
  },
  totalUnreadBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 24,
    alignItems: 'center',
  },
  totalUnreadText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  loadingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  loadingText: {
    fontSize: 12,
    opacity: 0.7,
  },
  syncButton: {
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  content: {
    flex: 1,
  },
  listContent: {
    padding: 16,
  },
  domainGroup: {
    marginBottom: 16,
  },
  domainHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  domainBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  domainText: {
    fontSize: 14,
    fontWeight: '600',
    opacity: 0.8,
  },
  emailCard: {
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
    overflow: 'hidden',
  },
  emailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  emailMainInfo: {
    flex: 1,
    gap: 4,
  },
  emailAddress: {
    fontSize: 16,
    fontWeight: '600',
  },
  emailMeta: {
    fontSize: 12,
    opacity: 0.6,
  },
  unreadIndicator: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  emailActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  expandButton: {
    padding: 8,
    borderRadius: 6,
  },
  messagesList: {
    borderTopWidth: 1,
  },
  noMessagesContainer: {
    padding: 32,
    alignItems: 'center',
    gap: 8,
  },
  noMessages: {
    fontSize: 16,
    fontWeight: '500',
    opacity: 0.6,
  },
  noMessagesSubtext: {
    fontSize: 12,
    opacity: 0.4,
    textAlign: 'center',
  },
  messageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  messageInfo: {
    flex: 1,
    gap: 4,
  },
  messageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  messageSender: {
    fontSize: 14,
    flex: 1,
  },
  messageSubject: {
    fontSize: 16,
    fontWeight: '500',
  },
  messageDate: {
    fontSize: 12,
    opacity: 0.6,
  },
  unreadText: {
    fontWeight: 'bold',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    gap: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  addFirstButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  addFirstButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});