import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { AppHeader } from '@/components/ui/AppHeader';
import { useThemePreference } from '@/contexts/ThemeContext';
import { useThemeColor } from '@/hooks/useThemeColor';
import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

export default function PrivacyScreen() {
  const borderColor = useThemeColor({}, 'border');
  const { themeVersion } = useThemePreference();

  return (
    <View style={styles.container} key={`privacy-screen-${themeVersion}`}>
      <AppHeader title="Privacy Policy" />
      <ScrollView style={styles.scrollView}>
        <ThemedView style={styles.content}>
          <ThemedText style={styles.title}>Privacy Policy</ThemedText>
          <ThemedText style={styles.lastUpdated}>Last updated: June 1, 2024</ThemedText>
          
          <ThemedText style={styles.section}>
            This Privacy Policy describes how Temp Mail (we, us, or our) collects, uses, and discloses your information when you use our temporary email service application (Service).
          </ThemedText>
          
          <ThemedText style={styles.sectionTitle}>Information We Collect</ThemedText>
          <ThemedText style={styles.paragraph}>
            When you use our Service, we may collect the following types of information:
          </ThemedText>
          <ThemedText style={styles.bullet}>• Device information such as IP address, device type, operating system</ThemedText>
          <ThemedText style={styles.bullet}>• Usage data such as features accessed and time spent using the Service</ThemedText>
          <ThemedText style={styles.bullet}>• Temporary email addresses generated within the app</ThemedText>
          <ThemedText style={styles.bullet}>• Email contents received by the temporary email addresses (stored temporarily)</ThemedText>
          
          <ThemedText style={styles.sectionTitle}>How We Use Your Information</ThemedText>
          <ThemedText style={styles.paragraph}>
            We use the information we collect to:
          </ThemedText>
          <ThemedText style={styles.bullet}>• Provide and maintain our Service</ThemedText>
          <ThemedText style={styles.bullet}>• Improve and optimize our Service</ThemedText>
          <ThemedText style={styles.bullet}>• Monitor and analyze usage patterns</ThemedText>
          <ThemedText style={styles.bullet}>• Detect, prevent, and address technical issues</ThemedText>
          
          <ThemedText style={styles.sectionTitle}>Data Retention</ThemedText>
          <ThemedText style={styles.paragraph}>
            All emails received by temporary email addresses are automatically deleted after 24 hours. We do not permanently store email content or attachments. Generated email addresses may be retained for a short period to prevent abuse.
          </ThemedText>
          
          <ThemedText style={styles.sectionTitle}>Information Sharing</ThemedText>
          <ThemedText style={styles.paragraph}>
            We do not sell or rent your personal information to third parties. We may share information in the following circumstances:
          </ThemedText>
          <ThemedText style={styles.bullet}>• To comply with legal obligations</ThemedText>
          <ThemedText style={styles.bullet}>• To protect our rights, privacy, safety, or property</ThemedText>
          <ThemedText style={styles.bullet}>• In connection with a merger, sale, or acquisition</ThemedText>
          
          <ThemedText style={styles.sectionTitle}>Children&apos;s Privacy</ThemedText>
          <ThemedText style={styles.paragraph}>
            Our Service is not directed to children under the age of 13. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe that your child has provided us with personal information, please contact us.
          </ThemedText>
          
          <ThemedText style={styles.sectionTitle}>Changes to This Privacy Policy</ThemedText>
          <ThemedText style={styles.paragraph}>
            We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the &quot;last updated&quot; date.
          </ThemedText>
          
          <ThemedText style={styles.sectionTitle}>Contact Us</ThemedText>
          <ThemedText style={styles.paragraph}>
            If you have any questions about this Privacy Policy, please contact us at:
          </ThemedText>
          <ThemedText style={styles.bullet}>Email: privacy@tempmail.lol</ThemedText>
          <ThemedText style={styles.bullet}>Address: 123 Privacy Street, Email City, EC 12345</ThemedText>
        </ThemedView>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  lastUpdated: {
    fontSize: 14,
    opacity: 0.6,
    marginBottom: 24,
    fontStyle: 'italic',
  },
  section: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 24,
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
  bullet: {
    fontSize: 16,
    lineHeight: 24,
    paddingLeft: 8,
    marginBottom: 8,
  },
}); 