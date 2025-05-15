import React, { useEffect } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import { useThemeColor } from '../../hooks/useThemeColor';
import { ThemedText } from '../ThemedText';

interface LoadingAnimationProps {
  size?: 'small' | 'medium' | 'large';
  text?: string;
}

export function LoadingAnimation({ size = 'medium', text }: LoadingAnimationProps) {
  const tintColor = useThemeColor({}, 'tint');
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  
  // Animation values
  const spinValue = new Animated.Value(0);
  const scaleValue = new Animated.Value(0.8);
  const opacityValue = new Animated.Value(0);

  // Determine size in pixels
  const sizeInPixels = size === 'small' ? 24 : size === 'medium' ? 40 : 60;
  
  useEffect(() => {
    // Fade in
    Animated.timing(opacityValue, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
      easing: Easing.out(Easing.cubic),
    }).start();
    
    // Pulsing animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleValue, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
          easing: Easing.out(Easing.cubic),
        }),
        Animated.timing(scaleValue, {
          toValue: 0.8,
          duration: 600,
          useNativeDriver: true,
          easing: Easing.in(Easing.cubic),
        }),
      ])
    ).start();
    
    // Rotation animation
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
        easing: Easing.linear,
      })
    ).start();
  }, []);
  
  // Interpolate rotation
  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });
  
  return (
    <Animated.View 
      style={[
        styles.container, 
        { opacity: opacityValue }
      ]}
    >
      <Animated.View
        style={[
          styles.circleOuter,
          {
            width: sizeInPixels,
            height: sizeInPixels,
            borderColor: tintColor,
            backgroundColor,
            transform: [{ scale: scaleValue }, { rotate: spin }],
          },
        ]}
      >
        <View style={[styles.circleDot, { backgroundColor: tintColor }]} />
      </Animated.View>
      
      {text && (
        <ThemedText style={[styles.text, { color: textColor }]}>
          {text}
        </ThemedText>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  circleOuter: {
    borderWidth: 2,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    borderTopColor: 'transparent',
  },
  circleDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    position: 'absolute',
    top: 2,
  },
  text: {
    marginTop: 12,
    fontSize: 14,
    textAlign: 'center',
  },
}); 