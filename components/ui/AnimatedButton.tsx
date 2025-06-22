import * as Haptics from 'expo-haptics';
import React from 'react';
import { Pressable, PressableProps } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring
} from 'react-native-reanimated';

// Task 3.5: Animated Button with Micro Interactions
interface AnimatedButtonProps extends PressableProps {
  children: React.ReactNode;
  hapticFeedback?: 'light' | 'medium' | 'heavy' | 'selection' | 'impactLight' | 'impactMedium' | 'impactHeavy';
  scaleDownAmount?: number;
  springConfig?: {
    damping?: number;
    stiffness?: number;
  };
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  children,
  onPress,
  hapticFeedback = 'impactLight',
  scaleDownAmount = 0.95,
  springConfig = { damping: 15, stiffness: 300 },
  style,
  ...props
}) => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const triggerHapticFeedback = () => {
    switch (hapticFeedback) {
      case 'light':
      case 'impactLight':
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        break;
      case 'medium':
      case 'impactMedium':
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        break;
      case 'heavy':
      case 'impactHeavy':
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        break;
      case 'selection':
        Haptics.selectionAsync();
        break;
    }
  };

  const handlePress = (event: any) => {
    // Trigger haptic feedback
    triggerHapticFeedback();
    
    // Animate scale down and back up
    scale.value = withSpring(scaleDownAmount, springConfig, (finished) => {
      if (finished) {
        scale.value = withSpring(1, springConfig);
      }
    });

    // Call original onPress
    onPress?.(event);
  };

  const handlePressIn = () => {
    opacity.value = withSpring(0.8, { damping: 10 });
  };

  const handlePressOut = () => {
    opacity.value = withSpring(1, { damping: 10 });
  };

  return (
    <AnimatedPressable
      style={[style, animatedStyle]}
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      {...props}
    >
      {children}
    </AnimatedPressable>
  );
};

// Task 3.5: Scale Button for simple scaling interactions
interface ScaleButtonProps extends PressableProps {
  children: React.ReactNode;
  scaleAmount?: number;
}

export const ScaleButton: React.FC<ScaleButtonProps> = ({
  children,
  onPress,
  scaleAmount = 0.96,
  style,
  ...props
}) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(scaleAmount, { damping: 12 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 12 });
  };

  const handlePress = (event: any) => {
    // Light haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.(event);
  };

  return (
    <AnimatedPressable
      style={[style, animatedStyle]}
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      {...props}
    >
      {children}
    </AnimatedPressable>
  );
};

// Task 3.5: Pulse Button for attention-grabbing interactions
interface PulseButtonProps extends PressableProps {
  children: React.ReactNode;
  pulseScale?: number;
  pulseDuration?: number;
}

export const PulseButton: React.FC<PulseButtonProps> = ({
  children,
  onPress,
  pulseScale = 1.05,
  pulseDuration = 1000,
  style,
  ...props
}) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  React.useEffect(() => {
    const pulse = () => {
      scale.value = withSpring(pulseScale, { damping: 10 }, (finished) => {
        if (finished) {
          scale.value = withSpring(1, { damping: 10 });
        }
      });
    };

    const interval = setInterval(pulse, pulseDuration);
    return () => clearInterval(interval);
  }, [scale, pulseScale, pulseDuration]);

  const handlePress = (event: any) => {
    // Medium haptic feedback for pulse buttons
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress?.(event);
  };

  return (
    <AnimatedPressable
      style={[style, animatedStyle]}
      onPress={handlePress}
      {...props}
    >
      {children}
    </AnimatedPressable>
  );
}; 