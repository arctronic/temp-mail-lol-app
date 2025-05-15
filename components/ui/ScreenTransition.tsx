import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, ViewProps } from 'react-native';

type TransitionType = 'fade' | 'slide' | 'zoom' | 'none';

interface ScreenTransitionProps extends ViewProps {
  type?: TransitionType;
  duration?: number;
  children: React.ReactNode;
}

export function ScreenTransition({
  type = 'fade',
  duration = 300,
  children,
  style,
  ...props
}: ScreenTransitionProps) {
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  
  useEffect(() => {
    // Different animation based on type
    const animations = [];
    
    if (type === 'fade' || type === 'slide' || type === 'zoom') {
      animations.push(
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration,
          useNativeDriver: true,
        })
      );
    }
    
    if (type === 'slide') {
      animations.push(
        Animated.timing(slideAnim, {
          toValue: 0,
          duration,
          useNativeDriver: true,
        })
      );
    }
    
    if (type === 'zoom') {
      animations.push(
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration,
          useNativeDriver: true,
        })
      );
    }
    
    // Run animations in parallel
    Animated.parallel(animations).start();
    
    // Cleanup animations when component unmounts
    return () => {
      // Reset animation values
      fadeAnim.setValue(0);
      slideAnim.setValue(50);
      scaleAnim.setValue(0.9);
    };
  }, []);
  
  // Animation styles based on type
  let animatedStyle = {};
  
  switch (type) {
    case 'fade':
      animatedStyle = { opacity: fadeAnim };
      break;
    case 'slide':
      animatedStyle = {
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }],
      };
      break;
    case 'zoom':
      animatedStyle = {
        opacity: fadeAnim,
        transform: [{ scale: scaleAnim }],
      };
      break;
    default:
      animatedStyle = {};
  }
  
  return (
    <Animated.View
      style={[styles.container, animatedStyle, style]}
      {...props}
    >
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
}); 