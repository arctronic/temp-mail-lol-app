import { useRouter } from 'expo-router';
import React from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeColor } from '../../hooks/useThemeColor';
import { ThemedText } from '../ThemedText';
import { IconSymbol } from './IconSymbol';

interface AppHeaderProps {
  title: string;
  showBackButton?: boolean;
  rightAction?: {
    icon: string;
    onPress: () => void;
  };
  animatedValue?: Animated.Value;
}

export const AppHeader = ({
  title,
  showBackButton = false,
  rightAction,
  animatedValue,
}: AppHeaderProps) => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');
  const borderColor = useThemeColor({}, 'border');

  const headerOpacity = animatedValue?.interpolate({
    inputRange: [0, 60],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const goBack = () => {
    router.back();
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor,
          borderBottomColor: borderColor,
          paddingTop: insets.top,
          opacity: headerOpacity !== undefined ? headerOpacity : 1,
        },
      ]}
    >
      <View style={styles.headerContent}>
        {showBackButton ? (
          <Pressable
            style={({ pressed }) => [
              styles.backButton,
              {
                opacity: pressed ? 0.7 : 1,
                backgroundColor: pressed ? `${tintColor}10` : 'transparent',
              },
            ]}
            onPress={goBack}
          >
            <IconSymbol name="chevron.left" size={28} color={tintColor} />
          </Pressable>
        ) : null}

        <ThemedText style={styles.title} numberOfLines={1}>
          {title}
        </ThemedText>

        {rightAction ? (
          <Pressable
            style={({ pressed }) => [
              styles.actionButton,
              {
                opacity: pressed ? 0.7 : 1,
                backgroundColor: pressed ? `${tintColor}10` : 'transparent',
              },
            ]}
            onPress={rightAction.onPress}
          >
            <IconSymbol name={rightAction.icon} size={22} color={tintColor} />
          </Pressable>
        ) : (
          <View style={styles.placeholder} />
        )}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderBottomWidth: StyleSheet.hairlineWidth,
    zIndex: 10,
  },
  headerContent: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
  },
  backButton: {
    padding: 10,
    borderRadius: 22,
    marginRight: 8,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  actionButton: {
    padding: 10,
    borderRadius: 22,
    marginLeft: 8,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholder: {
    width: 44,
  },
}); 