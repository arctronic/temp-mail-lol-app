import { Octicons } from '@expo/vector-icons';
import { FlashList } from '@shopify/flash-list';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, StyleSheet } from 'react-native';
import { ThemedText } from '../../components/ThemedText';
import { ThemedView } from '../../components/ThemedView';
import { AddInboxModal } from '../../components/ui/AddInboxModal';
import { IconSymbol } from '../../components/ui/IconSymbol';
import { useAds } from '../../contexts/AdContext';
import { useEmail } from '../../contexts/EmailContext';
import { LookupEmailWithMessages, useLookup } from '../../contexts/LookupContext';
import { useGlobalToast } from '../../hooks/useGlobalToast';
import { useThemeColor } from '../../hooks/useThemeColor';
import { exportEmailsToExcel, getExportStatistics } from '../../utils/excelExport';

const MAX_TRACKED_EMAILS = 5;

export default function LookupScreen() {
  const { 
    lookupEmails, 
    addEmailToLookupWithLimit,
    addEmailToLookupWithAd,
    removeEmailFromLookup, 
    refreshLookupEmails, 
    getTotalUnreadCount,
    isLoading 
  } = useLookup();
  const { loadEmailsFromStorage } = useEmail();
  const { showRewardedAdForAction } = useAds();
  const router = useRouter();
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const { showSuccess, showWarning, showError } = useGlobalToast();
  
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
    // For better UX, let's allow direct removal without ads
    // Show rewarded ad for untracking
    showRewardedAdForAction(
      'untrack',
      async () => {
        try {
          await removeEmailFromLookup(address);
          showSuccess(`Stopped tracking ${address}`);
        } catch (error) {
          showError('Failed to remove inbox');
        }
      },
      async () => {
        // User cancelled or ad failed - still allow removal for better UX
        try {
          await removeEmailFromLookup(address);
          showSuccess(`Stopped tracking ${address}`);
        } catch (error) {
          showError('Failed to remove inbox');
        }
      }
    );
  }, [removeEmailFromLookup, showSuccess, showError, showRewardedAdForAction]);

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

  const handleAddExtraInbox = useCallback(() => {
    // Show rewarded ad for adding more than 5 inboxes
    showRewardedAdForAction(
      'add_extra',
      () => {
        setShowAddModal(true);
      },
      () => {
        showWarning('Watch an ad to add more than 5 email addresses.');
      }
    );
  }, [showRewardedAdForAction, showWarning]);

  const handleAddInboxFromModalExtra = useCallback(async (email: string) => {
    try {
      const result = await addEmailToLookupWithAd(email);
      if (result.success) {
        showSuccess(`Started tracking ${email}`);
      } else {
        showWarning(result.reason || 'Failed to add inbox');
      }
    } catch (error) {
      showError('Failed to add inbox');
    }
  }, [addEmailToLookupWithAd, showSuccess, showWarning, showError]);

  const handleExport = async () => {
    if (lookupEmails.length === 0) {
      showWarning('No emails to export. Add some inboxes first.');
      return;
    }

    const stats = getExportStatistics(lookupEmails);
    
    showRewardedAdForAction(
      'export',
      async () => {
        try {
          setIsExporting(true);
          await exportEmailsToExcel(lookupEmails);
          showSuccess('✅ Emails exported successfully!');
        } catch (error) {
          console.error('Export failed:', error);
          showError('❌ Export failed. Please try again.');
        } finally {
          setIsExporting(false);
        }
      },
      () => {
        showWarning('📺 Watch an ad to export your emails to Excel');
      }
    );
  };

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
                <ThemedText style={[styles.addedDate, { color: textColor, opacity: 0.8 }]}>
                  Added {formatDate({ $date: new Date(email.addedAt).toISOString() })}
                </ThemedText>
              </ThemedView>
            </ThemedView>
            <ThemedView style={styles.emailActionsModern}>
              <Pressable
                style={({ pressed }) => [
                  styles.removeButtonModern,
                  {
                    backgroundColor: pressed ? 'rgba(255, 59, 48, 0.2)' : 'rgba(255, 59, 48, 0.1)',
                  },
                ]}
                onPress={(e) => {
                  e.stopPropagation();
                  handleRemoveInbox(email.address);
                }}
              >
                <IconSymbol name="trash" size={16} color="#ff3b30" />
              </Pressable>
              <Pressable
                style={styles.chevronButton}
                onPress={() => handleEmailCardPress(email)}
              >
                <IconSymbol name="chevron.right" size={16} color={textColor} style={{ opacity: 0.5 }} />
              </Pressable>
            </ThemedView>
          </ThemedView>
          
          {/* Preview of latest message */}
          {email.messages.length > 0 && (
            <ThemedView style={styles.messagePreview}>
              <ThemedText style={[styles.latestSender, { color: textColor }]} numberOfLines={1}>
                Latest: {email.messages[0].sender}
              </ThemedText>
              <ThemedText style={[styles.latestSubject, { color: textColor, opacity: 0.9 }]} numberOfLines={1}>
                {email.messages[0].subject || '(No subject)'}
              </ThemedText>
            </ThemedView>
          )}
        </ThemedView>
      </Pressable>
    );
  }, [handleEmailCardPress, formatDate, tintColor, textColor, cardColor]);
  
  return (
    <ThemedView style={[styles.container, { backgroundColor, paddingTop: 20 }]}>
      <ThemedView style={styles.header}>
        <ThemedView style={styles.titleContainer}>
          <ThemedText style={[styles.subtitle, { color: textColor }]}>
            Tracking {lookupEmails.length}/{MAX_TRACKED_EMAILS} inboxes • Tap to view emails
          </ThemedText>
        </ThemedView>
        <ThemedView style={styles.headerActions}>
          {isLoading && (
            <ThemedView style={styles.loadingIndicator}>
              <ActivityIndicator size="small" color={tintColor} />
              <ThemedText style={[styles.loadingText, { color: textColor }]}>Syncing...</ThemedText>
            </ThemedView>
          )}
          <Pressable
            style={({ pressed }) => [
              styles.syncIconButton,
              { opacity: pressed ? 0.7 : 1 },
            ]}
            onPress={handleExport}
            disabled={isExporting || lookupEmails.length === 0}
          >
            {isExporting ? (
              <ActivityIndicator size="small" color={tintColor} />
            ) : (
              <Octicons name="download" size={20} color={tintColor} />
            )}
          </Pressable>
          <Pressable
            style={({ pressed }) => [
              styles.syncIconButton,
              { opacity: pressed ? 0.7 : 1 },
            ]}
            onPress={refreshLookupEmails}
          >
            <IconSymbol name="arrow.clockwise" size={20} color={tintColor} />
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
            <ThemedText style={[styles.emptySubtitle, { color: textColor }]}>
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
      {lookupEmails.length > 0 && (
        <Pressable
          style={({ pressed }) => [
            styles.addButton,
            {
              backgroundColor: pressed ? `${tintColor}90` : tintColor,
            },
          ]}
          onPress={canAddInbox() ? handleAddInbox : handleAddExtraInbox}
        >
          <IconSymbol name="plus" size={24} color="#ffffff" />
        </Pressable>
      )}

      {/* Add Inbox Modal */}
      <AddInboxModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAddInbox={canAddInbox() ? handleAddInboxFromModal : handleAddInboxFromModalExtra}
        canAddInbox={canAddInbox()}
        maxInboxes={canAddInbox() ? MAX_TRACKED_EMAILS : 20}
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
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 14,
    opacity: 0.8,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  loadingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginRight: 8,
  },
  loadingText: {
    fontSize: 12,
    opacity: 0.7,
  },
  content: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  emailCard: {
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emailContent: {
    padding: 16,
  },
  emailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  emailMainInfo: {
    flex: 1,
    minWidth: 0,
  },
  emailAddress: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  emailMeta: {
    gap: 2,
  },
  emailCount: {
    fontSize: 14,
    fontWeight: '500',
  },
  unreadIndicator: {
    fontWeight: '600',
  },
  addedDate: {
    fontSize: 12,
  },
  emailActionsModern: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  removeButtonModern: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chevronButton: {
    padding: 4,
  },
  messagePreview: {
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
    gap: 4,
  },
  latestSender: {
    fontSize: 14,
    fontWeight: '500',
  },
  latestSubject: {
    fontSize: 13,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    gap: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.7,
  },
  addFirstButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    gap: 8,
    marginTop: 8,
  },
  addFirstButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  addButton: {
    position: 'absolute',
    right: 24,
    bottom: 32,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  syncIconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
});