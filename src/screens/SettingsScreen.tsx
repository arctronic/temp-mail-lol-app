import React, {useState, useEffect} from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  Linking,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {
  Text,
  Card,
  List,
  Switch,
  Button,
  Divider,
  useTheme,
  Dialog,
  Portal,
  RadioButton,
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';

import {AppSettings} from '../types';
import StorageService from '../services/StorageService';
import BannerAdComponent from '../components/BannerAdComponent';
import AdMobService from '../services/AdMobService';

const SettingsScreen: React.FC = () => {
  const theme = useTheme();
  const [settings, setSettings] = useState<AppSettings>({
    theme: 'auto',
    notifications: true,
    autoRefresh: true,
    refreshInterval: 30,
    defaultDomain: 'temp-mail.lol',
  });
  const [themeDialogVisible, setThemeDialogVisible] = useState(false);
  const [intervalDialogVisible, setIntervalDialogVisible] = useState(false);
  const [storageSize, setStorageSize] = useState(0);

  useEffect(() => {
    loadSettings();
    loadStorageSize();
    
    // Show ad when settings are opened
    AdMobService.showAdOnAction('settings_opened');
  }, []);

  const loadSettings = async () => {
    try {
      const savedSettings = await StorageService.getSettings();
      setSettings(savedSettings);
    } catch (err) {
      console.error('Load settings error:', err);
    }
  };

  const loadStorageSize = async () => {
    try {
      const size = await StorageService.getStorageSize();
      setStorageSize(size);
    } catch (err) {
      console.error('Load storage size error:', err);
    }
  };

  const updateSetting = async <K extends keyof AppSettings>(
    key: K,
    value: AppSettings[K]
  ) => {
    try {
      const updatedSettings = {...settings, [key]: value};
      setSettings(updatedSettings);
      await StorageService.setSettings({[key]: value});
    } catch (err) {
      console.error('Update setting error:', err);
    }
  };

  const clearAllData = () => {
    Alert.alert(
      'Clear All Data',
      'This will delete all saved emails, history, and settings. This action cannot be undone.',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            try {
              await StorageService.clearAllData();
              await loadSettings();
              await loadStorageSize();
              Alert.alert('Success', 'All data has been cleared.');
            } catch (err) {
              console.error('Clear data error:', err);
              Alert.alert('Error', 'Failed to clear data.');
            }
          },
        },
      ]
    );
  };

  const resetSettings = () => {
    Alert.alert(
      'Reset Settings',
      'This will reset all settings to their default values.',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            try {
              await StorageService.resetSettings();
              await loadSettings();
              Alert.alert('Success', 'Settings have been reset.');
            } catch (err) {
              console.error('Reset settings error:', err);
              Alert.alert('Error', 'Failed to reset settings.');
            }
          },
        },
      ]
    );
  };

  const openUrl = (url: string) => {
    Linking.openURL(url).catch(err => {
      console.error('Open URL error:', err);
      Alert.alert('Error', 'Failed to open link.');
    });
  };

  const formatStorageSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getThemeLabel = (theme: string): string => {
    switch (theme) {
      case 'light':
        return 'Light';
      case 'dark':
        return 'Dark';
      case 'auto':
        return 'System Default';
      default:
        return 'System Default';
    }
  };

  const getIntervalLabel = (interval: number): string => {
    if (interval < 60) {
      return `${interval} seconds`;
    } else {
      const minutes = Math.floor(interval / 60);
      return `${minutes} minute${minutes > 1 ? 's' : ''}`;
    }
  };

  return (
    <SafeAreaView style={[styles.container, {backgroundColor: theme.colors.background}]} edges={['bottom']}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
      >
        
        {/* App Settings */}
        <Card style={styles.card}>
        <Card.Content>
          <Text
            variant="titleMedium"
            style={[styles.sectionTitle, {color: theme.colors.onSurface}]}>
            App Settings
          </Text>
          
          <List.Item
            title="Theme"
            description={getThemeLabel(settings.theme)}
            left={props => <List.Icon {...props} icon="palette" />}
            right={() => (
              <Icon name="chevron-right" size={24} color={theme.colors.onSurfaceVariant} />
            )}
            onPress={() => setThemeDialogVisible(true)}
          />
          
          <Divider />
          
          <List.Item
            title="Notifications"
            description="Get notified when new emails arrive"
            left={props => <List.Icon {...props} icon="notifications" />}
            right={() => (
              <Switch
                value={settings.notifications}
                onValueChange={value => updateSetting('notifications', value)}
              />
            )}
          />
          
          <Divider />
          
          <List.Item
            title="Auto Refresh"
            description="Automatically check for new emails"
            left={props => <List.Icon {...props} icon="refresh" />}
            right={() => (
              <Switch
                value={settings.autoRefresh}
                onValueChange={value => updateSetting('autoRefresh', value)}
              />
            )}
          />
          
          {settings.autoRefresh && (
            <>
              <Divider />
              <List.Item
                title="Refresh Interval"
                description={getIntervalLabel(settings.refreshInterval)}
                left={props => <List.Icon {...props} icon="timer" />}
                right={() => (
                  <Icon name="chevron-right" size={24} color={theme.colors.onSurfaceVariant} />
                )}
                onPress={() => setIntervalDialogVisible(true)}
              />
            </>
          )}
        </Card.Content>
      </Card>

      {/* Storage & Data */}
      <Card style={styles.card}>
        <Card.Content>
          <Text
            variant="titleMedium"
            style={[styles.sectionTitle, {color: theme.colors.onSurface}]}>
            Storage & Data
          </Text>
          
          <List.Item
            title="Storage Used"
            description={formatStorageSize(storageSize)}
            left={props => <List.Icon {...props} icon="storage" />}
          />
          
          <Divider />
          
          <List.Item
            title="Clear All Data"
            description="Delete all emails, history, and settings"
            left={props => <List.Icon {...props} icon="delete" />}
            onPress={clearAllData}
          />
          
          <Divider />
          
          <List.Item
            title="Reset Settings"
            description="Reset all settings to default values"
            left={props => <List.Icon {...props} icon="restore" />}
            onPress={resetSettings}
          />
        </Card.Content>
      </Card>

      {/* About */}
      <Card style={styles.card}>
        <Card.Content>
          <Text
            variant="titleMedium"
            style={[styles.sectionTitle, {color: theme.colors.onSurface}]}>
            About
          </Text>
          
          <List.Item
            title="Version"
            description="1.0.0"
            left={props => <List.Icon {...props} icon="info" />}
          />
          
          <Divider />
          
          <List.Item
            title="Website"
            description="temp-mail.lol"
            left={props => <List.Icon {...props} icon="web" />}
            onPress={() => openUrl('https://temp-mail.lol')}
          />
          
          <Divider />
          
          <List.Item
            title="Privacy Policy"
            description="Learn how we protect your privacy"
            left={props => <List.Icon {...props} icon="shield-check" />}
            onPress={() => openUrl('https://temp-mail.lol/privacy')}
          />
          
          <Divider />
          
          <List.Item
            title="Terms of Service"
            description="Read our terms and conditions"
            left={props => <List.Icon {...props} icon="file-document" />}
            onPress={() => openUrl('https://temp-mail.lol/terms')}
          />
          
          <Divider />
          
          <List.Item
            title="Rate App"
            description="Rate us on Google Play Store"
            left={props => <List.Icon {...props} icon="star" />}
            onPress={() => openUrl('https://play.google.com/store/apps/details?id=com.tronics.tempmail')}
          />
        </Card.Content>
      </Card>

      {/* Support */}
      <Card style={styles.card}>
        <Card.Content>
          <Text
            variant="titleMedium"
            style={[styles.sectionTitle, {color: theme.colors.onSurface}]}>
            Support
          </Text>
          
          <Text
            variant="bodyMedium"
            style={[styles.supportText, {color: theme.colors.onSurfaceVariant}]}>
            Need help or have feedback? We'd love to hear from you!
          </Text>
          
          <View style={styles.supportButtons}>
            <Button
              mode="outlined"
              onPress={() => openUrl('mailto:support@temp-mail.lol')}
              style={styles.supportButton}
              icon="email">
              Contact Support
            </Button>
            
            <Button
              mode="outlined"
              onPress={() => openUrl('https://temp-mail.lol/help')}
              style={styles.supportButton}
              icon="help-circle">
              Help Center
            </Button>
          </View>
        </Card.Content>
      </Card>

      {/* Theme Dialog */}
      <Portal>
        <Dialog
          visible={themeDialogVisible}
          onDismiss={() => setThemeDialogVisible(false)}>
          <Dialog.Title>Choose Theme</Dialog.Title>
          <Dialog.Content>
            <RadioButton.Group
              onValueChange={value => updateSetting('theme', value as 'light' | 'dark' | 'auto')}
              value={settings.theme}>
              <RadioButton.Item label="Light" value="light" />
              <RadioButton.Item label="Dark" value="dark" />
              <RadioButton.Item label="System Default" value="auto" />
            </RadioButton.Group>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setThemeDialogVisible(false)}>Done</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* Refresh Interval Dialog */}
      <Portal>
        <Dialog
          visible={intervalDialogVisible}
          onDismiss={() => setIntervalDialogVisible(false)}>
          <Dialog.Title>Refresh Interval</Dialog.Title>
          <Dialog.Content>
            <RadioButton.Group
              onValueChange={value => updateSetting('refreshInterval', parseInt(value))}
              value={settings.refreshInterval.toString()}>
              <RadioButton.Item label="15 seconds" value="15" />
              <RadioButton.Item label="30 seconds" value="30" />
              <RadioButton.Item label="1 minute" value="60" />
              <RadioButton.Item label="2 minutes" value="120" />
              <RadioButton.Item label="5 minutes" value="300" />
            </RadioButton.Group>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setIntervalDialogVisible(false)}>Done</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
      </ScrollView>

      {/* Banner Ad */}
      <BannerAdComponent style={[styles.bannerAd, {backgroundColor: theme.colors.surface, borderTopColor: theme.colors.outline}]} />
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
    paddingBottom: 80, // Dynamic space that adjusts when ads load
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
  sectionTitle: {
    marginBottom: 8,
    fontWeight: '600',
  },
  supportText: {
    marginBottom: 16,
    lineHeight: 20,
  },
  supportButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  supportButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  bannerAd: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderTopWidth: 1,
  },
});

export default SettingsScreen;

