import { useThemeColor } from '@/hooks/useThemeColor';
import { useRouter } from 'expo-router';
import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { ThemedText } from '../ThemedText';
import { IconSymbol } from './IconSymbol';

interface PageHeaderProps {
  title: string;
  showBackButton?: boolean;
  rightAction?: {
    icon: string;
    onPress: () => void;
    loading?: boolean;
  };
}

export const PageHeader = ({
  title,
  showBackButton = false,
  rightAction,
}: PageHeaderProps) => {
  const router = useRouter();
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');

  const handleBack = () => {
    router.back();
  };

  return (
    <View style={styles.header}>
      <View style={styles.titleContainer}>
        {showBackButton && (
          <Pressable
            style={({ pressed }) => [
              styles.backButton,
              { opacity: pressed ? 0.7 : 1 }
            ]}
            onPress={handleBack}
          >
            <IconSymbol name="chevron.left" size={22} color={textColor} />
          </Pressable>
        )}
        <ThemedText style={styles.title}>{title}</ThemedText>
      </View>
      
      {rightAction && (
        <Pressable
          style={({ pressed }) => [
            styles.actionButton,
            { opacity: pressed ? 0.7 : 1, backgroundColor: tintColor }
          ]}
          onPress={rightAction.onPress}
          disabled={rightAction.loading}
        >
          {rightAction.loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <IconSymbol name={rightAction.icon} size={16} color="#fff" />
          )}
        </Pressable>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 8,
    padding: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  actionButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 