import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Email, useEmail } from '@/contexts/EmailContext';
import { useReloadInterval } from '@/contexts/ReloadIntervalContext';
import { useThemePreference } from '@/contexts/ThemeContext';
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
  const { activeTheme, themeVersion } = useThemePreference();
  const [hasInitiallyLoaded, setHasInitiallyLoaded] = useState(false);
  const [timeUntilRefresh, setTimeUntilRefresh] = useState(reloadInterval);
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({}, 'border');
  const accentColor = useThemeColor({}, 'tint');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    if (!hasInitiallyLoaded) {
      const timer = setTimeout(() => {
        setHasInitiallyLoaded(true);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    if (!isLoading && !hasInitiallyLoaded) {
      setHasInitiallyLoaded(true);
    }
  }, [isLoading, hasInitiallyLoaded]);

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
      onViewEmail(email);
    } else {
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
    <View style={{ flex: 1 }} key={`email-list-${themeVersion}`}>
      {renderListHeader()}
      <FlashList
        data={processedEmails}
        renderItem={renderEmailItem}
        estimatedItemSize={100}
        keyExtractor={(item) => item.id?.toString()}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmptyList}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refetch}
            colors={[accentColor]}
            tintColor={accentColor}
          />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  listContent: {
    paddingBottom: 40,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  refreshInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  refreshInfoText: {
    fontSize: 12,
    opacity: 0.7,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  sortText: {
    fontSize: 12,
    fontWeight: '500',
  },
  sortLoader: {
    width: 16,
    height: 16,
  },
  emailItem: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    alignItems: 'flex-start',
    gap: 12,
  },
  senderCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  senderInitial: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
  },
  emailContent: {
    flex: 1,
  },
  emailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  sender: {
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  date: {
    fontSize: 12,
    opacity: 0.5,
  },
  subject: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  preview: {
    fontSize: 13,
    opacity: 0.7,
    marginBottom: 4,
  },
  attachmentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  attachmentText: {
    fontSize: 12,
    opacity: 0.7,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    marginVertical: 12,
  },
  emptySubtext: {
    fontSize: 14,
    opacity: 0.7,
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  pullToRefreshText: {
    fontSize: 12,
    opacity: 0.5,
    marginTop: 8,
  },
}); 