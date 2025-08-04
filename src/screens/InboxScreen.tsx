import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  Alert,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {
  Text,
  FAB,
  useTheme,
  Searchbar,
  Menu,
  IconButton,
} from 'react-native-paper';

import {Email, TempEmailAddress} from '../types';
import ApiService from '../services/ApiService';
import StorageService from '../services/StorageService';
import EmailCard from '../components/EmailCard';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';
import BannerAdComponent from '../components/BannerAdComponent';
import AdMobService from '../services/AdMobService';

const InboxScreen: React.FC = () => {
  const theme = useTheme();
  const [currentEmail, setCurrentEmail] = useState<TempEmailAddress | null>(null);
  const [emails, setEmails] = useState<Email[]>([]);
  const [filteredEmails, setFilteredEmails] = useState<Email[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const [sortBy, setSortBy] = useState<'date' | 'sender' | 'subject'>('date');
  const [filterUnread, setFilterUnread] = useState(false);

  useEffect(() => {
    loadCurrentEmail();
  }, []);

  useEffect(() => {
    if (currentEmail) {
      loadEmails();
      
      // Set up auto-refresh
      const interval = setInterval(() => {
        loadEmails(true);
      }, 30000); // Refresh every 30 seconds

      return () => clearInterval(interval);
    }
  }, [currentEmail]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    filterAndSortEmails();
  }, [emails, searchQuery, sortBy, filterUnread]);

  const loadCurrentEmail = async () => {
    try {
      const savedEmail = await StorageService.getCurrentEmail();
      if (savedEmail) {
        setCurrentEmail(savedEmail);
        ApiService.setCurrentEmail(savedEmail.email);
      }
    } catch (err) {
      console.error('Load current email error:', err);
    }
  };

  const loadEmails = async (silent = false) => {
    if (!currentEmail) return;

    try {
      if (!silent) {
        setIsLoading(true);
      }
      setError(null);

      // Try to load from cache first
      const cachedEmails = await StorageService.getCachedEmails(currentEmail.email);
      if (cachedEmails.length > 0 && !silent) {
        setEmails(cachedEmails);
      }

      // Fetch fresh emails from API
      const response = await ApiService.getEmails(currentEmail.email);
      
      if (response.success && response.data) {
        const freshEmails = response.data.emails;
        
        // Cache the emails with deduplication
        await StorageService.setCachedEmails(currentEmail.email, freshEmails);
        
        // Get the merged emails from cache (deduplicated)
        const mergedEmails = await StorageService.getCachedEmails(currentEmail.email);
        setEmails(mergedEmails);
      } else {
        if (cachedEmails.length === 0) {
          setError(response.message || 'Failed to load emails');
        }
      }
    } catch (err) {
      console.error('Load emails error:', err);
      if (!silent) {
        setError('Network error. Please try again.');
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    loadEmails();
  }, [currentEmail]);

  const filterAndSortEmails = () => {
    let filtered = [...emails];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        email =>
          email.from.toLowerCase().includes(query) ||
          email.subject.toLowerCase().includes(query) ||
          email.body.toLowerCase().includes(query)
      );
    }

    // Apply unread filter
    if (filterUnread) {
      filtered = filtered.filter(email => !email.isRead);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
        case 'sender':
          return a.from.localeCompare(b.from);
        case 'subject':
          return a.subject.localeCompare(b.subject);
        default:
          return 0;
      }
    });

    setFilteredEmails(filtered);
  };

  const handleEmailPress = async (email: Email) => {
    // Mark email as read
    if (!email.isRead && currentEmail) {
      const updatedEmails = emails.map(e =>
        e.id === email.id ? {...e, isRead: true} : e
      );
      setEmails(updatedEmails);
      
      // Update cache
      await StorageService.markEmailAsRead(currentEmail.email, email.id);
    }

    // Show interstitial ad strategically
    AdMobService.showAdOnAction('email_opened');

    // Navigate to email detail (would be implemented with navigation)
    Alert.alert(
      email.subject || 'No Subject',
      `From: ${email.from}\n\n${email.body.replace(/<[^>]*>/g, '').trim()}`,
      [{text: 'OK'}]
    );
  };

  const handleDeleteEmail = async (email: Email) => {
    Alert.alert(
      'Delete Email',
      'Are you sure you want to delete this email?',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await ApiService.deleteEmail(email.id);
              if (response.success) {
                const updatedEmails = emails.filter(e => e.id !== email.id);
                setEmails(updatedEmails);
                
                // Update cache
                if (currentEmail) {
                  await StorageService.removeEmailFromCache(currentEmail.email, email.id);
                }
              } else {
                Alert.alert('Error', 'Failed to delete email');
              }
            } catch (err) {
              console.error('Delete email error:', err);
              Alert.alert('Error', 'Network error. Please try again.');
            }
          },
        },
      ]
    );
  };

  const markAllAsRead = async () => {
    if (!currentEmail) return;

    const updatedEmails = emails.map(email => ({...email, isRead: true}));
    setEmails(updatedEmails);
    
    // Update cache
    await StorageService.setCachedEmails(currentEmail.email, updatedEmails);
  };

  const clearAllEmails = () => {
    Alert.alert(
      'Clear All Emails',
      'Are you sure you want to clear all emails? This action cannot be undone.',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: () => {
            setEmails([]);
            if (currentEmail) {
              StorageService.setCachedEmails(currentEmail.email, []);
            }
          },
        },
      ]
    );
  };

  const renderEmailItem = ({item}: {item: Email}) => (
    <EmailCard
      email={item}
      onPress={() => handleEmailPress(item)}
      onDelete={() => handleDeleteEmail(item)}
    />
  );

  const renderEmptyState = () => {
    if (!currentEmail) {
      return (
        <EmptyState
          icon="email-outline"
          title="No Email Address"
          message="Generate a temporary email address from the Home tab to start receiving emails."
          actionLabel="Go to Home"
          onAction={() => {
            // Navigate to Home tab (would be implemented with navigation)
          }}
        />
      );
    }

    if (searchQuery.trim()) {
      return (
        <EmptyState
          icon="search-off"
          title="No Results"
          message={`No emails found matching "${searchQuery}"`}
          actionLabel="Clear Search"
          onAction={() => setSearchQuery('')}
        />
      );
    }

    return (
      <EmptyState
        icon="inbox"
        title="No Emails Yet"
        message="Your temporary inbox is empty. Emails sent to your temporary address will appear here."
        actionLabel="Refresh"
        onAction={handleRefresh}
      />
    );
  };

  if (isLoading && emails.length === 0) {
    return <LoadingSpinner message="Loading emails..." />;
  }

  if (error && emails.length === 0) {
    return (
      <ErrorState
        message={error}
        onAction={() => {
          setError(null);
          loadEmails();
        }}
      />
    );
  }

  const unreadCount = emails.filter(email => !email.isRead).length;

  return (
    <SafeAreaView style={[styles.container, {backgroundColor: theme.colors.background}]} edges={['bottom']}>
      {/* Search and Filter Bar */}
      <View style={[styles.searchContainer, {backgroundColor: theme.colors.surface}]}>
        <Searchbar
          placeholder="Search emails..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
        />
        <Menu
          visible={menuVisible}
          onDismiss={() => setMenuVisible(false)}
          anchor={
            <IconButton
              icon="filter-variant"
              onPress={() => setMenuVisible(true)}
              iconColor={theme.colors.onSurface}
            />
          }>
          <Menu.Item
            onPress={() => {
              setSortBy('date');
              setMenuVisible(false);
            }}
            title="Sort by Date"
            leadingIcon={sortBy === 'date' ? 'check' : undefined}
          />
          <Menu.Item
            onPress={() => {
              setSortBy('sender');
              setMenuVisible(false);
            }}
            title="Sort by Sender"
            leadingIcon={sortBy === 'sender' ? 'check' : undefined}
          />
          <Menu.Item
            onPress={() => {
              setSortBy('subject');
              setMenuVisible(false);
            }}
            title="Sort by Subject"
            leadingIcon={sortBy === 'subject' ? 'check' : undefined}
          />
          <Menu.Item
            onPress={() => {
              setFilterUnread(!filterUnread);
              setMenuVisible(false);
            }}
            title="Show Unread Only"
            leadingIcon={filterUnread ? 'check' : undefined}
          />
          <Menu.Item
            onPress={() => {
              markAllAsRead();
              setMenuVisible(false);
            }}
            title="Mark All as Read"
            leadingIcon="email-open"
          />
          <Menu.Item
            onPress={() => {
              clearAllEmails();
              setMenuVisible(false);
            }}
            title="Clear All"
            leadingIcon="delete"
          />
        </Menu>
      </View>

      {/* Email Count */}
      {currentEmail && (
        <View style={[styles.emailCount, {backgroundColor: theme.colors.surface}]}>
          <Text
            variant="bodyMedium"
            style={[styles.countText, {color: theme.colors.onSurfaceVariant}]}>
            {filteredEmails.length} email{filteredEmails.length !== 1 ? 's' : ''}
            {unreadCount > 0 && ` • ${unreadCount} unread`}
          </Text>
        </View>
      )}

      {/* Email List */}
      <FlatList
        data={filteredEmails}
        renderItem={renderEmailItem}
        keyExtractor={item => item.id}
        refreshControl={
          <RefreshControl 
            refreshing={isRefreshing} 
            onRefresh={handleRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={
          filteredEmails.length === 0 ? styles.emptyContainer : styles.listContainer
        }
        showsVerticalScrollIndicator={false}
        style={{backgroundColor: theme.colors.background}}
      />

      {/* Banner Ad */}
      <BannerAdComponent style={[styles.bannerAd, {backgroundColor: theme.colors.surface, borderTopColor: theme.colors.outline}]} />

      {/* Floating Action Button */}
      <FAB
        icon="refresh"
        style={[styles.fab, {backgroundColor: theme.colors.primary}]}
        onPress={handleRefresh}
        disabled={isRefreshing || isLoading}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  searchbar: {
    flex: 1,
    marginRight: 8,
  },
  emailCount: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  countText: {
    fontSize: 14,
  },
  listContainer: {
    paddingBottom: 120, // Dynamic space that adjusts when ads load
  },
  emptyContainer: {
    flex: 1,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 80, // Adjusted to account for banner ad and safe area
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
  },
  bannerAd: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderTopWidth: 1,
  },
});

export default InboxScreen;

