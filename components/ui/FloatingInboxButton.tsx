import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from 'react-native-reanimated';
import { useThemeColor } from '../../hooks/useThemeColor';
import { ThemedText } from '../ThemedText';
import { IconSymbol } from './IconSymbol';

interface FloatingInboxButtonProps {
  currentRoute?: string;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const FloatingInboxButton = ({ currentRoute }: FloatingInboxButtonProps) => {
  const router = useRouter();
  const tintColor = useThemeColor({}, 'tint');
  
  // Task 3.6: Animation values
  const scale = useSharedValue(1);
  
  // Task 3.6: Animated styles
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  
  // Don't show on the inbox or drawer home pages, or lookup page
  const isOnInboxPage = 
    currentRoute === '/(drawer)' || 
    currentRoute === '/(drawer)/index' ||
    currentRoute === '/index' ||
    currentRoute === '/' ||
    currentRoute === '' ||
    !currentRoute || // Default route
    currentRoute?.includes('lookup') || // Hide on lookup page
    (currentRoute.includes('/(drawer)') && !currentRoute.includes('about') && !currentRoute.includes('settings'));
    
  if (isOnInboxPage) {
    return null;
  }
  
  // Change text and behavior based on the current route
  const isOnLookupPage = currentRoute?.includes('lookup');
  
  const handleNavigateToInbox = () => {
    // Task 3.6: Enhanced tap animation
    scale.value = withSpring(0.9, { damping: 10 }, (finished) => {
      if (finished) {
        scale.value = withSpring(1, { damping: 10 });
      }
    });
    
    // Trigger haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    // Small delay for visual feedback before navigation
    setTimeout(() => {
      router.replace('/(drawer)');
    }, 100);
  };
  
  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <AnimatedPressable
        style={[
          styles.button,
          { backgroundColor: tintColor },
        ]}
        onPress={handleNavigateToInbox}
      >
        <IconSymbol name="tray.fill" size={24} color="#FFFFFF" />
        <ThemedText style={styles.text}>
          {isOnLookupPage ? 'Back to Inbox' : 'Inbox'}
        </ThemedText>
      </AnimatedPressable>
    </Animated.View>
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
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 28,
    paddingVertical: 12,
    paddingHorizontal: 20,
    gap: 8,
    minHeight: 56,
  },
  text: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
}); 