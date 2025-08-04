import React, {useEffect, useState} from 'react';
import {StatusBar, AppState, AppStateStatus, View} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {
  NavigationContainer,
  DefaultTheme,
  DarkTheme,
} from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {
  PaperProvider,
  MD3LightTheme,
  MD3DarkTheme,
  adaptNavigationTheme,
} from 'react-native-paper';
import {useColorScheme} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Screens
import HomeScreen from './src/screens/HomeScreen';
import InboxScreen from './src/screens/InboxScreen';
import SettingsScreen from './src/screens/SettingsScreen';

// Services
import AdMobService from './src/services/AdMobService';
import NotificationService from './src/services/NotificationService';
import StorageService from './src/services/StorageService';
import AppUtils from './src/utils/AppUtils';

// Types
import {AppSettings} from './src/types';

const Tab = createBottomTabNavigator();

// Custom theme colors
const customColors = {
  primary: '#26A69A',
  primaryContainer: '#B2DFDB',
  secondary: '#2196F3',
  secondaryContainer: '#BBDEFB',
  tertiary: '#FF9800',
  tertiaryContainer: '#FFE0B2',
  surface: '#FFFFFF',
  surfaceVariant: '#F5F5F5',
  background: '#FAFAFA',
  error: '#F44336',
  errorContainer: '#FFEBEE',
  onPrimary: '#FFFFFF',
  onPrimaryContainer: '#004D40',
  onSecondary: '#FFFFFF',
  onSecondaryContainer: '#0D47A1',
  onTertiary: '#FFFFFF',
  onTertiaryContainer: '#E65100',
  onSurface: '#1C1B1F',
  onSurfaceVariant: '#49454F',
  onError: '#FFFFFF',
  onErrorContainer: '#410E0B',
  onBackground: '#1C1B1F',
  outline: '#79747E',
  outlineVariant: '#CAC4D0',
  shadow: '#000000',
  scrim: '#000000',
  inverseSurface: '#313033',
  inverseOnSurface: '#F4EFF4',
  inversePrimary: '#4FD0C7',
  elevation: {
    level0: 'transparent',
    level1: '#F7F2FA',
    level2: '#F1ECF6',
    level3: '#ECE6F0',
    level4: '#E9E3ED',
    level5: '#E6E0E9',
  },
};

const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    ...customColors,
  },
};

const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#4FD0C7',
    primaryContainer: '#00695C',
    onPrimary: '#003732',
    onPrimaryContainer: '#6FF6ED',
    secondary: '#4ECDE6',
    secondaryContainer: '#004D56',
    onSecondary: '#003640',
    onSecondaryContainer: '#97F0FF',
    tertiary: '#FFB74D',
    tertiaryContainer: '#5A3F00',
    onTertiary: '#2E1F00',
    onTertiaryContainer: '#FFDC97',
    surface: '#121212',
    surfaceVariant: '#2A2A2A',
    background: '#0F0F0F',
    onSurface: '#E6E1E5',
    onSurfaceVariant: '#CAC4D0',
    onBackground: '#E6E1E5',
    outline: '#938F94',
    outlineVariant: '#49454F',
    error: '#FFB4AB',
    errorContainer: '#93000A',
    onError: '#690005',
    onErrorContainer: '#FFDAD6',
    inverseSurface: '#E6E1E5',
    inverseOnSurface: '#313033',
    inversePrimary: '#26A69A',
    shadow: '#000000',
    scrim: '#000000',
    elevation: {
      level0: 'transparent',
      level1: '#1E1E1E',
      level2: '#252525',
      level3: '#2D2D2D',
      level4: '#303030',
      level5: '#333333',
    },
  },
};

const {LightTheme, DarkTheme: NavigationDarkTheme} = adaptNavigationTheme({
  reactNavigationLight: DefaultTheme,
  reactNavigationDark: DarkTheme,
});

const App: React.FC = () => {
  const systemColorScheme = useColorScheme();
  const [appSettings, setAppSettings] = useState<AppSettings>({
    theme: 'auto',
    notifications: true,
    autoRefresh: true,
    refreshInterval: 30,
    defaultDomain: 'temp-mail.lol',
  });
  const [isInitialized, setIsInitialized] = useState(false);

  // Determine current theme
  const isDarkMode = appSettings.theme === 'dark' || 
    (appSettings.theme === 'auto' && systemColorScheme === 'dark');
  
  const paperTheme = isDarkMode ? darkTheme : lightTheme;
  const navigationTheme = isDarkMode ? NavigationDarkTheme : LightTheme;

  useEffect(() => {
    initializeApp();
    
    // Handle app state changes
    let appOpenAdShownThisSession = false;
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        AppUtils.logEvent('app_opened');
        
        // Show app open ad on first activation, then fallback to regular ad strategy
        if (!appOpenAdShownThisSession && AdMobService.isAppOpenReady()) {
          AdMobService.showAppOpenAd();
          appOpenAdShownThisSession = true;
        } else {
          AdMobService.showAdOnAction('app_opened');
        }
      } else if (nextAppState === 'background') {
        AppUtils.logEvent('app_backgrounded');
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    
    return () => {
      subscription?.remove();
    };
  }, []);

  const initializeApp = async () => {
    try {
      AppUtils.logEvent('app_initialize_start');
      
      // Load app settings
      const savedSettings = await StorageService.getSettings();
      setAppSettings(savedSettings);
      
      // Initialize services
      await Promise.all([
        NotificationService.initialize(),
        AdMobService.preloadAds(),
      ]);
      
      // Log memory usage in development
      AppUtils.logMemoryUsage();
      
      AppUtils.logEvent('app_initialize_complete');
      setIsInitialized(true);
    } catch (error) {
      AppUtils.logEvent('app_initialize_error', {error: error?.message});
      setIsInitialized(true); // Continue even if some services fail
    }
  };

  if (!isInitialized) {
    // You could show a splash screen here
    return null;
  }

  return (
    <SafeAreaProvider>
      <PaperProvider theme={paperTheme}>
        <StatusBar
          barStyle={isDarkMode ? 'light-content' : 'dark-content'}
          backgroundColor={paperTheme.colors.surface}
          translucent={false}
        />
        <NavigationContainer theme={navigationTheme}>
        <Tab.Navigator
          screenOptions={({route}) => ({
            tabBarIcon: ({focused, color, size}) => {
              let iconName: string;

              switch (route.name) {
                case 'Home':
                  iconName = focused ? 'home' : 'home';
                  break;
                case 'Inbox':
                  iconName = focused ? 'inbox' : 'inbox';
                  break;
                case 'Settings':
                  iconName = focused ? 'settings' : 'settings';
                  break;
                default:
                  iconName = 'help';
              }

              return <Icon name={iconName} size={size} color={color} />;
            },
            tabBarActiveTintColor: paperTheme.colors.primary,
            tabBarInactiveTintColor: paperTheme.colors.onSurfaceVariant,
            tabBarStyle: {
              backgroundColor: paperTheme.colors.surface,
              borderTopColor: paperTheme.colors.outline,
              paddingBottom: 8,
              paddingTop: 8,
              height: 64,
            },
            tabBarLabelStyle: {
              fontSize: 12,
              fontWeight: '500',
            },
            headerStyle: {
              backgroundColor: paperTheme.colors.surface,
              elevation: isDarkMode ? 8 : 4,
              shadowColor: isDarkMode ? '#000' : '#000',
              shadowOffset: {
                width: 0,
                height: 2,
              },
              shadowOpacity: isDarkMode ? 0.25 : 0.1,
              shadowRadius: 3.84,
              borderBottomWidth: 0, // Remove border, use shadow instead
              height: 56, // Standard Material Design header height
            },
            headerTitleStyle: {
              color: paperTheme.colors.onSurface,
              fontSize: 22,
              fontWeight: '700',
              letterSpacing: 0.5,
            },
            headerTintColor: paperTheme.colors.onSurface,
            headerTitleAlign: 'left' as const,
            headerLeftContainerStyle: {
              paddingLeft: 16,
            },
            headerRightContainerStyle: {
              paddingRight: 16,
            },
          })}>
          <Tab.Screen
            name="Home"
            component={HomeScreen}
            options={{
              title: 'Generate',
              headerTitle: 'Temp Mail',
              headerLeft: () => (
                <Icon 
                  name="email" 
                  size={24} 
                  color={paperTheme.colors.primary} 
                  style={{marginLeft: 4}}
                />
              ),
              headerRight: () => (
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                  <Icon 
                    name="info-outline" 
                    size={24} 
                    color={paperTheme.colors.onSurfaceVariant}
                    style={{marginRight: 4}}
                  />
                </View>
              ),
            }}
          />
          <Tab.Screen
            name="Inbox"
            component={InboxScreen}
            options={({navigation}) => ({
              title: 'Inbox',
              headerTitle: 'Inbox',
              headerLeft: () => (
                <Icon 
                  name="inbox" 
                  size={24} 
                  color={paperTheme.colors.primary} 
                  style={{marginLeft: 4}}
                />
              ),
              headerRight: () => (
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                  <Icon 
                    name="refresh" 
                    size={24} 
                    color={paperTheme.colors.onSurfaceVariant}
                    style={{marginRight: 12}}
                  />
                  <Icon 
                    name="more-vert" 
                    size={24} 
                    color={paperTheme.colors.onSurfaceVariant}
                    style={{marginRight: 4}}
                  />
                </View>
              ),
            })}
          />
          <Tab.Screen
            name="Settings"
            component={SettingsScreen}
            options={{
              title: 'Settings',
              headerTitle: 'Settings',
              headerLeft: () => (
                <Icon 
                  name="settings" 
                  size={24} 
                  color={paperTheme.colors.primary} 
                  style={{marginLeft: 4}}
                />
              ),
              headerRight: () => (
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                  <Icon 
                    name="help-outline" 
                    size={24} 
                    color={paperTheme.colors.onSurfaceVariant}
                    style={{marginRight: 4}}
                  />
                </View>
              ),
            }}
          />
        </Tab.Navigator>
        </NavigationContainer>
      </PaperProvider>
    </SafeAreaProvider>
  );
};

export default App;

