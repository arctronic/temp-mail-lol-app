import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useNotification } from '@/contexts/NotificationContext';
import { useReloadInterval } from '@/contexts/ReloadIntervalContext';
import { useThemePreference } from '@/contexts/ThemeContext';
import { useSyncPreferences } from '@/hooks/useSyncPreferences';
import { useThemeColor } from '@/hooks/useThemeColor';
import * as Haptics from 'expo-haptics';
import React from 'react';
import { KeyboardAvoidingView, ScrollView, StyleSheet, View } from 'react-native';

import { Card, List, RadioButton, Switch } from 'react-native-paper';

// Types
type ThemeOption = 'system' | 'light' | 'dark';

export default function SettingsScreen() {
  const { themePreference, setThemePreference } = useThemePreference();
  const { setReloadInterval } = useReloadInterval();
  const { notificationsEnabled, setNotificationsEnabled } = useNotification();
  const { syncFrequency, themeOverride, updateSyncFrequency, updateThemeOverride } = useSyncPreferences();

  // Theme colors
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const textSecondaryColor = useThemeColor({}, 'tabIconDefault');
  const tintColor = useThemeColor({}, 'tint');
  const cardColor = useThemeColor({}, 'card');

  const handleSyncFrequencyChange = async (value: string) => {
    try {
      const frequency = parseInt(value, 10) as 1 | 2 | 5 | 10;
      await updateSyncFrequency(frequency);
      
      // Update existing reload interval (convert minutes to seconds)
      setReloadInterval(frequency * 60);
      
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      console.error('Failed to save sync frequency:', error);
    }
  };

  const handleThemeOverrideChange = async (value: boolean) => {
    try {
      const newTheme: ThemeOption = value ? 'dark' : 'light';
      await updateThemeOverride(newTheme);
      setThemePreference(newTheme);
      
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      console.error('Failed to save theme override:', error);
    }
  };

  return (
    <ThemedView style={[styles.container, { backgroundColor }]}>
      <KeyboardAvoidingView style={styles.keyboardView} behavior="padding">
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Sync & Refresh Section */}
          <List.Section>
            <List.Subheader style={[styles.sectionHeader, { color: textColor }]}>
              Sync & Refresh
            </List.Subheader>
            
            <Card style={[styles.card, { backgroundColor: cardColor }]}>
              <Card.Content>
                <View style={styles.modernCardHeader}>
                  <IconSymbol name="arrow.clockwise" size={20} color={tintColor} />
                  <ThemedText style={[styles.modernCardTitle, { color: textColor }]}>
                    Sync Frequency
                  </ThemedText>
                </View>
                <View style={[styles.modernCardDivider, { borderBottomColor: `${textColor}15` }]} />

                <RadioButton.Group onValueChange={handleSyncFrequencyChange} value={syncFrequency.toString()}>
                  <View style={styles.radioContainer}>
                    {[1, 2, 5, 10].map((minutes) => (
                      <View key={minutes} style={styles.radioItem}>
                        <RadioButton value={minutes.toString()} color={tintColor} />
                        <ThemedText style={[styles.radioLabel, { color: textColor }]}>
                          {minutes} {minutes === 1 ? 'minute' : 'minutes'}
                        </ThemedText>
                      </View>
                    ))}
                  </View>
                </RadioButton.Group>
              </Card.Content>
            </Card>
          </List.Section>

          {/* Appearance Section */}
          <List.Section>
            <List.Subheader style={[styles.sectionHeader, { color: textColor }]}>
              Appearance
            </List.Subheader>
            
            <Card style={[styles.card, { backgroundColor: cardColor }]}>
              <Card.Content>
                <List.Item
                  title="Dark Mode"
                  description="Override system theme setting"
                  left={(props) => <IconSymbol name="moon.fill" size={24} color={tintColor} />}
                  right={() => (
                    <Switch
                      value={themeOverride === 'dark'}
                      onValueChange={handleThemeOverrideChange}
                      color={tintColor}
                    />
                  )}
                  titleStyle={{ color: textColor }}
                  descriptionStyle={{ color: textSecondaryColor }}
                />

                <List.Item
                  title="Notifications"
                  description="Push notifications for new emails"
                  left={(props) => <IconSymbol name={notificationsEnabled ? "bell.fill" : "bell.slash.fill"} size={24} color={tintColor} />}
                  right={() => (
                    <Switch
                      value={notificationsEnabled}
                      onValueChange={async (value) => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        await setNotificationsEnabled(value);
                      }}
                      color={tintColor}
                    />
                  )}
                  titleStyle={{ color: textColor }}
                  descriptionStyle={{ color: textSecondaryColor }}
                />
              </Card.Content>
            </Card>
          </List.Section>

          {/* Footer spacing */}
          <ThemedView style={styles.footer} />
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    paddingHorizontal: 16,
  },
  card: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  radioContainer: {
    marginTop: 8,
  },
  radioItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  radioLabel: {
    fontSize: 16,
    marginLeft: 8,
  },
  footer: {
    height: 32,
  },
  modernCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  modernCardTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  modernCardDivider: {
    borderBottomWidth: 1,
    marginBottom: 16,
    marginTop: -4,
  },
}); 