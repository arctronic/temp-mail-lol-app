import { Stack, router } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '../components/ThemedText';
import { ThemedView } from '../components/ThemedView';
import { IconSymbol } from '../components/ui/IconSymbol';
import { useThemeColor } from '../hooks/useThemeColor';

export default function NotFoundScreen() {
  const tintColor = useThemeColor({}, 'tint');
  
  return (
    <>
      <Stack.Screen options={{ title: 'Page Not Found' }} />
      <ThemedView style={styles.container}>
        <IconSymbol name="exclamationmark.triangle.fill" size={64} color={tintColor} style={styles.icon} />
        <ThemedText style={styles.title}>This page doesn&apos;t exist</ThemedText>
        <ThemedText style={styles.subtitle}>The page you&apos;re looking for is not available.</ThemedText>
        <Pressable 
          style={({ pressed }) => [
            styles.button,
            { 
              backgroundColor: tintColor,
              opacity: pressed ? 0.8 : 1 
            }
          ]}
          onPress={() => router.replace('/(drawer)')}
        >
          <IconSymbol name="house.fill" size={20} color="#fff" />
          <ThemedText style={styles.buttonText}>Go to Home</ThemedText>
        </Pressable>
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  icon: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 30,
    textAlign: 'center',
    opacity: 0.7,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    gap: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
