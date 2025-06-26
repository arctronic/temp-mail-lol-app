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
  const { activeTheme } = useThemePreference();
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const cardColor = useThemeColor({}, 'card');

  const getToastColors = (type: string) => {
    const isDark = activeTheme === 'dark';
    
    switch (type) {
      case 'success':
        return { 
          background: '#10B981', 
          text: '#FFFFFF',
          icon: 'checkmark.circle.fill'
        };
      case 'error':
        return { 
          background: '#EF4444', 
          text: '#FFFFFF',
          icon: 'xmark.circle.fill'
        };
      case 'warning':
        return { 
          background: '#F59E0B', 
          text: '#FFFFFF',
          icon: 'exclamationmark.triangle.fill'
        };
      case 'info':
        return { 
          background: '#3B82F6', 
          text: '#FFFFFF',
          icon: 'info.circle.fill'
        };
      default:
        return { 
          background: isDark ? '#374151' : '#F3F4F6', 
          text: isDark ? '#FFFFFF' : '#1F2937',
          icon: 'info.circle.fill'
        };
    }
  };

  if (toasts.length === 0) return null;

  return (
    <View style={styles.toastContainer} pointerEvents="box-none">
      {toasts.map((toast, index) => {
        const colors = getToastColors(toast.type);
        
        return (
          <Animated.View
            key={toast.id}
            style={[
              styles.toast,
              {
                backgroundColor: colors.background,
                bottom: 80 + (index * 80), // Stack toasts from bottom with more spacing
              }
            ]}
            entering={FadeInUp.duration(300).springify()}
            exiting={FadeOutDown.duration(200)}
          >
            <View style={styles.toastContent}>
              <IconSymbol name={colors.icon} size={22} color={colors.text} />
              <ThemedText 
                style={[styles.toastText, { color: colors.text }]}
                numberOfLines={3}
              >
                {toast.message}
              </ThemedText>
            </View>
            
            {toast.action && (
              <Pressable
                style={[styles.toastAction, { borderColor: 'rgba(255,255,255,0.3)' }]}
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
              <IconSymbol name="xmark" size={18} color={colors.text} />
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
  // Task 3.3: Enhanced Toast Styles
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
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 12,
    minHeight: 64,
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
    lineHeight: 22,
  },
  toastAction: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginLeft: 12,
    borderRadius: 8,
    borderWidth: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  toastActionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  toastClose: {
    padding: 8,
    marginLeft: 8,
    borderRadius: 8,
  },
}); 