import React, {useState, useEffect} from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {
  Text,
  Card,
  Button,
  TextInput,
  Chip,
  FAB,
  useTheme,
  Divider,
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';

import {TempEmailAddress} from '../types';
import ApiService from '../services/ApiService';
import StorageService from '../services/StorageService';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorState from '../components/ErrorState';
import CopyButton from '../components/CopyButton';
import BannerAdComponent from '../components/BannerAdComponent';
import AdMobService from '../services/AdMobService';

const HomeScreen: React.FC = () => {
  const theme = useTheme();
  const [currentEmail, setCurrentEmail] = useState<TempEmailAddress | null>(null);
  const [emailHistory, setEmailHistory] = useState<TempEmailAddress[]>([]);
  const [customPrefix, setCustomPrefix] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setIsLoading(true);
      const [savedEmail, history] = await Promise.all([
        StorageService.getCurrentEmail(),
        StorageService.getEmailHistory(),
      ]);

      if (savedEmail) {
        setCurrentEmail(savedEmail);
        ApiService.setCurrentEmail(savedEmail.email);
      }
      setEmailHistory(history);
    } catch (err) {
      console.error('Load initial data error:', err);
      setError('Failed to load saved data');
    } finally {
      setIsLoading(false);
    }
  };

  const generateNewEmail = async (prefix?: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await ApiService.generateEmail(prefix || undefined);
      
      if (response.success && response.data) {
        const newEmail = response.data;
        setCurrentEmail(newEmail);
        
        // Save to storage
        await StorageService.setCurrentEmail(newEmail);
        await StorageService.addToEmailHistory(newEmail);
        
        // Update history
        const updatedHistory = await StorageService.getEmailHistory();
        setEmailHistory(updatedHistory);
        
        setCustomPrefix('');

        // Show interstitial ad strategically
        AdMobService.showAdOnAction('email_generated');
      } else {
        setError(response.message || 'Failed to generate email');
      }
    } catch (err) {
      console.error('Generate email error:', err);
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadInitialData();
    setIsRefreshing(false);
  };

  const selectEmailFromHistory = async (email: TempEmailAddress) => {
    try {
      setCurrentEmail(email);
      ApiService.setCurrentEmail(email.email);
      await StorageService.setCurrentEmail(email);
    } catch (err) {
      console.error('Select email error:', err);
    }
  };

  const clearCurrentEmail = async () => {
    Alert.alert(
      'Clear Email',
      'Are you sure you want to clear the current email address?',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            setCurrentEmail(null);
            await StorageService.clearCurrentEmail();
            ApiService.setCurrentEmail('');
          },
        },
      ]
    );
  };

  const getTimeRemaining = (expiresAt: string): string => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diffInMinutes = Math.max(0, Math.floor((expiry.getTime() - now.getTime()) / (1000 * 60)));
    
    if (diffInMinutes === 0) {
      return 'Expired';
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes}m left`;
    } else {
      const hours = Math.floor(diffInMinutes / 60);
      const minutes = diffInMinutes % 60;
      return `${hours}h ${minutes}m left`;
    }
  };

  if (isLoading && !currentEmail) {
    return <LoadingSpinner message="Loading..." />;
  }

  if (error && !currentEmail) {
    return (
      <ErrorState
        message={error}
        onAction={() => {
          setError(null);
          loadInitialData();
        }}
      />
    );
  }

  return (
    <SafeAreaView style={[styles.container, {backgroundColor: theme.colors.background}]} edges={['bottom']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        refreshControl={
          <RefreshControl 
            refreshing={isRefreshing} 
            onRefresh={handleRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }>
        
        {/* Current Email Section */}
        {currentEmail ? (
          <Card style={[styles.card, {backgroundColor: theme.colors.primaryContainer}]}>
            <Card.Content style={styles.cardContent}>
              <View style={styles.emailHeader}>
                <Icon
                  name="email"
                  size={24}
                  color={theme.colors.onPrimaryContainer}
                />
                <Text
                  variant="titleMedium"
                  style={[styles.sectionTitle, {color: theme.colors.onPrimaryContainer}]}>
                  Your Temporary Email
                </Text>
              </View>
              
              <View style={styles.emailDisplay}>
                <Text
                  variant="headlineSmall"
                  style={[styles.emailText, {color: theme.colors.onPrimaryContainer}]}>
                  {currentEmail.email}
                </Text>
                <CopyButton
                  text={currentEmail.email}
                  iconColor={theme.colors.onPrimaryContainer}
                  successMessage="Email copied!"
                />
              </View>
              
              <View style={styles.emailInfo}>
                <Chip
                  icon="schedule"
                  style={[styles.chip, {backgroundColor: theme.colors.surface}]}
                  textStyle={{color: theme.colors.onSurface}}>
                  {getTimeRemaining(currentEmail.expiresAt)}
                </Chip>
                <Button
                  mode="text"
                  onPress={clearCurrentEmail}
                  textColor={theme.colors.onPrimaryContainer}
                  style={styles.clearButton}>
                  Clear
                </Button>
              </View>
            </Card.Content>
          </Card>
        ) : (
          <Card style={styles.card}>
            <Card.Content style={styles.cardContent}>
              <View style={styles.emailHeader}>
                <Icon
                  name="add-circle-outline"
                  size={24}
                  color={theme.colors.primary}
                />
                <Text
                  variant="titleMedium"
                  style={[styles.sectionTitle, {color: theme.colors.onSurface}]}>
                  Generate Temporary Email
                </Text>
              </View>
              
              <Text
                variant="bodyMedium"
                style={[styles.description, {color: theme.colors.onSurfaceVariant}]}>
                Create a temporary email address that expires in 10 minutes.
                Perfect for signups, downloads, and protecting your privacy.
              </Text>
            </Card.Content>
          </Card>
        )}

        {/* Generate Email Section */}
        <Card style={styles.card}>
          <Card.Content style={styles.cardContent}>
            <Text
              variant="titleMedium"
              style={[styles.sectionTitle, {color: theme.colors.onSurface}]}>
              Custom Prefix (Optional)
            </Text>
            
            <TextInput
              mode="outlined"
              placeholder="Enter custom prefix"
              value={customPrefix}
              onChangeText={setCustomPrefix}
              style={styles.textInput}
              maxLength={20}
              autoCapitalize="none"
              autoCorrect={false}
            />
            
            <Button
              mode="contained"
              onPress={() => generateNewEmail(customPrefix)}
              loading={isLoading}
              disabled={isLoading}
              style={styles.generateButton}
              contentStyle={styles.buttonContent}>
              <Icon name="refresh" size={20} color={theme.colors.onPrimary} />
              {currentEmail ? 'Generate New Email' : 'Generate Email'}
            </Button>
            
            <Button
              mode="outlined"
              onPress={() => generateNewEmail(ApiService.generateRandomPrefix())}
              disabled={isLoading}
              style={styles.randomButton}
              contentStyle={styles.buttonContent}>
              <Icon name="shuffle" size={20} color={theme.colors.primary} />
              Random Email
            </Button>
          </Card.Content>
        </Card>

        {/* Email History Section */}
        {emailHistory.length > 0 && (
          <Card style={styles.card}>
            <Card.Content style={styles.cardContent}>
              <Text
                variant="titleMedium"
                style={[styles.sectionTitle, {color: theme.colors.onSurface}]}>
                Recent Email Addresses
              </Text>
              
              <View style={styles.historyList}>
                {emailHistory.slice(0, 5).map((email, index) => (
                  <View key={email.id}>
                    <View style={styles.historyItem}>
                      <View style={styles.historyInfo}>
                        <Text
                          variant="bodyMedium"
                          style={[styles.historyEmail, {color: theme.colors.onSurface}]}>
                          {email.email}
                        </Text>
                        <Text
                          variant="bodySmall"
                          style={[styles.historyDate, {color: theme.colors.onSurfaceVariant}]}>
                          {new Date(email.createdAt).toLocaleDateString()}
                        </Text>
                      </View>
                      <View style={styles.historyActions}>
                        <CopyButton
                          text={email.email}
                          size={20}
                          successMessage="Email copied!"
                        />
                        <Button
                          mode="text"
                          onPress={() => selectEmailFromHistory(email)}
                          disabled={currentEmail?.email === email.email}
                          compact>
                          {currentEmail?.email === email.email ? 'Active' : 'Use'}
                        </Button>
                      </View>
                    </View>
                    {index < emailHistory.length - 1 && index < 4 && (
                      <Divider style={styles.divider} />
                    )}
                  </View>
                ))}
              </View>
            </Card.Content>
          </Card>
        )}

        {/* Info Section */}
        <Card style={styles.card}>
          <Card.Content style={styles.cardContent}>
            <Text
              variant="titleMedium"
              style={[styles.sectionTitle, {color: theme.colors.onSurface}]}>
              How it works
            </Text>
            
            <View style={styles.infoList}>
              <View style={styles.infoItem}>
                <Icon name="timer" size={20} color={theme.colors.primary} />
                <Text
                  variant="bodyMedium"
                  style={[styles.infoText, {color: theme.colors.onSurface}]}>
                  Emails expire automatically in 10 minutes
                </Text>
              </View>
              
              <View style={styles.infoItem}>
                <Icon name="security" size={20} color={theme.colors.primary} />
                <Text
                  variant="bodyMedium"
                  style={[styles.infoText, {color: theme.colors.onSurface}]}>
                  No registration required, completely anonymous
                </Text>
              </View>
              
              <View style={styles.infoItem}>
                <Icon name="refresh" size={20} color={theme.colors.primary} />
                <Text
                  variant="bodyMedium"
                  style={[styles.infoText, {color: theme.colors.onSurface}]}>
                  Generate unlimited temporary addresses
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>
      </ScrollView>

      {/* Banner Ad */}
      <BannerAdComponent style={[styles.bannerAd, {backgroundColor: theme.colors.surface}]} />

      {/* Floating Action Button */}
      <FAB
        icon="add"
        style={[styles.fab, {backgroundColor: theme.colors.primary}]}
        onPress={() => generateNewEmail()}
        disabled={isLoading}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingBottom: 120, // Dynamic space that adjusts when ads load
  },
  card: {
    marginHorizontal: 16,
    marginVertical: 8,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  cardContent: {
    padding: 16,
  },
  emailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    marginLeft: 8,
    fontWeight: '600',
  },
  emailDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  emailText: {
    flex: 1,
    fontWeight: '500',
  },
  emailInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  chip: {
    alignSelf: 'flex-start',
  },
  clearButton: {
    marginLeft: 8,
  },
  description: {
    lineHeight: 20,
    marginBottom: 16,
  },
  textInput: {
    marginBottom: 16,
  },
  generateButton: {
    marginBottom: 8,
  },
  randomButton: {
    marginBottom: 8,
  },
  buttonContent: {
    paddingVertical: 4,
  },
  historyList: {
    marginTop: 8,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  historyInfo: {
    flex: 1,
  },
  historyEmail: {
    fontWeight: '500',
  },
  historyDate: {
    marginTop: 2,
  },
  historyActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  divider: {
    marginVertical: 4,
  },
  infoList: {
    marginTop: 8,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoText: {
    marginLeft: 12,
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
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
});

export default HomeScreen;

