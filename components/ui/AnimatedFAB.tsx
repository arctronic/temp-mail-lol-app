import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet } from 'react-native';
import { FAB } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeColor } from '../../hooks/useThemeColor';
import { IconSymbol } from './IconSymbol';

interface AnimatedFABProps {
  visible: boolean;
  onPress: () => void;
  icon?: string;
  label?: string;
  disabled?: boolean;
}

export function AnimatedFAB({
  visible,
  onPress,
  icon = 'plus',
  label,
  disabled = false,
}: AnimatedFABProps) {
  const insets = useSafeAreaInsets();
  const tintColor = useThemeColor({}, 'tint');
  const scaleValue = useRef(new Animated.Value(visible ? 1 : 0)).current;
  const translateYValue = useRef(new Animated.Value(visible ? 0 : 100)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleValue, {
        toValue: visible ? 1 : 0,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }),
      Animated.timing(translateYValue, {
        toValue: visible ? 0 : 100,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start();
  }, [visible, scaleValue, translateYValue]);

  const animatedStyle = {
    transform: [
      { scale: scaleValue },
      { translateY: translateYValue },
    ],
  };

  return (
    <Animated.View
      style={[
        styles.fabContainer,
        {
          bottom: insets.bottom + 16,
          right: 16,
        },
        animatedStyle,
      ]}
      pointerEvents={visible ? 'auto' : 'none'}
    >
      <FAB
        icon={() => <IconSymbol name={icon} size={24} color="#ffffff" />}
        onPress={onPress}
        disabled={disabled}
        style={[
          styles.fab,
          {
            backgroundColor: disabled ? '#cccccc' : tintColor,
          },
        ]}
        label={label}
      />
    </Animated.View>
  );
}

// Alternative custom FAB implementation (if react-native-paper FAB has issues)
export function CustomAnimatedFAB({
  visible,
  onPress,
  icon = 'plus',
  label,
  disabled = false,
}: AnimatedFABProps) {
  const insets = useSafeAreaInsets();
  const tintColor = useThemeColor({}, 'tint');
  const scaleValue = useRef(new Animated.Value(visible ? 1 : 0)).current;
  const translateYValue = useRef(new Animated.Value(visible ? 0 : 100)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleValue, {
        toValue: visible ? 1 : 0,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }),
      Animated.timing(translateYValue, {
        toValue: visible ? 0 : 100,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start();
  }, [visible, scaleValue, translateYValue]);

  const animatedStyle = {
    transform: [
      { scale: scaleValue },
      { translateY: translateYValue },
    ],
  };

  return (
    <Animated.View
      style={[
        styles.fabContainer,
        {
          bottom: insets.bottom + 16,
          right: 16,
        },
        animatedStyle,
      ]}
      pointerEvents={visible ? 'auto' : 'none'}
    >
      <Pressable
        style={({ pressed }) => [
          styles.customFab,
          label ? styles.extendedFab : styles.standardFab,
          {
            backgroundColor: disabled ? '#cccccc' : tintColor,
            opacity: pressed ? 0.8 : 1,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 8,
          },
        ]}
        onPress={onPress}
        disabled={disabled}
      >
        <IconSymbol name={icon} size={24} color="#ffffff" />
        {label && (
          <Animated.Text style={styles.fabLabel}>
            {label}
          </Animated.Text>
        )}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  fabContainer: {
    position: 'absolute',
    zIndex: 1000,
  },
  fab: {
    borderRadius: 28,
  },
  customFab: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 28,
    gap: 8,
  },
  standardFab: {
    width: 56,
    height: 56,
  },
  extendedFab: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    minWidth: 56,
    height: 56,
  },
  fabLabel: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
}); 