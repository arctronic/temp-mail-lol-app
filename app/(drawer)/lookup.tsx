import { FlashList } from '@shopify/flash-list';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, RefreshControl, StyleSheet } from 'react-native';
import { ThemedText } from '../../components/ThemedText';
import { ThemedView } from '../../components/ThemedView';
import { AddInboxModal } from '../../components/ui/AddInboxModal';
import { CustomSnackbar } from '../../components/ui/CustomSnackbar';
import { IconSymbol } from '../../components/ui/IconSymbol';
import { useEmail } from '../../contexts/EmailContext';
import { LookupEmailWithMessages, useLookup } from '../../contexts/LookupContext';
import { useSnackbar } from '../../hooks/useSnackbar';
import { useThemeColor } from '../../hooks/useThemeColor';

const MAX_TRACKED_EMAILS = 5;

export default function LookupScreen() {
  const { 
    lookupEmails, 
    addEmailToLookupWithLimit,
    removeEmailFromLookup, 
    refreshLookupEmails, 
    getTotalUnreadCount,
    isLoading 
  } = useLookup();
  const { loadEmailsFromStorage } = useEmail();
  const router = useRouter();
  
  const [showAddModal, setShowAddModal] = useState(false);
  const { snackbar, showSuccess, showWarning, showError, hideSnackbar } = useSnackbar();
  
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');
  const borderColor = useThemeColor({}, 'border');
  const cardColor = useThemeColor({}, 'card');
  
  const canAddInbox = () => lookupEmails.length < MAX_TRACKED_EMAILS;
  
  // Format date from MongoDB date format
  const formatDate = useCallback((date: string | { $date: string }) => {
    const dateStr = typeof date === 'string' ? date : date.$date;
    return new Date(dateStr).toLocaleDateString();
  }, []);

  const handleRemoveInbox = useCallback((address: string) => {
    Alert.alert(
      'Remove Inbox',
      `Stop tracking ${address}? All saved messages will be deleted.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Remove', 
          style: 'destructive', 
          onPress: async () => {
            try {
              await removeEmailFromLookup(address);
              showSuccess(`Stopped tracking ${address}`);
            } catch (error) {
              showError('Failed to remove inbox');
            }
          }
        },
      ]
    );
  }, [removeEmailFromLookup, showSuccess, showError]);

  const handleAddInbox = useCallback(() => {
    if (!canAddInbox()) {
      showWarning(`You can track up to ${MAX_TRACKED_EMAILS} inboxes. Remove one to add another.`);
      return;
    }
    setShowAddModal(true);
  }, [canAddInbox, showWarning]);

  const handleAddInboxFromModal = useCallback(async (email: string) => {
    try {
      const result = await addEmailToLookupWithLimit(email);
      if (result.success) {
        showSuccess(`Started tracking ${email}`);
      } else {
        showWarning(result.reason || 'Failed to add inbox');
      }
    } catch (error) {
      showError('Failed to add inbox');
    }
  }, [addEmailToLookupWithLimit, showSuccess, showWarning, showError]);

  const handleEmailCardPress = useCallback((email: LookupEmailWithMessages) => {
    // Trigger haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    // Load emails from local storage instead of making API call
    loadEmailsFromStorage(email.address, email.messages);
    
    // Navigate to the main inbox
    router.push('/(drawer)');
  }, [loadEmailsFromStorage, router]);

  const renderEmailItem = useCallback(({ item: email }: { item: LookupEmailWithMessages }) => {
    return (
      <Pressable
        style={({ pressed }) => [
          styles.emailCard,
          { 
            backgroundColor: pressed ? `${textColor}10` : cardColor
          }
        ]}
        onPress={() => handleEmailCardPress(email)}
      >
        <ThemedView style={styles.emailContent}>
          <ThemedView style={styles.emailHeader}>
            <ThemedView style={styles.emailMainInfo}>
              <ThemedText style={[styles.emailAddress, { color: textColor }]} numberOfLines={1}>
                {email.address}
              </ThemedText>
              <ThemedView style={styles.emailMeta}>
                <ThemedText style={[styles.emailCount, { color: textColor }]}>
                  {email.messages.length} messages
                  {(email.unreadCount || 0) > 0 && (
                    <ThemedText style={[styles.unreadIndicator, { color: tintColor }]}>
                      {' '}• {email.unreadCount} new
                    </ThemedText>
                  )}
                </ThemedText>
                <ThemedText style={[styles.addedDate, { color: textColor, opacity: 0.6 }]}>
                  Added {formatDate({ $date: new Date(email.addedAt).toISOString() })}
                </ThemedText>
              </ThemedView>
            </ThemedView>
            
            <ThemedView style={styles.emailActions}>
              <Pressable
                style={({ pressed }) => [
                  styles.removeButton,
                  { 
                    backgroundColor: pressed ? '#ff444420' : '#ff444410',
                    borderColor: '#ff4444'
                  }
                ]}
                onPress={(e) => {
                  e.stopPropagation();
                  handleRemoveInbox(email.address);
                }}
              >
                <IconSymbol name="xmark" size={16} color="#ff4444" />
              </Pressable>
              
              <IconSymbol name="chevron.right" size={16} color={textColor} style={{ opacity: 0.4 }} />
            </ThemedView>
          </ThemedView>
          
          {/* Preview of latest message */}
          {email.messages.length > 0 && (
            <ThemedView style={styles.messagePreview}>
              <ThemedText style={[styles.latestSender, { color: textColor }]} numberOfLines={1}>
                Latest: {email.messages[0].sender}
              </ThemedText>
              <ThemedText style={[styles.latestSubject, { color: textColor, opacity: 0.7 }]} numberOfLines={1}>
                {email.messages[0].subject || '(No subject)'}
              </ThemedText>
            </ThemedView>
          )}
        </ThemedView>
      </Pressable>
    );
  }, [handleEmailCardPress, handleRemoveInbox, formatDate, tintColor, borderColor, textColor, cardColor]);
  
  return (
    <ThemedView style={[styles.container, { backgroundColor }]}>
      <ThemedView style={styles.header}>
        <ThemedView style={styles.titleContainer}>
          <ThemedView style={styles.titleWithBadge}>
            <ThemedText style={[styles.title, { color: textColor }]}>
              My Lookup List
            </ThemedText>
            {getTotalUnreadCount() > 0 && (
              <ThemedView style={[styles.totalUnreadBadge, { backgroundColor: tintColor }]}>
                <ThemedText style={styles.totalUnreadText}>
                  {getTotalUnreadCount()}
                </ThemedText>
              </ThemedView>
            )}
          </ThemedView>
          <ThemedText style={[styles.subtitle, { color: textColor, opacity: 0.6 }]}>
            Tracking {lookupEmails.length}/{MAX_TRACKED_EMAILS} inboxes • Tap to view emails
          </ThemedText>
        </ThemedView>
        
        <ThemedView style={styles.headerActions}>
          {isLoading && (
            <ThemedView style={styles.loadingIndicator}>
              <ActivityIndicator size="small" color={tintColor} />
              <ThemedText style={[styles.loadingText, { color: textColor, opacity: 0.7 }]}>Syncing...</ThemedText>
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

      {/* Email List */}
      <ThemedView style={styles.content}>
        {lookupEmails.length === 0 ? (
          <ThemedView style={styles.emptyState}>
            <IconSymbol name="tray" size={64} color={textColor} style={{ opacity: 0.3 }} />
            <ThemedText style={[styles.emptyTitle, { color: textColor }]}>
              No inboxes added yet
            </ThemedText>
            <ThemedText style={[styles.emptySubtitle, { color: textColor, opacity: 0.6 }]}>
              Add an inbox to start monitoring emails
            </ThemedText>
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
          </ThemedView>
        ) : (
          <FlashList
            data={lookupEmails}
            renderItem={renderEmailItem}
            keyExtractor={(item) => item.address}
            estimatedItemSize={100}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl
                refreshing={isLoading}
                onRefresh={refreshLookupEmails}
                colors={[tintColor]}
                tintColor={tintColor}
              />
            }
            showsVerticalScrollIndicator={false}
          />
        )}
      </ThemedView>

      {/* Add Button */}
      {canAddInbox() && (
        <Pressable
          style={({ pressed }) => [
            styles.addButton,
            {
              backgroundColor: pressed ? `${tintColor}90` : tintColor,
            },
          ]}
          onPress={handleAddInbox}
        >
          <IconSymbol name="plus" size={24} color="#ffffff" />
        </Pressable>
      )}

      {/* Add Inbox Modal */}
      <AddInboxModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAddInbox={handleAddInboxFromModal}
        canAddInbox={canAddInbox()}
        maxInboxes={MAX_TRACKED_EMAILS}
      />

      {/* Custom Snackbar */}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  titleContainer: {
    flex: 1,
    gap: 4,
  },
  titleWithBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 14,
    opacity: 0.7,
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
    paddingHorizontal: 16,
    paddingBottom: 80,
  },
  emailCard: {
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emailContent: {
    flex: 1,
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
    gap: 2,
  },
  emailCount: {
    fontSize: 14,
    opacity: 0.8,
  },
  addedDate: {
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
  removeButton: {
    padding: 8,
    borderRadius: 6,
    borderWidth: 1,
  },
  messagePreview: {
    padding: 16,
    paddingTop: 12,
  },
  latestSender: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 4,
  },
  latestSubject: {
    fontSize: 14,
    opacity: 0.8,
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
  addButton: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
});