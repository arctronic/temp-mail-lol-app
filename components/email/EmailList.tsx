import { IconSymbol } from '@/components/ui/IconSymbol';
import { Email, useEmail } from '@/contexts/EmailContext';
import { useThemePreference } from '@/contexts/ThemeContext';
import { useThemeColor } from '@/hooks/useThemeColor';
import { FlashList } from '@shopify/flash-list';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Animated,
    Dimensions,
    Image,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { GestureHandlerRootView, Swipeable } from 'react-native-gesture-handler';

const { width: screenWidth } = Dimensions.get('window');

// Default reload interval (in seconds)
const DEFAULT_RELOAD_INTERVAL = 60;

// Helper function to get favicon URL
const getFaviconUrl = (domain: string) => {
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
};

interface EmailListProps {
  onViewEmail?: (email: Email) => void;
}

// Enhanced Email Card Component with Gmail-style layout
const EmailCard = React.memo(({ 
  email, 
  onPress, 
  onDelete, 
  onArchive,
  backgroundColor,
  cardColor,
  textColor,
  borderColor,
  accentColor,
  isUnread = false
}: {
  email: Email;
  onPress: (email: Email) => void;
  onDelete: (email: Email) => void;
  onArchive: (email: Email) => void;
  backgroundColor: string;
  cardColor: string;
  textColor: string;
  borderColor: string;
  accentColor: string;
  isUnread?: boolean;
}) => {
  const swipeableRef = useRef<Swipeable>(null);
  const [faviconError, setFaviconError] = useState(false);

  // Reset favicon error when email changes
  useEffect(() => {
    setFaviconError(false);
  }, [email.sender]);

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    const isYesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000).toDateString() === date.toDateString();
    
    // Get time string for all cases
    const timeStr = date.toLocaleTimeString(undefined, {
      hour: 'numeric',
      minute: '2-digit',
    });
    
    if (isToday) {
      return `Today\n${timeStr}`;
    } else if (isYesterday) {
      return `Yesterday\n${timeStr}`;
    } else {
      // For older emails, show date and time
      const dateStr = date.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
      });
      return `${dateStr}\n${timeStr}`;
    }
  };

  const getEmailSnippet = (content: string) => {
    return content.replace(/<[^>]*>/g, '').substring(0, 60).trim() + '...';
  };

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

  // Swipe Action Components
  const renderRightActions = useCallback((progress: Animated.AnimatedAddition<number>, dragX: Animated.AnimatedAddition<number>) => {
    const deleteTranslate = dragX.interpolate({
      inputRange: [-100, -50, 0],
      outputRange: [0, 50, 100],
      extrapolate: 'clamp',
    });

    const deleteScale = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1],
    });

    return (
      <View style={styles.rightActions}>
        <Animated.View style={[
          styles.deleteAction,
          {
            transform: [{ translateX: deleteTranslate }, { scale: deleteScale }]
          }
        ]}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => {
              swipeableRef.current?.close();
              onDelete(email);
            }}
          >
            <IconSymbol name="trash" size={24} color="#fff" />
            <Text style={styles.actionText}>Delete</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    );
  }, [email, onDelete]);

  const renderLeftActions = useCallback((progress: Animated.AnimatedAddition<number>, dragX: Animated.AnimatedAddition<number>) => {
    const archiveTranslate = dragX.interpolate({
      inputRange: [0, 50, 100],
      outputRange: [100, 50, 0],
      extrapolate: 'clamp',
    });

    const archiveScale = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1],
    });

    return (
      <View style={styles.leftActions}>
        <Animated.View style={[
          styles.archiveAction,
          {
            transform: [{ translateX: archiveTranslate }, { scale: archiveScale }]
          }
        ]}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => {
              swipeableRef.current?.close();
              onArchive(email);
            }}
          >
            <IconSymbol name="archivebox" size={24} color="#fff" />
            <Text style={styles.actionText}>Archive</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    );
  }, [email, onArchive]);

  return (
    <Swipeable
      ref={swipeableRef}
      renderRightActions={renderRightActions}
      renderLeftActions={renderLeftActions}
      rightThreshold={40}
      leftThreshold={40}
    >
      <TouchableOpacity
        style={[
          styles.emailCard,
          {
            backgroundColor: cardColor,
            borderColor: borderColor,
            shadowColor: textColor,
          },
          isUnread && styles.unreadCard
        ]}
        onPress={() => onPress(email)}
        activeOpacity={0.8}
      >
        {/* Unread indicator */}
        {isUnread && (
          <View style={[styles.unreadIndicator, { backgroundColor: accentColor }]} />
        )}

        {/* Sender avatar/initial */}
        <View style={[styles.senderAvatar, { backgroundColor: faviconError ? accentColor : 'transparent' }]}>
          {!faviconError ? (
            <Image
              source={{ uri: getFaviconUrl(getSenderDomain(email.sender)) }}
              style={styles.faviconImage}
              onError={() => setFaviconError(true)}
              onLoad={() => setFaviconError(false)}
            />
          ) : (
            <Text style={[styles.senderInitial, { color: '#fff' }]}>
              {getSenderName(email.sender).charAt(0).toUpperCase()}
            </Text>
          )}
        </View>

        {/* Email content */}
        <View style={styles.emailContent}>
          {/* Header row with sender and time */}
          <View style={styles.emailHeader}>
            <Text
              style={[
                styles.senderName,
                { color: textColor },
                isUnread && styles.boldText
              ]}
              numberOfLines={1}
            >
              {getSenderName(email.sender)}
            </Text>
            <Text style={[styles.timeText, { color: textColor }]} numberOfLines={2}>
              {formatTime(email.date.$date)}
            </Text>
          </View>

          {/* Subject */}
          <Text
            style={[
              styles.subjectText,
              { color: textColor },
              isUnread && styles.boldText
            ]}
            numberOfLines={1}
          >
            {email.subject || '(No subject)'}
          </Text>

          {/* Email snippet */}
          <Text
            style={[styles.snippetText, { color: textColor }]}
            numberOfLines={1}
          >
            {getEmailSnippet(email.message)}
          </Text>

          {/* Attachments indicator */}
          {email.attachments && email.attachments.length > 0 && (
            <View style={styles.attachmentIndicator}>
              <IconSymbol name="paperclip" size={12} color={textColor} />
              <Text style={[styles.attachmentCount, { color: textColor }]}>
                {email.attachments.length}
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    </Swipeable>
  );
});

EmailCard.displayName = 'EmailCard';

// Auto-refresh countdown banner component
const RefreshCountdownBanner = React.memo(({ 
  timeUntilRefresh, 
  onManualRefresh, 
  isRefreshing,
  backgroundColor,
  textColor,
  accentColor 
}: {
  timeUntilRefresh: number;
  onManualRefresh: () => void;
  isRefreshing: boolean;
  backgroundColor: string;
  textColor: string;
  accentColor: string;
}) => {
  const formatCountdown = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <View style={[styles.countdownBanner, { backgroundColor: `${accentColor}15` }]}>
      <View style={styles.countdownContent}>
        <IconSymbol 
          name="clock" 
          size={16} 
          color={accentColor} 
        />
        <Text style={[styles.countdownText, { color: textColor }]}>
          {isRefreshing ? 'Refreshing...' : `Refreshing in ${formatCountdown(timeUntilRefresh)}`}
        </Text>
      </View>
      
      <TouchableOpacity
        style={[styles.manualRefreshButton, { backgroundColor: accentColor }]}
        onPress={onManualRefresh}
        disabled={isRefreshing}
      >
        {isRefreshing ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <IconSymbol name="arrow.clockwise" size={16} color="#fff" />
        )}
      </TouchableOpacity>
    </View>
  );
});

RefreshCountdownBanner.displayName = 'RefreshCountdownBanner';

// Enhanced empty state component with animation
const EmptyInboxAnimation = React.memo(({ textColor }: { textColor: string }) => {
  const bounceAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const bounce = () => {
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // Repeat animation after 3 seconds
        setTimeout(bounce, 3000);
      });
    };

    bounce();
  }, [bounceAnim]);

  return (
    <View style={styles.emptyContainer}>
      <Animated.View style={{ transform: [{ scale: bounceAnim }] }}>
        <IconSymbol name="tray" size={80} color={`${textColor}30`} />
      </Animated.View>
      <Text style={[styles.emptyTitle, { color: textColor }]}>
        📭 No mail yet
      </Text>
      <Text style={[styles.emptySubtext, { color: textColor }]}>
        Check back later
      </Text>
      <Text style={[styles.emptyHint, { color: textColor }]}>
        Pull down to refresh
      </Text>
    </View>
  );
});

EmptyInboxAnimation.displayName = 'EmptyInboxAnimation';

export const EmailList = ({ onViewEmail }: EmailListProps) => {
  const { emails, isLoading, refetch, error } = useEmail();
  const { activeTheme, themeVersion } = useThemePreference();
  const [hasInitiallyLoaded, setHasInitiallyLoaded] = useState(false);
  const [timeUntilRefresh, setTimeUntilRefresh] = useState(DEFAULT_RELOAD_INTERVAL);
  const [deletingEmails, setDeletingEmails] = useState<Set<string>>(new Set());
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMorePages, setHasMorePages] = useState(true);
  const itemsPerPage = 10; // Gmail-style pagination
  
  const backgroundColor = useThemeColor({}, 'background');
  const cardColor = useThemeColor({}, 'card');
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({}, 'border');
  const accentColor = useThemeColor({}, 'tint');

  useEffect(() => {
    if (!hasInitiallyLoaded) {
      const timer = setTimeout(() => {
        setHasInitiallyLoaded(true);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [hasInitiallyLoaded]);

  useEffect(() => {
    if (!isLoading && !hasInitiallyLoaded) {
      setHasInitiallyLoaded(true);
    }
  }, [isLoading, hasInitiallyLoaded]);

  // Auto-refresh countdown logic
  useEffect(() => {
    if (isLoading) {
      setTimeUntilRefresh(DEFAULT_RELOAD_INTERVAL);
      return;
    }

    setTimeUntilRefresh(DEFAULT_RELOAD_INTERVAL);
    const interval = setInterval(() => {
      setTimeUntilRefresh(prev => {
        if (prev <= 1) {
          // Trigger auto-refresh
          refetch();
          return DEFAULT_RELOAD_INTERVAL;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isLoading, refetch]);

  // Reset pagination when emails change (new data)
  useEffect(() => {
    if (emails) {
      const totalEmails = emails.filter(e => e && e.id && !deletingEmails.has(e.id)).length;
      setHasMorePages(totalEmails > currentPage * itemsPerPage);
    }
  }, [emails, deletingEmails, currentPage, itemsPerPage]);

  const processedEmails = useMemo(() => {
    const validEmails = (emails || []).filter(e => e && e.id && !deletingEmails.has(e.id));
    
    const sortedEmails = [...validEmails].sort((a, b) => {
      const dateA = new Date(a.date?.$date || 0);
      const dateB = new Date(b.date?.$date || 0);
      return dateB.getTime() - dateA.getTime(); // Always newest first for Gmail-style
    });

    // Apply pagination
    return sortedEmails.slice(0, currentPage * itemsPerPage);
  }, [emails, deletingEmails, currentPage, itemsPerPage]);

  const totalEmailsCount = useMemo(() => {
    return (emails || []).filter(e => e && e.id && !deletingEmails.has(e.id)).length;
  }, [emails, deletingEmails]);

  const handleEmailPress = useCallback((email: Email) => {
    if (onViewEmail) {
      onViewEmail(email);
    } else {
      router.push({
        pathname: '/email',
        params: { id: email.id }
      });
    }
  }, [onViewEmail]);

  const handleDeleteEmail = useCallback((email: Email) => {
    Alert.alert(
      'Delete Email',
      'Are you sure you want to delete this email?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            // Add to deleting set for immediate UI feedback
            setDeletingEmails(prev => new Set(prev).add(email.id));
            
            // Show undo snackbar (simplified)
            Alert.alert(
              'Email deleted',
              'Email has been deleted.',
              [
                {
                  text: 'Undo',
                  onPress: () => {
                    setDeletingEmails(prev => {
                      const newSet = new Set(prev);
                      newSet.delete(email.id);
                      return newSet;
                    });
                  }
                },
                { text: 'OK' }
              ]
            );
            
            // Actually remove after 5 seconds if not undone
            setTimeout(() => {
              setDeletingEmails(prev => {
                const newSet = new Set(prev);
                newSet.delete(email.id);
                return newSet;
              });
            }, 5000);
          }
        }
      ]
    );
  }, []);

  const handleArchiveEmail = useCallback((email: Email) => {
    // Add to deleting set for immediate UI feedback (same as delete for now)
    setDeletingEmails(prev => new Set(prev).add(email.id));
    
    Alert.alert(
      'Email archived',
      'Email has been archived.',
      [
        {
          text: 'Undo',
          onPress: () => {
            setDeletingEmails(prev => {
              const newSet = new Set(prev);
              newSet.delete(email.id);
              return newSet;
            });
          }
        },
        { text: 'OK' }
      ]
    );
  }, []);

  const handleManualRefresh = useCallback(() => {
    refetch();
    setTimeUntilRefresh(DEFAULT_RELOAD_INTERVAL);
    // Reset pagination on manual refresh
    setCurrentPage(1);
    setHasMorePages(true);
  }, [refetch]);

  // Load more emails (pagination)
  const handleLoadMore = useCallback(async () => {
    if (isLoadingMore || !hasMorePages) return;
    
    setIsLoadingMore(true);
    
    // Simulate loading delay for better UX
    await new Promise(resolve => setTimeout(resolve, 500));
    
    setCurrentPage(prev => prev + 1);
    setIsLoadingMore(false);
  }, [isLoadingMore, hasMorePages]);

  // Handle end reached for infinite scroll
  const handleEndReached = useCallback(() => {
    if (hasMorePages && !isLoadingMore) {
      handleLoadMore();
    }
  }, [hasMorePages, isLoadingMore, handleLoadMore]);

  const renderEmailItem = useCallback(({ item: email }: { item: Email }) => (
    <EmailCard
      email={email}
      onPress={handleEmailPress}
      onDelete={handleDeleteEmail}
      onArchive={handleArchiveEmail}
      backgroundColor={backgroundColor}
      cardColor={cardColor}
      textColor={textColor}
      borderColor={borderColor}
      accentColor={accentColor}
      isUnread={false} // You can implement unread logic here
    />
  ), [
    handleEmailPress,
    handleDeleteEmail,
    handleArchiveEmail,
    backgroundColor,
    cardColor,
    textColor,
    borderColor,
    accentColor
  ]);

  // Pagination info component
  const renderPaginationInfo = useCallback(() => {
    if (totalEmailsCount === 0) return null;
    
    return (
      <View style={[styles.paginationInfo, { borderTopColor: borderColor }]}>
        <Text style={[styles.paginationText, { color: textColor }]}>
          Showing {Math.min(processedEmails.length, totalEmailsCount)} of {totalEmailsCount} emails
        </Text>
        {hasMorePages && (
          <TouchableOpacity
            style={[styles.loadMoreButton, { backgroundColor: accentColor }]}
            onPress={handleLoadMore}
            disabled={isLoadingMore}
          >
            {isLoadingMore ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <IconSymbol name="arrow.down" size={16} color="#fff" />
                <Text style={styles.loadMoreText}>Load More</Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </View>
    );
  }, [totalEmailsCount, processedEmails.length, hasMorePages, isLoadingMore, handleLoadMore, borderColor, textColor, accentColor]);

  // Loading more indicator for infinite scroll
  const renderLoadingMoreIndicator = useCallback(() => {
    if (!isLoadingMore) return null;
    
    return (
      <View style={styles.loadingMoreContainer}>
        <ActivityIndicator size="small" color={accentColor} />
        <Text style={[styles.loadingMoreText, { color: textColor }]}>
          Loading more emails...
        </Text>
      </View>
    );
  }, [isLoadingMore, accentColor, textColor]);

  const renderEmptyList = useCallback(() => {
    if (isLoading && !hasInitiallyLoaded) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color={accentColor} />
          <Text style={[styles.emptyTitle, { color: textColor }]}>
            Checking for emails...
          </Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.emptyContainer}>
          <IconSymbol name="exclamationmark.triangle" size={60} color={`${textColor}40`} />
          <Text style={[styles.emptyTitle, { color: textColor }]}>
            Connection Error
          </Text>
          <Text style={[styles.emptySubtext, { color: textColor }]}>
            Could not connect to the email server. Please try again later.
          </Text>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: accentColor }]}
            onPress={refetch}
          >
            <IconSymbol name="arrow.clockwise" size={16} color="white" />
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return <EmptyInboxAnimation textColor={textColor} />;
  }, [isLoading, hasInitiallyLoaded, error, accentColor, textColor, refetch]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }} key={`email-list-${themeVersion}`}>
      {/* Auto-refresh countdown banner */}
      <RefreshCountdownBanner
        timeUntilRefresh={timeUntilRefresh}
        onManualRefresh={handleManualRefresh}
        isRefreshing={isLoading}
        backgroundColor={backgroundColor}
        textColor={textColor}
        accentColor={accentColor}
      />

      {/* Email list */}
      <FlashList
        data={processedEmails}
        renderItem={renderEmailItem}
        estimatedItemSize={120}
        keyExtractor={(item, index) => item.id?.toString() || `email-${index}-${item.sender}-${typeof item.date === 'string' ? item.date : item.date.$date}`}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmptyList}
        ListFooterComponent={renderLoadingMoreIndicator}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={handleManualRefresh}
            colors={[accentColor]}
            tintColor={accentColor}
          />
        }
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.1}
      />

      {/* Pagination info and load more button */}
      {renderPaginationInfo()}
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },

  // Auto-refresh countdown banner styles
  countdownBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 8,
    borderRadius: 12,
  },
  countdownContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  countdownText: {
    fontSize: 14,
    fontWeight: '500',
  },
  manualRefreshButton: {
    padding: 10,
    borderRadius: 22,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Gmail-style email card styles
  emailCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    minHeight: 110,
  },
  unreadCard: {
    shadowOpacity: 0.15,
    elevation: 3,
  },
  unreadIndicator: {
    position: 'absolute',
    left: 4,
    top: '50%',
    width: 4,
    height: 40,
    borderRadius: 2,
    marginTop: -20,
  },
  senderAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  senderInitial: {
    fontSize: 22,
    fontWeight: '600',
    color: '#fff',
  },
  faviconImage: {
    width: '100%',
    height: '100%',
    borderRadius: 28,
  },
  emailContent: {
    flex: 1,
    gap: 4,
    alignSelf: 'stretch',
    justifyContent: 'center',
  },
  emailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  senderName: {
    fontSize: 15,
    fontWeight: '500',
    flex: 1,
    marginRight: 8,
  },
  timeText: {
    fontSize: 12,
    opacity: 0.8,
    fontWeight: '500',
    textAlign: 'right',
    lineHeight: 16,
    minWidth: 60,
  },
  subjectText: {
    fontSize: 14,
    fontWeight: '500',
  },
  snippetText: {
    fontSize: 13,
    opacity: 0.7,
    lineHeight: 18,
  },
  boldText: {
    fontWeight: '600',
  },
  attachmentIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  attachmentCount: {
    fontSize: 12,
    opacity: 0.7,
  },

  // Swipe action styles
  rightActions: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  leftActions: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  deleteAction: {
    backgroundColor: '#ff4444',
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    height: '90%',
    borderRadius: 12,
    marginVertical: 4,
    marginRight: 16,
  },
  archiveAction: {
    backgroundColor: '#666',
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    height: '90%',
    borderRadius: 12,
    marginVertical: 4,
    marginLeft: 16,
  },
  actionButton: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  actionText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },

  // Empty state styles
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 16,
    opacity: 0.7,
    textAlign: 'center',
    marginBottom: 8,
  },
  emptyHint: {
    fontSize: 14,
    opacity: 0.5,
    textAlign: 'center',
    marginTop: 8,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 22,
    marginTop: 16,
    minHeight: 44,
    gap: 8,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },

  // Pagination styles
  paginationInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  paginationText: {
    fontSize: 14,
    fontWeight: '500',
    opacity: 0.7,
  },
  loadMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 22,
    minWidth: 120,
    minHeight: 44,
    justifyContent: 'center',
  },
  loadMoreText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  loadingMoreContainer: {
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  loadingMoreText: {
    fontSize: 13,
    fontWeight: '500',
    opacity: 0.7,
  },
}); 