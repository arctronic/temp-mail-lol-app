import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useThemeColor } from '@/hooks/useThemeColor';
import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';

export default function PrivacyScreen() {
  const borderColor = useThemeColor({}, 'border');

  return (
    <ScrollView style={styles.container}>
      <ThemedView style={[styles.content, { borderColor }]}>
        <ThemedText style={styles.title}>Privacy Policy</ThemedText>
        <ThemedText style={styles.lastUpdated}>Last updated: {new Date().toLocaleDateString()}</ThemedText>

        <ThemedText style={styles.sectionTitle}>1. Introduction</ThemedText>
        <ThemedText style={styles.paragraph}>
          At Temp Mail, we take your privacy seriously. This Privacy Policy explains how we collect, 
          use, and protect your information when you use our temporary email service.
        </ThemedText>

        <ThemedText style={styles.sectionTitle}>2. Information We Collect</ThemedText>
        <ThemedText style={styles.paragraph}>
          We collect minimal information necessary to provide our service:
        </ThemedText>
        <ThemedView style={styles.list}>
          <ThemedText style={styles.listItem}>• Temporary email addresses you create</ThemedText>
          <ThemedText style={styles.listItem}>• Emails received in your temporary inbox</ThemedText>
          <ThemedText style={styles.listItem}>• Basic usage statistics</ThemedText>
        </ThemedView>

        <ThemedText style={styles.sectionTitle}>3. How We Use Your Information</ThemedText>
        <ThemedText style={styles.paragraph}>
          We use the collected information to:
        </ThemedText>
        <ThemedView style={styles.list}>
          <ThemedText style={styles.listItem}>• Provide and maintain our service</ThemedText>
          <ThemedText style={styles.listItem}>• Process and deliver emails to your temporary inbox</ThemedText>
          <ThemedText style={styles.listItem}>• Improve our service and user experience</ThemedText>
          <ThemedText style={styles.listItem}>• Monitor and prevent abuse of our service</ThemedText>
        </ThemedView>

        <ThemedText style={styles.sectionTitle}>4. Data Retention</ThemedText>
        <ThemedText style={styles.paragraph}>
          All emails and attachments in your temporary inbox are automatically deleted after 24 hours. 
          We do not store or archive any emails beyond this period.
        </ThemedText>

        <ThemedText style={styles.sectionTitle}>5. Data Security</ThemedText>
        <ThemedText style={styles.paragraph}>
          We implement appropriate security measures to protect your information:
        </ThemedText>
        <ThemedView style={styles.list}>
          <ThemedText style={styles.listItem}>• Secure HTTPS connections</ThemedText>
          <ThemedText style={styles.listItem}>• Automatic data deletion</ThemedText>
          <ThemedText style={styles.listItem}>• Regular security audits</ThemedText>
          <ThemedText style={styles.listItem}>• Protection against unauthorized access</ThemedText>
        </ThemedView>

        <ThemedText style={styles.sectionTitle}>6. Your Rights</ThemedText>
        <ThemedText style={styles.paragraph}>
          You have the right to:
        </ThemedText>
        <ThemedView style={styles.list}>
          <ThemedText style={styles.listItem}>• Access your temporary emails</ThemedText>
          <ThemedText style={styles.listItem}>• Delete your temporary emails</ThemedText>
          <ThemedText style={styles.listItem}>• Create new temporary email addresses</ThemedText>
          <ThemedText style={styles.listItem}>• Contact us with privacy concerns</ThemedText>
        </ThemedView>

        <ThemedText style={styles.sectionTitle}>7. Contact Us</ThemedText>
        <ThemedText style={styles.paragraph}>
          If you have any questions about this Privacy Policy, please contact us through our 
          contact form or email us at privacy@tempmail.com.
        </ThemedText>

        <ThemedText style={styles.sectionTitle}>8. Changes to This Policy</ThemedText>
        <ThemedText style={styles.paragraph}>
          We may update this Privacy Policy from time to time. We will notify you of any changes 
          by posting the new Privacy Policy on this page and updating the &quot;Last updated&quot; date.
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