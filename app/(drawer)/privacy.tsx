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
          <ThemedText style={styles.lastUpdated}>Last updated: May 2024</ThemedText>
          
          <ThemedText style={styles.sectionTitle}>1. No Data Collection</ThemedText>
          <ThemedText style={styles.paragraph}>
            We DO NOT collect, store, or retain any personal information. Temp Mail is designed to be completely 
            anonymous and protect your privacy. We do not require registration, accounts, or any personal details.
          </ThemedText>

          <ThemedText style={styles.sectionTitle}>2. Email Data Handling</ThemedText>
          <ThemedText style={styles.paragraph}>
            All temporary emails are automatically and permanently deleted from our servers after 24 hours. 
            We do not store, backup, or retain any email content beyond this period. This deletion is automatic 
            and irreversible.
          </ThemedText>

          <ThemedText style={styles.sectionTitle}>3. Local Storage (Lookup List)</ThemedText>
          <ThemedText style={styles.paragraph}>
            The ONLY way emails are preserved is through the lookup list feature, which stores emails locally 
            on your device only. This local storage:
          </ThemedText>
          <ThemedText style={styles.bulletPoint}>• Remains completely on your device</ThemedText>
          <ThemedText style={styles.bulletPoint}>• Is under your complete control</ThemedText>
          <ThemedText style={styles.bulletPoint}>• Is not accessible to us or any third parties</ThemedText>
          <ThemedText style={styles.bulletPoint}>• Can be deleted by you at any time</ThemedText>
          <ThemedText style={styles.bulletPoint}>• Does not sync to any cloud services</ThemedText>

          <ThemedText style={styles.sectionTitle}>4. Notifications</ThemedText>
          <ThemedText style={styles.paragraph}>
            Push notifications are processed locally on your device. We do not track notification delivery, 
            read status, or any notification-related data. Notification permissions are handled by your device&apos;s 
            operating system.
          </ThemedText>

          <ThemedText style={styles.sectionTitle}>5. No Tracking or Analytics</ThemedText>
          <ThemedText style={styles.paragraph}>
            We do not use cookies, tracking pixels, analytics services, or any form of user tracking. 
            We do not monitor your usage patterns, email content, or app behavior.
          </ThemedText>

          <ThemedText style={styles.sectionTitle}>6. Third Parties</ThemedText>
          <ThemedText style={styles.paragraph}>
            We do not share any information with third parties because we do not collect any information. 
            We do not use third-party analytics, advertising networks, or data processors.
          </ThemedText>

          <ThemedText style={styles.sectionTitle}>7. Data Security</ThemedText>
          <ThemedText style={styles.paragraph}>
            We use secure HTTPS connections for all communications. Since we do not store data, there is no 
            centralized data to be compromised. Your local data is protected by your device&apos;s security measures.
          </ThemedText>

          <ThemedText style={styles.sectionTitle}>8. Your Rights</ThemedText>
          <ThemedText style={styles.paragraph}>
            Since we do not collect or store personal data, traditional data rights (access, deletion, portability) 
            are not applicable. However, you have complete control over any locally stored data through the app&apos;s 
            interface.
          </ThemedText>

          <ThemedText style={styles.sectionTitle}>9. Children&apos;s Privacy</ThemedText>
          <ThemedText style={styles.paragraph}>
            Our service does not collect personal information from anyone, including children under 13. 
            The anonymous nature of our service makes it inherently compliant with children&apos;s privacy regulations.
          </ThemedText>

          <ThemedText style={styles.sectionTitle}>10. Changes to This Policy</ThemedText>
          <ThemedText style={styles.paragraph}>
            We may update this privacy policy to reflect changes in our practices or for legal reasons. 
            Any changes will be posted on this page with an updated date. Continued use of the service 
            constitutes acceptance of any changes.
          </ThemedText>

          <ThemedText style={styles.contact}>
            If you have questions about this privacy policy, please contact us through the app&apos;s contact form.
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
  lastUpdated: {
    fontSize: 14,
    opacity: 0.6,
    marginBottom: 24,
    fontStyle: 'italic',
  },
  bulletPoint: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 4,
    marginLeft: 16,
  },
  contact: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 24,
    textAlign: 'center',
    opacity: 0.8,
  },
}); 