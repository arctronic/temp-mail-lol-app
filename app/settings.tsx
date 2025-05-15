import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useThemePreference } from '@/contexts/ThemeContext';
import { useThemeColor } from '@/hooks/useThemeColor';
import * as Haptics from 'expo-haptics';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

type ThemeOption = 'system' | 'light' | 'dark';

// Define the icon names
type ThemeIconName = 'gear' | 'sun.max.fill' | 'moon.fill' | 'checkmark.circle.fill';

interface ThemeButtonProps {
  label: string;
  value: ThemeOption;
  icon: ThemeIconName;
  isSelected: boolean;
  onPress: () => void;
}

function ThemeButton({ label, value, icon, isSelected, onPress }: ThemeButtonProps) {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');
  const borderColor = useThemeColor({}, 'border');

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  return (
    <Pressable
      style={({ pressed }) => [
        styles.themeButton,
        {
          backgroundColor: pressed ? `${backgroundColor}80` : backgroundColor,
          borderColor: isSelected ? tintColor : borderColor,
          borderWidth: isSelected ? 2 : 1,
        },
      ]}
      onPress={handlePress}
    >
      <View style={styles.themeButtonContent}>
        <IconSymbol
          name={icon}
          size={24}
          color={isSelected ? tintColor : textColor}
        />
        <ThemedText style={[
          styles.themeButtonLabel,
          { color: isSelected ? tintColor : textColor }
        ]}>
          {label}
        </ThemedText>
      </View>
      {isSelected && (
        <View style={styles.selectedIcon}>
          <IconSymbol
            name="checkmark.circle.fill"
            size={22}
            color={tintColor}
          />
        </View>
      )}
    </Pressable>
  );
}

export default function SettingsScreen() {
  const { themePreference, setThemePreference } = useThemePreference();
  const textColor = useThemeColor({}, 'text');
  const textSecondaryColor = useThemeColor({}, 'textSecondary');
  const borderColor = useThemeColor({}, 'border');

  const themeOptions: { label: string; value: ThemeOption; icon: ThemeIconName }[] = [
    { label: 'System', value: 'system', icon: 'gear' },
    { label: 'Light', value: 'light', icon: 'sun.max.fill' },
    { label: 'Dark', value: 'dark', icon: 'moon.fill' },
  ];

  return (
    <ScrollView style={styles.container}>
      <ThemedView style={styles.content}>
        <ThemedText style={styles.title}>Settings</ThemedText>

        <View style={[styles.section, { borderBottomColor: borderColor }]}>
          <ThemedText style={styles.sectionTitle}>Appearance</ThemedText>
          <ThemedText style={[styles.sectionDescription, { color: textSecondaryColor }]}>
            Choose how Temp Mail looks to you. Select a theme preference below.
          </ThemedText>

          <View style={styles.themeOptions}>
            {themeOptions.map((option) => (
              <ThemeButton
                key={option.value}
                label={option.label}
                value={option.value}
                icon={option.icon}
                isSelected={themePreference === option.value}
                onPress={() => setThemePreference(option.value)}
              />
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>About</ThemedText>
          <ThemedText style={[styles.sectionDescription, { color: textSecondaryColor }]}>
            Temp Mail is a service providing disposable temporary email addresses.
            Use it to protect your privacy when signing up for services online.
          </ThemedText>

          <View style={styles.appInfo}>
            <View style={styles.appInfoRow}>
              <ThemedText style={{ color: textSecondaryColor }}>Version</ThemedText>
              <ThemedText>1.0.0</ThemedText>
            </View>
            <View style={[styles.appInfoRow, { borderBottomColor: borderColor }]}>
              <ThemedText style={{ color: textSecondaryColor }}>Build</ThemedText>
              <ThemedText>2023.10.01</ThemedText>
            </View>
          </View>
        </View>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  section: {
    marginBottom: 30,
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 16,
    marginBottom: 20,
    lineHeight: 22,
  },
  themeOptions: {
    flexDirection: 'column',
    gap: 12,
  },
  themeButton: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  themeButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  themeButtonLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  selectedIcon: {
    marginRight: 4,
  },
  appInfo: {
    marginTop: 16,
  },
  appInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
}); 