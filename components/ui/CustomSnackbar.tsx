import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeColor } from '../../hooks/useThemeColor';
import { ThemedText } from '../ThemedText';
import { ThemedView } from '../ThemedView';
import { IconSymbol } from './IconSymbol';

export interface SnackbarAction {
  label: string;
  onPress: () => void;
}

export interface SnackbarProps {
  visible: boolean;
  message: string;
  action?: SnackbarAction;
  duration?: number;
  onDismiss: () => void;
  type?: 'default' | 'success' | 'error' | 'warning' | 'info';
}

export function CustomSnackbar({
  visible,
  message,
  action,
  duration = 4000,
  onDismiss,
  type = 'default',
}: SnackbarProps) {
  const insets = useSafeAreaInsets();
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');
  
  const translateY = useRef(new Animated.Value(100)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const getSnackbarColors = () => {
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
          background: '#1F2937', 
          text: '#FFFFFF',
          icon: 'info.circle.fill'
        };
    }
  };

  const colors = getSnackbarColors();

  useEffect(() => {
    if (visible) {
      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Animate in
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto dismiss after duration
      if (duration > 0) {
        timeoutRef.current = setTimeout(() => {
          handleDismiss();
        }, duration);
      }
    } else {
      handleDismiss();
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [visible, duration]);

  const handleDismiss = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 100,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onDismiss();
    });
  };

  const handleActionPress = () => {
    if (action) {
      action.onPress();
      handleDismiss();
    }
  };

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.snackbarContainer,
        {
          bottom: insets.bottom + 20,
          transform: [{ translateY }],
          opacity,
        },
      ]}
    >
      <ThemedView
        style={[
          styles.snackbar,
          {
            backgroundColor: colors.background,
          },
        ]}
      >
        <ThemedView style={[styles.content, { backgroundColor: 'transparent' }]}>
          <IconSymbol name={colors.icon} size={22} color={colors.text} />
          <ThemedText style={[styles.message, { color: colors.text }]} numberOfLines={3}>
            {message}
          </ThemedText>
        </ThemedView>

        <ThemedView style={[styles.actions, { backgroundColor: 'transparent' }]}>
          {action && (
            <Pressable
              style={({ pressed }) => [
                styles.actionButton,
                {
                  backgroundColor: pressed ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.1)',
                },
              ]}
              onPress={handleActionPress}
            >
              <ThemedText style={[styles.actionText, { color: colors.text }]}>
                {action.label}
              </ThemedText>
            </Pressable>
          )}

          <Pressable
            style={({ pressed }) => [
              styles.dismissButton,
              {
                backgroundColor: pressed ? 'rgba(255,255,255,0.2)' : 'transparent',
              },
            ]}
            onPress={handleDismiss}
          >
            <IconSymbol name="xmark" size={18} color={colors.text} />
          </Pressable>
        </ThemedView>
      </ThemedView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  snackbarContainer: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 9999,
  },
  snackbar: {
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
    minHeight: 60,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  message: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    lineHeight: 22,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginLeft: 8,
  },
  actionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  dismissButton: {
    padding: 8,
    borderRadius: 8,
  },
}); 