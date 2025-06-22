import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useThemeColor } from '../../hooks/useThemeColor';
import { ThemedText } from '../ThemedText';
import { IconSymbol } from './IconSymbol';

interface FloatingInboxButtonProps {
  currentRoute?: string;
}

export const FloatingInboxButton = ({ currentRoute }: FloatingInboxButtonProps) => {
  const router = useRouter();
  const tintColor = useThemeColor({}, 'tint');
  
  // Don't show on the inbox or drawer home pages
  // More comprehensive route checking for inbox pages
  const isOnInboxPage = 
    currentRoute === '/(drawer)' || 
    currentRoute === '/(drawer)/index' ||
    currentRoute === '/index' ||
    currentRoute === '/' ||
    currentRoute === '' ||
    !currentRoute || // Default route
    (currentRoute.includes('/(drawer)') && !currentRoute.includes('lookup') && !currentRoute.includes('about') && !currentRoute.includes('settings'));
    
  // Debug: Log the current route to understand the issue
  console.log('FloatingInboxButton - Current route:', currentRoute, 'Should hide:', isOnInboxPage);
    
  if (isOnInboxPage) {
    return null;
  }
  
  // Change text and behavior based on the current route
  const isOnLookupPage = currentRoute?.includes('lookup');
  
  const handleNavigateToInbox = () => {
    // Trigger haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    // Navigate to the inbox page
    router.replace('/(drawer)');
  };
  
  return (
    <View style={styles.container}>
      <Pressable
        style={({ pressed }) => [
          styles.button,
          { backgroundColor: tintColor, opacity: pressed ? 0.8 : 1 }
        ]}
        onPress={handleNavigateToInbox}
      >
        <IconSymbol name="tray.fill" size={24} color="#FFFFFF" />
        <ThemedText style={styles.text}>
          {isOnLookupPage ? 'Back to Inbox' : 'Inbox'}
        </ThemedText>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    zIndex: 100,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 28,
    paddingVertical: 12,
    paddingHorizontal: 20,
    gap: 8,
  },
  text: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
}); 