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
  type?: 'default' | 'success' | 'error' | 'warning';
}

export function CustomSnackbar({
  visible,
  message,
  action,
  duration = 3000,
  onDismiss,
  type = 'default',
}: SnackbarProps) {
  const insets = useSafeAreaInsets();
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');
  const borderColor = useThemeColor({}, 'border');
  
  const translateY = useRef(new Animated.Value(100)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const getSnackbarColors = () => {
    switch (type) {
      case 'success':
        return { background: '#4CAF50', text: '#FFFFFF' };
      case 'error':
        return { background: '#F44336', text: '#FFFFFF' };
      case 'warning':
        return { background: '#FF9800', text: '#FFFFFF' };
      default:
        return { background: backgroundColor, text: textColor };
    }
  };

  const getSnackbarIcon = () => {
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

  const colors = getSnackbarColors();
  const icon = getSnackbarIcon();

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
          bottom: insets.bottom + 16,
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
            borderColor: type === 'default' ? borderColor : colors.background,
          },
        ]}
      >
        <ThemedView style={styles.content}>
          <IconSymbol name={icon} size={20} color={colors.text} />
          <ThemedText style={[styles.message, { color: colors.text }]} numberOfLines={2}>
            {message}
          </ThemedText>
        </ThemedView>

        <ThemedView style={styles.actions}>
          {action && (
            <Pressable
              style={({ pressed }) => [
                styles.actionButton,
                {
                  backgroundColor: pressed ? `${colors.text}20` : 'transparent',
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
                backgroundColor: pressed ? `${colors.text}20` : 'transparent',
              },
            ]}
            onPress={handleDismiss}
          >
            <IconSymbol name="xmark" size={16} color={colors.text} />
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
    zIndex: 999,
  },
  snackbar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  message: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  dismissButton: {
    padding: 6,
    borderRadius: 6,
  },
}); 