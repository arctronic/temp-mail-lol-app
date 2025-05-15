import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useThemeColor } from '@/hooks/useThemeColor';
import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';

export default function TermsScreen() {
  const borderColor = useThemeColor({}, 'border');
  const today = new Date();
  const formattedDate = `${today.toLocaleString('default', { month: 'long' })} ${today.getDate()}, ${today.getFullYear()}`;

  return (
    <ScrollView style={styles.container}>
      <ThemedView style={[styles.content, { borderColor }]}>
        <ThemedText style={styles.title}>Terms of Service</ThemedText>
        <ThemedText style={styles.lastUpdated}>Last updated: {formattedDate}</ThemedText>

        <ThemedText style={styles.sectionTitle}>1. Acceptance of Terms</ThemedText>
        <ThemedText style={styles.paragraph}>
          By downloading, installing, or using Temp-Mail.Lol application (&quot;App&quot;), you agree to be bound by these Terms of Service. 
          If you do not agree to these terms, please do not download, install, or use our App.
        </ThemedText>
        <ThemedText style={styles.paragraph}>
          These Terms of Service constitute a legally binding agreement between you and Temp-Mail.Lol 
          regarding your use of the App and its services.
        </ThemedText>

        <ThemedText style={styles.sectionTitle}>2. Description of Service</ThemedText>
        <ThemedText style={styles.paragraph}>
          Temp-Mail.Lol provides temporary email addresses for users to receive emails. The service 
          is intended for legitimate use cases such as:
        </ThemedText>
        <ThemedView style={styles.list}>
          <ThemedText style={styles.listItem}>• Website registrations</ThemedText>
          <ThemedText style={styles.listItem}>• Email verifications</ThemedText>
          <ThemedText style={styles.listItem}>• Testing and development</ThemedText>
          <ThemedText style={styles.listItem}>• Temporary communications</ThemedText>
          <ThemedText style={styles.listItem}>• Protecting your primary email from spam</ThemedText>
        </ThemedView>

        <ThemedText style={styles.sectionTitle}>3. Eligibility and Account Requirements</ThemedText>
        <ThemedText style={styles.paragraph}>
          You must be at least 13 years old to use our App. If you are under 18, you must have permission 
          from a parent or legal guardian to use the App and they must agree to these Terms of Service.
        </ThemedText>
        <ThemedText style={styles.paragraph}>
          Our App does not require you to create a permanent account. Temporary email addresses are 
          generated for immediate use and will expire after a limited period.
        </ThemedText>

        <ThemedText style={styles.sectionTitle}>4. Acceptable Use</ThemedText>
        <ThemedText style={styles.paragraph}>
          You agree to use Temp-Mail.Lol only for lawful purposes and in accordance with these terms. 
          You must not use our App to:
        </ThemedText>
        <ThemedView style={styles.list}>
          <ThemedText style={styles.listItem}>• Send spam or unsolicited emails</ThemedText>
          <ThemedText style={styles.listItem}>• Engage in fraudulent activities</ThemedText>
          <ThemedText style={styles.listItem}>• Violate any laws or regulations</ThemedText>
          <ThemedText style={styles.listItem}>• Harass, bully, or harm others</ThemedText>
          <ThemedText style={styles.listItem}>• Distribute malware or harmful content</ThemedText>
          <ThemedText style={styles.listItem}>• Impersonate others or misrepresent your identity</ThemedText>
          <ThemedText style={styles.listItem}>• Collect user information without consent</ThemedText>
          <ThemedText style={styles.listItem}>• Attempt to gain unauthorized access to our systems</ThemedText>
        </ThemedView>

        <ThemedText style={styles.sectionTitle}>5. Service Limitations</ThemedText>
        <ThemedText style={styles.paragraph}>
          We reserve the right to:
        </ThemedText>
        <ThemedView style={styles.list}>
          <ThemedText style={styles.listItem}>• Limit the number of emails you can receive</ThemedText>
          <ThemedText style={styles.listItem}>• Block certain types of attachments</ThemedText>
          <ThemedText style={styles.listItem}>• Filter suspicious or harmful content</ThemedText>
          <ThemedText style={styles.listItem}>• Block email addresses that violate these terms</ThemedText>
          <ThemedText style={styles.listItem}>• Modify or discontinue the service at any time</ThemedText>
          <ThemedText style={styles.listItem}>• Change service features without prior notice</ThemedText>
        </ThemedView>

        <ThemedText style={styles.sectionTitle}>6. User Responsibilities</ThemedText>
        <ThemedText style={styles.paragraph}>
          As a user of Temp-Mail.Lol, you are responsible for:
        </ThemedText>
        <ThemedView style={styles.list}>
          <ThemedText style={styles.listItem}>• Maintaining the security of your temporary email addresses</ThemedText>
          <ThemedText style={styles.listItem}>• Using the App in compliance with these terms</ThemedText>
          <ThemedText style={styles.listItem}>• Not relying on the service for critical communications</ThemedText>
          <ThemedText style={styles.listItem}>• Understanding that emails are automatically deleted after a limited period</ThemedText>
          <ThemedText style={styles.listItem}>• Any content you send or receive through the service</ThemedText>
          <ThemedText style={styles.listItem}>• Ensuring you have necessary rights to any content you access</ThemedText>
        </ThemedView>

        <ThemedText style={styles.sectionTitle}>7. Intellectual Property Rights</ThemedText>
        <ThemedText style={styles.paragraph}>
          The App, including all its content, features, and functionality, is owned by Temp-Mail.Lol and 
          is protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.
        </ThemedText>
        <ThemedText style={styles.paragraph}>
          You are granted a limited, non-exclusive, non-transferable license to use the App on your 
          mobile device. You may not copy, modify, distribute, sell, or lease any part of our App.
        </ThemedText>

        <ThemedText style={styles.sectionTitle}>8. User Content</ThemedText>
        <ThemedText style={styles.paragraph}>
          You retain ownership of any content you receive through our service. However, by using our App, 
          you grant us a limited license to store and process your content solely for the purpose of 
          providing the service.
        </ThemedText>
        <ThemedText style={styles.paragraph}>
          We do not claim ownership of your content, but you are fully responsible for ensuring you have 
          the right to receive, view, and store any content in your temporary inbox.
        </ThemedText>

        <ThemedText style={styles.sectionTitle}>9. Third-Party Links and Services</ThemedText>
        <ThemedText style={styles.paragraph}>
          Our App may contain links to third-party websites or services. We are not responsible for 
          the content or practices of any third-party websites or services linked to from our App. 
          Your use of such websites or services is at your own risk and subject to their terms and policies.
        </ThemedText>

        <ThemedText style={styles.sectionTitle}>10. Termination</ThemedText>
        <ThemedText style={styles.paragraph}>
          We may terminate or suspend your access to the App immediately, without prior notice, for 
          any reason including, but not limited to, violations of these Terms of Service.
        </ThemedText>
        <ThemedText style={styles.paragraph}>
          Upon termination:
        </ThemedText>
        <ThemedView style={styles.list}>
          <ThemedText style={styles.listItem}>• Your temporary email addresses will be deactivated</ThemedText>
          <ThemedText style={styles.listItem}>• All emails in your inbox will be permanently deleted</ThemedText>
          <ThemedText style={styles.listItem}>• You will no longer have access to any content stored in the App</ThemedText>
          <ThemedText style={styles.listItem}>• These Terms of Service will continue to apply where applicable</ThemedText>
        </ThemedView>

        <ThemedText style={styles.sectionTitle}>11. Disclaimer of Warranties</ThemedText>
        <ThemedText style={styles.paragraph}>
          THE APP IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT WARRANTIES OF ANY KIND, EITHER 
          EXPRESS OR IMPLIED. TO THE FULLEST EXTENT PERMITTED BY LAW, WE DISCLAIM ALL WARRANTIES, INCLUDING 
          BUT NOT LIMITED TO:
        </ThemedText>
        <ThemedView style={styles.list}>
          <ThemedText style={styles.listItem}>• Uninterrupted service</ThemedText>
          <ThemedText style={styles.listItem}>• Delivery of all emails</ThemedText>
          <ThemedText style={styles.listItem}>• Security of your communications</ThemedText>
          <ThemedText style={styles.listItem}>• Accuracy, reliability, or completeness of any information</ThemedText>
          <ThemedText style={styles.listItem}>• Suitability for any specific purpose</ThemedText>
          <ThemedText style={styles.listItem}>• Freedom from viruses or other harmful components</ThemedText>
        </ThemedView>

        <ThemedText style={styles.sectionTitle}>12. Limitation of Liability</ThemedText>
        <ThemedText style={styles.paragraph}>
          TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, 
          SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING FROM OR RELATED TO YOUR USE OF THE APP, 
          including but not limited to:
        </ThemedText>
        <ThemedView style={styles.list}>
          <ThemedText style={styles.listItem}>• Lost or undelivered emails</ThemedText>
          <ThemedText style={styles.listItem}>• Service interruptions</ThemedText>
          <ThemedText style={styles.listItem}>• Data loss</ThemedText>
          <ThemedText style={styles.listItem}>• Unauthorized access to your communications</ThemedText>
          <ThemedText style={styles.listItem}>• Damages for loss of profits, goodwill, or other intangible losses</ThemedText>
        </ThemedView>

        <ThemedText style={styles.sectionTitle}>13. Governing Law</ThemedText>
        <ThemedText style={styles.paragraph}>
          These Terms shall be governed by and construed in accordance with the laws of the United States, 
          without regard to its conflict of law provisions.
        </ThemedText>
        <ThemedText style={styles.paragraph}>
          Any legal action or proceeding arising out of or relating to these Terms shall be filed 
          exclusively in the appropriate courts located in the United States, and you consent to the 
          personal jurisdiction of such courts.
        </ThemedText>

        <ThemedText style={styles.sectionTitle}>14. Changes to Terms</ThemedText>
        <ThemedText style={styles.paragraph}>
          We may modify these Terms at any time. We will notify users of significant changes by 
          posting the updated Terms in the App and updating the &quot;Last updated&quot; date.
        </ThemedText>
        <ThemedText style={styles.paragraph}>
          Your continued use of the App after any changes to these Terms constitutes your acceptance 
          of the new Terms. If you do not agree to the modified terms, you should stop using the App.
        </ThemedText>

        <ThemedText style={styles.sectionTitle}>15. Contact Information</ThemedText>
        <ThemedText style={styles.paragraph}>
          For questions about these Terms of Service, please contact us at support@temp-mail.lol.
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
    marginBottom: 16,
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
    opacity: 0.9,
    marginBottom: 8,
  },
  list: {
    gap: 8,
    marginTop: 8,
    marginBottom: 8,
  },
  listItem: {
    fontSize: 16,
    lineHeight: 24,
    opacity: 0.9,
  },
}); 