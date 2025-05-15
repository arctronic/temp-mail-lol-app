import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Email, useEmail } from '@/contexts/EmailContext';
import { useReloadInterval } from '@/contexts/ReloadIntervalContext';
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
  const { reloadInterval } = useReloadInterval();
  const [hasInitiallyLoaded, setHasInitiallyLoaded] = useState(false);
  const [timeUntilRefresh, setTimeUntilRefresh] = useState(reloadInterval);
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

  // Countdown timer for next refresh
  useEffect(() => {
    if (isLoading) {
      setTimeUntilRefresh(reloadInterval);
      return;
    }

    setTimeUntilRefresh(reloadInterval);
    const interval = setInterval(() => {
      setTimeUntilRefresh(prev => {
        if (prev <= 1) {
          return reloadInterval;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isLoading, reloadInterval]);

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

  const formatTimeUntilRefresh = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    }
    return `${remainingSeconds}s`;
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
        <View style={[
          styles.senderCircle, 
          { backgroundColor: accentColor }
        ]}>
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
      <View style={styles.refreshInfoContainer}>
        <IconSymbol 
          name="arrow.clockwise" 
          size={12} 
          color={`${textColor}80`} 
        />
        <ThemedText style={styles.refreshInfoText}>
          Next refresh in {formatTimeUntilRefresh(timeUntilRefresh)}
        </ThemedText>
      </View>
      <Pressable 
        style={({ pressed }) => [
          styles.sortButton,
          { 
            backgroundColor: isLoading ? `${accentColor}20` : pressed ? `${accentColor}15` : 'transparent',
            opacity: isLoading ? 0.7 : 1
          }
        ]}
        onPress={toggleSortDirection}
        disabled={isLoading}
      >
        <ThemedText style={[styles.sortText, isLoading && { opacity: 0.7 }]}>
          Sort by date
        </ThemedText>
        {isLoading ? (
          <ActivityIndicator size="small" color={accentColor} style={styles.sortLoader} />
        ) : (
          <IconSymbol 
            name={sortDirection === 'asc' ? 'arrow.up' : 'arrow.down'} 
            size={16} 
            color={textColor} 
          />
        )}
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
          <ThemedText style={styles.pullToRefreshText}>
            Pull down to refresh
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
            refreshing={isLoading}
            onRefresh={refetch}
            colors={[accentColor]}
            tintColor={accentColor}
            title="Pull to refresh"
            titleColor={textColor}
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    marginBottom: 4,
  },
  refreshInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  refreshInfoText: {
    fontSize: 12,
    opacity: 0.6,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(150, 150, 150, 0.2)',
  },
  sortText: {
    fontSize: 13,
    marginRight: 8,
    fontWeight: '600',
  },
  sortLoader: {
    marginLeft: 2,
  },
  emailItem: {
    flexDirection: 'row',
    padding: 16,
    paddingVertical: 18,
    borderBottomWidth: 1,
    alignItems: 'center',
  },
  senderCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#6366f1', // Will be overridden dynamically
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  senderInitial: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  emailContent: {
    flex: 1,
  },
  emailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  sender: {
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
    marginRight: 12,
  },
  date: {
    fontSize: 12,
    opacity: 0.6,
  },
  subject: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  preview: {
    fontSize: 13,
    opacity: 0.7,
    lineHeight: 18,
  },
  attachmentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
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
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 14,
    opacity: 0.7,
    textAlign: 'center',
    maxWidth: 280,
  },
  pullToRefreshText: {
    fontSize: 13,
    opacity: 0.5,
    marginTop: 20,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginTop: 20,
    gap: 8,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: '500',
  },
}); 