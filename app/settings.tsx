import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { PageHeader } from '@/components/ui/PageHeader';
import { useReloadInterval } from '@/contexts/ReloadIntervalContext';
import { useThemePreference } from '@/contexts/ThemeContext';
import { useThemeColor } from '@/hooks/useThemeColor';
import Slider from '@react-native-community/slider';
import * as Haptics from 'expo-haptics';
import React, { useState } from 'react';
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

// Helper function to format seconds into a readable string
function formatSeconds(seconds: number): string {
  if (seconds < 60) {
    return `${seconds} seconds`;
  }
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  if (remainingSeconds === 0) {
    return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`;
  }
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

export default function SettingsScreen() {
  const { themePreference, setThemePreference, themeVersion } = useThemePreference();
  const { reloadInterval, setReloadInterval } = useReloadInterval();
  const [tempInterval, setTempInterval] = useState(reloadInterval);
  const textColor = useThemeColor({}, 'text');
  const textSecondaryColor = useThemeColor({}, 'textSecondary');
  const borderColor = useThemeColor({}, 'border');
  const tintColor = useThemeColor({}, 'tint');

  const themeOptions: { label: string; value: ThemeOption; icon: ThemeIconName }[] = [
    { label: 'System', value: 'system', icon: 'gear' },
    { label: 'Light', value: 'light', icon: 'sun.max.fill' },
    { label: 'Dark', value: 'dark', icon: 'moon.fill' },
  ];

  const handleIntervalChange = (value: number) => {
    // Round to nearest 5 seconds for better UX
    const roundedValue = Math.round(value / 5) * 5;
    setTempInterval(roundedValue);
  };

  const handleIntervalComplete = () => {
    setReloadInterval(tempInterval);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <View style={styles.container} key={`settings-screen-${themeVersion}`}>
      <PageHeader title="Settings" showBackButton />
      <ScrollView>
        <View style={styles.content}>
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

          <View style={[styles.section, { borderBottomColor: borderColor }]}>
            <ThemedText style={styles.sectionTitle}>Email Refresh</ThemedText>
            <ThemedText style={[styles.sectionDescription, { color: textSecondaryColor }]}>
              Control how often Temp Mail checks for new emails. A shorter interval means quicker notifications but may use more battery.
            </ThemedText>

            <View style={styles.sliderContainer}>
              <View style={styles.sliderLabelContainer}>
                <ThemedText style={styles.sliderValue}>
                  Refresh every: {formatSeconds(tempInterval)}
                </ThemedText>
              </View>
              
              <Slider
                style={styles.slider}
                minimumValue={20}
                maximumValue={300}
                step={5}
                value={tempInterval}
                onValueChange={handleIntervalChange}
                onSlidingComplete={handleIntervalComplete}
                minimumTrackTintColor={tintColor}
                maximumTrackTintColor={borderColor}
                thumbTintColor={tintColor}
              />
              
              <View style={styles.sliderLabels}>
                <ThemedText style={[styles.sliderLabel, { color: textSecondaryColor }]}>
                  20s
                </ThemedText>
                <ThemedText style={[styles.sliderLabel, { color: textSecondaryColor }]}>
                  5m
                </ThemedText>
              </View>
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
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
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
  sliderContainer: {
    marginTop: 8,
  },
  sliderLabelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  sliderValue: {
    fontWeight: '500',
    fontSize: 16,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    marginTop: -8,
  },
  sliderLabel: {
    fontSize: 12,
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