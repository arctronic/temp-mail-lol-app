import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { PageHeader } from '@/components/ui/PageHeader';
import { useThemePreference } from '@/contexts/ThemeContext';
import { useThemeColor } from '@/hooks/useThemeColor';
import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

export default function TermsScreen() {
  const borderColor = useThemeColor({}, 'border');
  const { themeVersion } = useThemePreference();

  return (
    <View style={styles.container} key={`terms-screen-${themeVersion}`}>
      <PageHeader title="Terms of Service" showBackButton />
      <ScrollView style={styles.scrollView}>
        <ThemedView style={styles.content}>
          <ThemedText style={styles.title}>Terms of Service</ThemedText>
          <ThemedText style={styles.lastUpdated}>Last updated: June 1, 2024</ThemedText>
          
          <ThemedText style={styles.section}>
            Please read these Terms of Service carefully before using the Temp Mail application operated by Temp Mail (&quot;us&quot;, &quot;we&quot;, or &quot;our&quot;).
          </ThemedText>
          
          <ThemedText style={styles.sectionTitle}>Acceptance of Terms</ThemedText>
          <ThemedText style={styles.paragraph}>
            By accessing or using our Service, you agree to be bound by these Terms. If you disagree with any part of the terms, you may not access the Service.
          </ThemedText>
          
          <ThemedText style={styles.sectionTitle}>Use of Service</ThemedText>
          <ThemedText style={styles.paragraph}>
            Our Service provides temporary email addresses for your use. These email addresses are designed to expire after 24 hours. By using our Service, you agree to:
          </ThemedText>
          <ThemedText style={styles.bullet}>• Not use the Service for any illegal purposes</ThemedText>
          <ThemedText style={styles.bullet}>• Not send spam or bulk emails through our Service</ThemedText>
          <ThemedText style={styles.bullet}>• Not attempt to harm our Service or infrastructure</ThemedText>
          <ThemedText style={styles.bullet}>• Not use the Service to infringe on others&apos; rights</ThemedText>
          
          <ThemedText style={styles.sectionTitle}>Intellectual Property</ThemedText>
          <ThemedText style={styles.paragraph}>
            The Service and its original content, features, and functionality are and will remain the exclusive property of Temp Mail and its licensors. The Service is protected by copyright, trademark, and other laws.
          </ThemedText>
          
          <ThemedText style={styles.sectionTitle}>User Content</ThemedText>
          <ThemedText style={styles.paragraph}>
            You are solely responsible for any content received through the temporary email addresses provided by our Service. We do not claim ownership over any content you receive through our Service.
          </ThemedText>
          
          <ThemedText style={styles.sectionTitle}>Termination</ThemedText>
          <ThemedText style={styles.paragraph}>
            We may terminate or suspend your access to our Service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
          </ThemedText>
          
          <ThemedText style={styles.sectionTitle}>Limitation of Liability</ThemedText>
          <ThemedText style={styles.paragraph}>
            In no event shall Temp Mail, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.
          </ThemedText>
          
          <ThemedText style={styles.sectionTitle}>Disclaimer</ThemedText>
          <ThemedText style={styles.paragraph}>
            Your use of the Service is at your sole risk. The Service is provided on an &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; basis. The Service is provided without warranties of any kind, whether express or implied.
          </ThemedText>
          
          <ThemedText style={styles.sectionTitle}>Governing Law</ThemedText>
          <ThemedText style={styles.paragraph}>
            These Terms shall be governed and construed in accordance with the laws of the United States, without regard to its conflict of law provisions.
          </ThemedText>
          
          <ThemedText style={styles.sectionTitle}>Changes to Terms</ThemedText>
          <ThemedText style={styles.paragraph}>
            We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material we will try to provide at least 30 days notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.
          </ThemedText>
          
          <ThemedText style={styles.sectionTitle}>Contact Us</ThemedText>
          <ThemedText style={styles.paragraph}>
            If you have any questions about these Terms, please contact us at:
          </ThemedText>
          <ThemedText style={styles.bullet}>Email: terms@tempmail.lol</ThemedText>
          <ThemedText style={styles.bullet}>Address: 123 Terms Street, Email City, EC 12345</ThemedText>
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