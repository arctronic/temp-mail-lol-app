import { FlashList } from '@shopify/flash-list';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet } from 'react-native';
import { ThemedText } from '../../components/ThemedText';
import { ThemedView } from '../../components/ThemedView';
import { IconSymbol } from '../../components/ui/IconSymbol';
import { Email, useEmail } from '../../contexts/EmailContext';
import { useLookup } from '../../contexts/LookupContext';
import { useThemeColor } from '../../hooks/useThemeColor';

export default function LookupScreen() {
  const { 
    lookupEmails, 
    addEmailToLookup, 
    removeEmailFromLookup, 
    refreshLookupEmails, 
    markEmailAsRead,
    getUnreadCount,
    getTotalUnreadCount,
    isLoading 
  } = useLookup();
  const { generatedEmail } = useEmail();
  const router = useRouter();
  const [expandedEmail, setExpandedEmail] = useState<string | null>(null);
  
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
  
  // Group emails by domain for better organization
  const emailsByDomain = useMemo(() => {
    const domains = lookupEmails.reduce((acc, email) => {
      const domain = email.address.split('@')[1];
      if (!acc[domain]) acc[domain] = [];
      acc[domain].push(email);
      return acc;
    }, {} as Record<string, typeof lookupEmails>);
    
    return Object.entries(domains)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([domain, emails]) => ({
        domain,
        emails: emails.sort((a, b) => b.addedAt - a.addedAt),
      }));
  }, [lookupEmails]);
  
  const handleAddCurrentEmail = useCallback(async () => {
    if (generatedEmail) {
      await addEmailToLookup(generatedEmail);
    }
  }, [generatedEmail, addEmailToLookup]);
  
  const handleRemoveEmail = useCallback((address: string) => {
    Alert.alert(
      'Remove Email',
      `Are you sure you want to remove ${address} from your lookup list? All saved messages will be deleted.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: () => removeEmailFromLookup(address) },
      ]
    );
  }, [removeEmailFromLookup]);
  
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
    console.log('Toggling expand for:', address, 'Current expanded:', expandedEmail);
    setExpandedEmail(prev => {
      const newValue = prev === address ? null : address;
      console.log('Setting expanded to:', newValue);
      return newValue;
    });
  }, [expandedEmail]);
  
  interface DomainGroup {
    domain: string;
    emails: typeof lookupEmails;
  }

  const renderEmailItem = useCallback(({ item: domainGroup }: { item: DomainGroup }) => (
    <ThemedView style={styles.domainGroup}>
      <ThemedView style={styles.domainHeader}>
        <ThemedView style={[styles.domainBadge, { backgroundColor: tintColor }]}>
          <IconSymbol name="at" size={14} color="#fff" />
        </ThemedView>
        <ThemedText style={styles.domainText}>{domainGroup.domain}</ThemedText>
      </ThemedView>
      
      {domainGroup.emails.map((email) => {
        const isExpanded = expandedEmail === email.address;
        
        return (
          <ThemedView key={`${email.address}-${email.addedAt}`} style={[styles.emailCard, { borderColor }]}>
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
                <Pressable 
                  style={[styles.actionButton, { backgroundColor: 'rgba(255, 71, 71, 0.1)' }]}
                  onPress={(e) => {
                    e.stopPropagation();
                    handleRemoveEmail(email.address);
                  }}
                >
                  <IconSymbol name="trash" size={16} color={warningColor} />
                </Pressable>
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
                  email.messages.map((message: Email, index: number) => (
                    <Pressable
                      key={`${email.address}-${message.id}-${index}`}
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
  ), [expandedEmail, toggleExpand, handleRemoveEmail, handleViewMessage, formatDate, tintColor, cardColor, borderColor, textColor, warningColor]);
  
  return (
    <ThemedView style={[styles.container, { backgroundColor }]}>
      <ThemedView style={styles.header}>
        <ThemedView style={styles.titleContainer}>
          <ThemedView style={styles.titleWithBadge}>
            <ThemedText style={styles.title}>My Lookup List</ThemedText>
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
                  backgroundColor: tintColor 
                }
              ]}
              onPress={refreshLookupEmails}
              disabled={isLoading}
            >
              <IconSymbol 
                name="arrow.clockwise" 
                size={16} 
                color="#fff" 
                style={{ 
                  transform: [{ rotate: isLoading ? '180deg' : '0deg' }] 
                }} 
              />
            </Pressable>
          </ThemedView>
        </ThemedView>
      </ThemedView>
      
      <ThemedView style={[styles.addSection, { backgroundColor: `${textColor}03` }]}>
        <ThemedText style={styles.addText}>
          Add current email to lookup list ({lookupEmails.length}/5):
        </ThemedText>
        <Pressable
          style={({ pressed }) => [
            styles.addButton,
            { 
              opacity: lookupEmails.length >= 5 ? 0.5 : (pressed ? 0.7 : 1), 
              backgroundColor: lookupEmails.length >= 5 ? '#999' : tintColor 
            }
          ]}
          onPress={handleAddCurrentEmail}
          disabled={lookupEmails.length >= 5}
        >
          <ThemedText style={[styles.addButtonText, { color: '#fff' }]} numberOfLines={1}>
            {lookupEmails.length >= 5 ? 'Limit Reached (5/5)' : `Add ${generatedEmail}`}
          </ThemedText>
          <IconSymbol 
            name={lookupEmails.length >= 5 ? "exclamationmark.triangle" : "plus"} 
            size={16} 
            color="#fff" 
          />
        </Pressable>
      </ThemedView>
      
      {lookupEmails.length === 0 ? (
        <ThemedView style={styles.emptyState}>
          <IconSymbol name="envelope.badge" size={60} color={textColor} style={{ opacity: 0.3 }} />
          <ThemedText style={styles.emptyTitle}>No Saved Emails</ThemedText>
          <ThemedText style={styles.emptyText}>
            Add temporary emails to your lookup list to automatically check for new messages every 30 seconds.
          </ThemedText>
        </ThemedView>
      ) : (
        <ThemedView style={styles.listContainer}>
          <FlashList
            data={emailsByDomain}
            renderItem={renderEmailItem}
            estimatedItemSize={150}
            contentContainerStyle={styles.listContent}
            keyExtractor={(item, index) => `${item.domain}-${index}-${item.emails.length}`}
            extraData={expandedEmail}
          />
        </ThemedView>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 20,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleWithBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  totalUnreadBadge: {
    marginLeft: 8,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  totalUnreadText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
  },
  loadingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  loadingText: {
    fontSize: 12,
    marginLeft: 6,
    opacity: 0.7,
  },
  addSection: {
    marginBottom: 24,
    padding: 16,
    borderRadius: 12,
  },
  addText: {
    fontSize: 14,
    marginBottom: 12,
    opacity: 0.8,
  },
  addButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderRadius: 10,
    minHeight: 48,
  },
  addButtonText: {
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    textAlign: 'center',
    opacity: 0.6,
    lineHeight: 22,
    fontSize: 15,
  },
  listContainer: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 24,
  },
  domainGroup: {
    marginBottom: 20,
  },
  domainHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  domainBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  domainText: {
    fontSize: 16,
    fontWeight: '600',
  },
  emailCard: {
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  emailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    minHeight: 80,
  },
  emailMainInfo: {
    flex: 1,
    marginRight: 16,
  },
  emailAddress: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
  },
  emailMeta: {
    fontSize: 13,
    opacity: 0.6,
    marginBottom: 0,
  },
  emailActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionButton: {
    padding: 12,
    borderRadius: 22,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  expandButton: {
    padding: 12,
    borderRadius: 22,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messagesList: {
    borderTopWidth: 1,
    paddingVertical: 0,
  },
  noMessagesContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  noMessages: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 6,
    textAlign: 'center',
  },
  noMessagesSubtext: {
    textAlign: 'center',
    opacity: 0.6,
    lineHeight: 20,
    fontSize: 14,
  },
  messageItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
    minHeight: 72,
  },
  messageInfo: {
    flex: 1,
    marginRight: 16,
  },
  messageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  messageSender: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  messageSubject: {
    fontSize: 14,
    marginBottom: 6,
    opacity: 0.8,
    lineHeight: 18,
  },
  messageDate: {
    fontSize: 12,
    opacity: 0.6,
  },
  unreadMessage: {
    // Background will be handled by theme-aware styling in the component
  },
  unreadText: {
    fontWeight: 'bold',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  syncButton: {
    padding: 12,
    borderRadius: 22,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unreadIndicator: {
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 8,
  },
});