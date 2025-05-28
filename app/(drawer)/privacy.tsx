import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useThemePreference } from '@/contexts/ThemeContext';
import { useThemeColor } from '@/hooks/useThemeColor';
import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';

export default function PrivacyScreen() {
  const borderColor = useThemeColor({}, 'border');
  const { themeVersion } = useThemePreference();
  const backgroundColor = useThemeColor({}, 'background');

  return (
    <ThemedView style={styles.container} key={`privacy-screen-${themeVersion}`}>
      <ScrollView 
        style={[styles.scrollView, { backgroundColor }]}
        contentContainerStyle={styles.scrollContent}
      >
        <ThemedView style={styles.content}>
          <ThemedText style={styles.title}>Privacy Policy</ThemedText>
          
          <ThemedText style={styles.sectionTitle}>1. Information We Collect</ThemedText>
          <ThemedText style={styles.paragraph}>
            We do not collect personal information. Temp Mail is designed to be anonymous and 
            protect your privacy.
          </ThemedText>

          <ThemedText style={styles.sectionTitle}>2. How We Use Information</ThemedText>
          <ThemedText style={styles.paragraph}>
            Since we don&apos;t collect personal information, we don&apos;t use it. All emails are 
            automatically deleted after 24 hours.
          </ThemedText>

          <ThemedText style={styles.sectionTitle}>3. Data Security</ThemedText>
          <ThemedText style={styles.paragraph}>
            We use secure connections and automatically delete all data to ensure your privacy 
            and security.
          </ThemedText>

          <ThemedText style={styles.sectionTitle}>4. Third Parties</ThemedText>
          <ThemedText style={styles.paragraph}>
            We do not share any information with third parties since we don&apos;t collect 
            personal information.
          </ThemedText>

          <ThemedText style={styles.sectionTitle}>5. Changes to Privacy Policy</ThemedText>
          <ThemedText style={styles.paragraph}>
            We may update this privacy policy from time to time. Any changes will be posted 
            on this page.
          </ThemedText>
        </ThemedView>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: 16,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 12,
  },
}); 