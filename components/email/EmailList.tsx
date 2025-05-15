import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Email, useEmail } from '@/contexts/EmailContext';
import { useThemeColor } from '@/hooks/useThemeColor';
import { FlashList } from '@shopify/flash-list';
import { router } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, StyleSheet, View } from 'react-native';

interface EmailListProps {
  onViewEmail?: (email: Email) => void;
}

export const EmailList = ({ onViewEmail }: EmailListProps) => {
  const { emails, isLoading, refetch, error } = useEmail();
  const [hasInitiallyLoaded, setHasInitiallyLoaded] = useState(false);
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({}, 'border');
  const accentColor = useThemeColor({}, 'tint');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Immediately mark as initially loaded to avoid loading state on first render
  useEffect(() => {
    if (!hasInitiallyLoaded) {
      // Set a small delay to allow the UI to render first
      const timer = setTimeout(() => {
        setHasInitiallyLoaded(true);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, []);

  // When emails load, update the hasInitiallyLoaded flag
  useEffect(() => {
    if (!isLoading && !hasInitiallyLoaded) {
      setHasInitiallyLoaded(true);
    }
  }, [isLoading, hasInitiallyLoaded]);

  // Filter and sort emails
  const processedEmails = useMemo(() => {
    const validEmails = (emails || []).filter(e => e && e.id);
    
    return [...validEmails].sort((a, b) => {
      const dateA = new Date(a.date?.$date || 0);
      const dateB = new Date(b.date?.$date || 0);
      return sortDirection === 'asc' 
        ? dateA.getTime() - dateB.getTime() 
        : dateB.getTime() - dateA.getTime();
    });
  }, [emails, sortDirection]);

  const toggleSortDirection = () => {
    setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    if (isToday) {
      return date.toLocaleTimeString(undefined, {
        hour: '2-digit',
        minute: '2-digit',
      });
    } else {
      return date.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
      });
    }
  };

  const handleEmailPress = (email: Email) => {
    if (onViewEmail) {
      // Use the callback if provided (for backward compatibility)
      onViewEmail(email);
    } else {
      // Navigate to the email details screen with correct path
      router.push({
        pathname: '/email',
        params: { id: email.id }
      });
    }
  };

  const renderEmailItem = ({ item: email }: { item: Email }) => {
    const formattedDate = formatDate(email.date.$date);

    return (
      <Pressable
        style={({ pressed }) => [
          styles.emailItem,
          { 
            backgroundColor: pressed ? `${backgroundColor}90` : backgroundColor,
            borderBottomColor: borderColor,
          }
        ]}
        onPress={() => handleEmailPress(email)}
      >
        <View style={styles.senderCircle}>
          <ThemedText style={styles.senderInitial}>
            {email.sender.charAt(0).toUpperCase()}
          </ThemedText>
        </View>
        <View style={styles.emailContent}>
          <View style={styles.emailHeader}>
            <ThemedText style={styles.sender} numberOfLines={1}>
              {email.sender.replace(/<.*>/, '').trim()}
            </ThemedText>
            <ThemedText style={styles.date}>{formattedDate}</ThemedText>
          </View>
          <ThemedText style={styles.subject} numberOfLines={1}>
            {email.subject || '(No subject)'}
          </ThemedText>
          <ThemedText style={styles.preview} numberOfLines={1}>
            {email.message.substring(0, 100).replace(/\s+/g, ' ')}
          </ThemedText>
          {email.attachments && email.attachments.length > 0 && (
            <View style={styles.attachmentContainer}>
              <IconSymbol name="paperclip" size={12} color={textColor} />
              <ThemedText style={styles.attachmentText}>
                {email.attachments.length}
              </ThemedText>
            </View>
          )}
        </View>
      </Pressable>
    );
  };

  const renderListHeader = () => (
    <ThemedView style={[styles.listHeader, { borderBottomColor: borderColor }]}>
      <Pressable 
        style={styles.sortButton}
        onPress={toggleSortDirection}
      >
        <ThemedText style={styles.sortText}>Sort</ThemedText>
        <IconSymbol 
          name={sortDirection === 'asc' ? 'arrow.up' : 'arrow.down'} 
          size={14} 
          color={textColor} 
        />
      </Pressable>
    </ThemedView>
  );

  const renderEmptyList = () => (
    <ThemedView style={styles.emptyContainer}>
      {isLoading && !hasInitiallyLoaded ? (
        <>
          <ActivityIndicator size="small" color={accentColor} />
          <ThemedText style={styles.emptyText}>
            Checking for emails...
          </ThemedText>
        </>
      ) : error ? (
        <>
          <IconSymbol name="exclamationmark.triangle" size={48} color={`${textColor}40`} />
          <ThemedText style={styles.emptyText}>
            Connection Error
          </ThemedText>
          <ThemedText style={styles.emptySubtext}>
            Could not connect to the email server. Please try again later.
          </ThemedText>
          <Pressable 
            style={({ pressed }) => [
              styles.retryButton,
              { backgroundColor: accentColor, opacity: pressed ? 0.8 : 1 }
            ]}
            onPress={refetch}
          >
            <IconSymbol name="arrow.clockwise" size={16} color="white" />
            <ThemedText style={styles.retryButtonText}>Retry</ThemedText>
          </Pressable>
        </>
      ) : (
        <>
          <IconSymbol name="tray" size={48} color={`${textColor}40`} />
          <ThemedText style={styles.emptyText}>
            No emails yet
          </ThemedText>
          <ThemedText style={styles.emptySubtext}>
            Emails sent to your address will appear here
          </ThemedText>
        </>
      )}
    </ThemedView>
  );

  return (
    <ThemedView style={styles.container}>
      <FlashList
        data={processedEmails}
        renderItem={renderEmailItem}
        estimatedItemSize={100}
        keyExtractor={(item: Email, idx) => item.id?.toString() ?? `email-${idx}`}
        ListHeaderComponent={renderListHeader}
        ListEmptyComponent={renderEmptyList}
        refreshControl={
          <RefreshControl
            refreshing={isLoading && hasInitiallyLoaded}
            onRefresh={refetch}
            tintColor={textColor}
          />
        }
      />
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 6,
  },
  sortText: {
    fontSize: 12,
    marginRight: 4,
    fontWeight: '500',
  },
  emailItem: {
    flexDirection: 'row',
    padding: 12,
    borderBottomWidth: 1,
    alignItems: 'center',
  },
  senderCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  senderInitial: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  emailContent: {
    flex: 1,
  },
  emailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  sender: {
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  date: {
    fontSize: 12,
    opacity: 0.6,
  },
  subject: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  preview: {
    fontSize: 13,
    opacity: 0.7,
  },
  attachmentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  attachmentText: {
    fontSize: 12,
    opacity: 0.7,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    minHeight: 300,
    gap: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '500',
  },
  emptySubtext: {
    fontSize: 14,
    opacity: 0.7,
    textAlign: 'center',
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginTop: 16,
    gap: 8,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: '500',
  },
}); 