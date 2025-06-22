import * as NavigationBar from 'expo-navigation-bar';
import { usePathname } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { ReactNode, useEffect } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import Animated, {
    FadeInUp,
    FadeOutDown
} from 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useNotification } from '../../contexts/NotificationContext';
import { useThemePreference } from '../../contexts/ThemeContext';
import { useThemeColor } from '../../hooks/useThemeColor';
import { ThemedText } from '../ThemedText';
import { FloatingInboxButton } from './FloatingInboxButton';
import { IconSymbol } from './IconSymbol';


// Task 3.3: Global Toast Component
const ToastContainer = () => {
  const { toasts, hideToast } = useNotification();
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');

  const getToastColors = (type: string) => {
    switch (type) {
      case 'success':
        return { background: '#4CAF50', text: '#FFFFFF' };
      case 'error':
        return { background: '#F44336', text: '#FFFFFF' };
      case 'warning':
        return { background: '#FF9800', text: '#FFFFFF' };
      default:
        return { background: tintColor, text: '#FFFFFF' };
    }
  };

  const getToastIcon = (type: string) => {
    switch (type) {
      case 'success':
        return 'checkmark.circle.fill';
      case 'error':
        return 'xmark.circle.fill';
      case 'warning':
        return 'exclamationmark.triangle.fill';
      default:
        return 'info.circle.fill';
    }
  };

  if (toasts.length === 0) return null;

  return (
    <View style={styles.toastContainer} pointerEvents="box-none">
      {toasts.map((toast, index) => {
        const colors = getToastColors(toast.type);
        const icon = getToastIcon(toast.type);
        
        return (
          <Animated.View
            key={toast.id}
            style={[
              styles.toast,
              {
                backgroundColor: colors.background,
                bottom: 60 + (index * 70), // Stack toasts from bottom
              }
            ]}
            entering={FadeInUp.duration(300).springify()}
            exiting={FadeOutDown.duration(200)}
          >
            <View style={styles.toastContent}>
              <IconSymbol name={icon} size={20} color={colors.text} />
              <ThemedText 
                style={[styles.toastText, { color: colors.text }]}
                numberOfLines={2}
              >
                {toast.message}
              </ThemedText>
            </View>
            
            {toast.action && (
              <Pressable
                style={styles.toastAction}
                onPress={() => {
                  toast.action?.onPress();
                  hideToast(toast.id);
                }}
              >
                <ThemedText style={[styles.toastActionText, { color: colors.text }]}>
                  {toast.action.label}
                </ThemedText>
              </Pressable>
            )}
            
            <Pressable
              style={styles.toastClose}
              onPress={() => hideToast(toast.id)}
            >
              <IconSymbol name="xmark" size={16} color={colors.text} />
            </Pressable>
          </Animated.View>
        );
      })}
    </View>
  );
};

interface GlobalLayoutProps {
  children: ReactNode;
}

export const GlobalLayout = ({ children }: GlobalLayoutProps) => {
  const pathname = usePathname();
  const { activeTheme } = useThemePreference();
  const backgroundColor = useThemeColor({}, 'background');
  
  // Configure Android navigation bar
  useEffect(() => {
    if (Platform.OS === 'android') {
      NavigationBar.setBackgroundColorAsync(backgroundColor);
      NavigationBar.setButtonStyleAsync(activeTheme === 'dark' ? 'light' : 'dark');
    }
  }, [activeTheme, backgroundColor]);
  
  return (
    <SafeAreaProvider>
      <View style={[styles.container, { backgroundColor }]}>
        <StatusBar 
          style={activeTheme === 'dark' ? 'light' : 'dark'} 
          backgroundColor={backgroundColor}
          translucent={false}
        />
        {children}
        <FloatingInboxButton currentRoute={pathname} />
        {/* Task 3.3: Global Toast System */}
        <ToastContainer />
      </View>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  // Task 3.3: Toast Styles
  toastContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    pointerEvents: 'box-none',
  },
  toast: {
    position: 'absolute',
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    minHeight: 56,
  },
  toastContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  toastText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    lineHeight: 20,
  },
  toastAction: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginLeft: 8,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  toastActionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  toastClose: {
    padding: 4,
    marginLeft: 8,
  },
}); 