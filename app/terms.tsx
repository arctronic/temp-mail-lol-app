import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useThemeColor } from '@/hooks/useThemeColor';
import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';

export default function TermsScreen() {
  const borderColor = useThemeColor({}, 'border');

  return (
    <ScrollView style={styles.container}>
      <ThemedView style={[styles.content, { borderColor }]}>
        <ThemedText style={styles.title}>Terms of Service</ThemedText>
        <ThemedText style={styles.lastUpdated}>Last updated: {new Date().toLocaleDateString()}</ThemedText>

        <ThemedText style={styles.sectionTitle}>1. Acceptance of Terms</ThemedText>
        <ThemedText style={styles.paragraph}>
          By accessing and using Temp Mail, you agree to be bound by these Terms of Service. 
          If you do not agree to these terms, please do not use our service.
        </ThemedText>

        <ThemedText style={styles.sectionTitle}>2. Description of Service</ThemedText>
        <ThemedText style={styles.paragraph}>
          Temp Mail provides temporary email addresses for users to receive emails. The service 
          is intended for legitimate use cases such as:
        </ThemedText>
        <ThemedView style={styles.list}>
          <ThemedText style={styles.listItem}>• Website registrations</ThemedText>
          <ThemedText style={styles.listItem}>• Email verifications</ThemedText>
          <ThemedText style={styles.listItem}>• Testing and development</ThemedText>
          <ThemedText style={styles.listItem}>• Temporary communications</ThemedText>
        </ThemedView>

        <ThemedText style={styles.sectionTitle}>3. Acceptable Use</ThemedText>
        <ThemedText style={styles.paragraph}>
          You agree to use Temp Mail only for lawful purposes and in accordance with these terms. 
          You must not use our service to:
        </ThemedText>
        <ThemedView style={styles.list}>
          <ThemedText style={styles.listItem}>• Send spam or unsolicited emails</ThemedText>
          <ThemedText style={styles.listItem}>• Engage in fraudulent activities</ThemedText>
          <ThemedText style={styles.listItem}>• Violate any laws or regulations</ThemedText>
          <ThemedText style={styles.listItem}>• Harass or abuse others</ThemedText>
          <ThemedText style={styles.listItem}>• Distribute malware or harmful content</ThemedText>
        </ThemedView>

        <ThemedText style={styles.sectionTitle}>4. Service Limitations</ThemedText>
        <ThemedText style={styles.paragraph}>
          We reserve the right to:
        </ThemedText>
        <ThemedView style={styles.list}>
          <ThemedText style={styles.listItem}>• Limit the number of emails you can receive</ThemedText>
          <ThemedText style={styles.listItem}>• Block certain types of attachments</ThemedText>
          <ThemedText style={styles.listItem}>• Suspend or terminate accounts that violate these terms</ThemedText>
          <ThemedText style={styles.listItem}>• Modify or discontinue the service at any time</ThemedText>
        </ThemedView>

        <ThemedText style={styles.sectionTitle}>5. User Responsibilities</ThemedText>
        <ThemedText style={styles.paragraph}>
          As a user of Temp Mail, you are responsible for:
        </ThemedText>
        <ThemedView style={styles.list}>
          <ThemedText style={styles.listItem}>• Maintaining the security of your temporary email addresses</ThemedText>
          <ThemedText style={styles.listItem}>• Using the service in compliance with these terms</ThemedText>
          <ThemedText style={styles.listItem}>• Not relying on the service for critical communications</ThemedText>
          <ThemedText style={styles.listItem}>• Understanding that emails are automatically deleted after 24 hours</ThemedText>
        </ThemedView>

        <ThemedText style={styles.sectionTitle}>6. Disclaimer of Warranties</ThemedText>
        <ThemedText style={styles.paragraph}>
          Temp Mail is provided &quot;as is&quot; without any warranties. We do not guarantee:
        </ThemedText>
        <ThemedView style={styles.list}>
          <ThemedText style={styles.listItem}>• Uninterrupted service</ThemedText>
          <ThemedText style={styles.listItem}>• Delivery of all emails</ThemedText>
          <ThemedText style={styles.listItem}>• Security of your communications</ThemedText>
          <ThemedText style={styles.listItem}>• Suitability for any specific purpose</ThemedText>
        </ThemedView>

        <ThemedText style={styles.sectionTitle}>7. Limitation of Liability</ThemedText>
        <ThemedText style={styles.paragraph}>
          We shall not be liable for any damages arising from the use or inability to use our service, 
          including but not limited to:
        </ThemedText>
        <ThemedView style={styles.list}>
          <ThemedText style={styles.listItem}>• Lost or undelivered emails</ThemedText>
          <ThemedText style={styles.listItem}>• Service interruptions</ThemedText>
          <ThemedText style={styles.listItem}>• Data loss</ThemedText>
          <ThemedText style={styles.listItem}>• Indirect or consequential damages</ThemedText>
        </ThemedView>

        <ThemedText style={styles.sectionTitle}>8. Changes to Terms</ThemedText>
        <ThemedText style={styles.paragraph}>
          We may modify these terms at any time. We will notify users of significant changes by 
          posting the updated terms on our website and updating the &quot;Last updated&quot; date.
        </ThemedText>

        <ThemedText style={styles.sectionTitle}>9. Contact Information</ThemedText>
        <ThemedText style={styles.paragraph}>
          For questions about these Terms of Service, please contact us through our contact form 
          or email us at terms@tempmail.com.
        </ThemedText>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    gap: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
  },
  lastUpdated: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 8,
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 24,
    opacity: 0.9,
  },
  list: {
    gap: 8,
    marginTop: 8,
  },
  listItem: {
    fontSize: 16,
    lineHeight: 24,
    opacity: 0.9,
  },
}); 