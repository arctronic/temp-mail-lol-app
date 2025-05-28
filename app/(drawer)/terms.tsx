import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useThemePreference } from '@/contexts/ThemeContext';
import { useThemeColor } from '@/hooks/useThemeColor';
import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';

export default function TermsScreen() {
  const { themeVersion } = useThemePreference();
  const backgroundColor = useThemeColor({}, 'background');

  return (
    <ThemedView style={styles.container} key={`terms-screen-${themeVersion}`}>
      <ScrollView 
        style={[styles.scrollView, { backgroundColor }]}
        contentContainerStyle={styles.scrollContent}
      >
        <ThemedView style={styles.content}>
          <ThemedText style={styles.title}>Terms of Service</ThemedText>

          <ThemedText style={styles.sectionTitle}>1. Acceptance of Terms</ThemedText>
          <ThemedText style={styles.text}>
            By accessing and using Temp Mail, you accept and agree to be bound by the terms and provision of this agreement.
          </ThemedText>

          <ThemedText style={styles.sectionTitle}>2. Service Description</ThemedText>
          <ThemedText style={styles.text}>
            Temp Mail provides temporary email addresses for receiving emails. All emails are automatically deleted after 24 hours.
          </ThemedText>

          <ThemedText style={styles.sectionTitle}>3. User Responsibilities</ThemedText>
          <ThemedText style={styles.text}>
            Users are responsible for their use of the service and must not use it for illegal activities or spam.
          </ThemedText>

          <ThemedText style={styles.sectionTitle}>4. Privacy</ThemedText>
          <ThemedText style={styles.text}>
            We do not collect personal information. All emails are automatically deleted and not stored permanently.
          </ThemedText>

          <ThemedText style={styles.sectionTitle}>5. Limitation of Liability</ThemedText>
          <ThemedText style={styles.text}>
            Temp Mail is provided &quot;as is&quot; without any warranties. We are not liable for any damages arising from the use of this service.
          </ThemedText>

          <ThemedText style={styles.sectionTitle}>6. Changes to Terms</ThemedText>
          <ThemedText style={styles.text}>
            We may update these terms from time to time. Any changes will be posted on this page.
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
  text: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 12,
  },
}); 