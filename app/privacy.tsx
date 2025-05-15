import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useThemeColor } from '@/hooks/useThemeColor';
import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';

export default function PrivacyScreen() {
  const borderColor = useThemeColor({}, 'border');
  const today = new Date();
  const formattedDate = `${today.toLocaleString('default', { month: 'long' })} ${today.getDate()}, ${today.getFullYear()}`;

  return (
    <ScrollView style={styles.container}>
      <ThemedView style={[styles.content, { borderColor }]}>
        <ThemedText style={styles.title}>Privacy Policy</ThemedText>
        <ThemedText style={styles.lastUpdated}>Last updated: {formattedDate}</ThemedText>

        <ThemedText style={styles.sectionTitle}>1. Introduction</ThemedText>
        <ThemedText style={styles.paragraph}>
          Temp-Mail.Lol (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) is committed to protecting your privacy. 
          This Privacy Policy explains how we collect, use, and protect your information when you use 
          our temporary email application (&quot;App&quot;). Please read this Privacy Policy carefully before 
          using our App.
        </ThemedText>
        <ThemedText style={styles.paragraph}>
          By downloading, installing, or using our App, you agree to the collection and use of your 
          information in accordance with this Privacy Policy. If you do not agree with our policies 
          and practices, please do not use our App.
        </ThemedText>

        <ThemedText style={styles.sectionTitle}>2. Information We Collect</ThemedText>
        <ThemedText style={styles.paragraph}>
          We collect minimal information necessary to provide our service:
        </ThemedText>
        <ThemedView style={styles.list}>
          <ThemedText style={styles.listItem}>• <ThemedText style={styles.bold}>Temporary Email Addresses:</ThemedText> The temporary email addresses you create or generate through our App.</ThemedText>
          <ThemedText style={styles.listItem}>• <ThemedText style={styles.bold}>Email Content:</ThemedText> Emails received in your temporary inbox, including senders, subjects, messages, and attachments.</ThemedText>
          <ThemedText style={styles.listItem}>• <ThemedText style={styles.bold}>Device Information:</ThemedText> Information about your mobile device such as model, operating system version, unique device identifiers, and mobile network information.</ThemedText>
          <ThemedText style={styles.listItem}>• <ThemedText style={styles.bold}>Usage Data:</ThemedText> Basic analytics about how you interact with our App, including app features used and app performance data.</ThemedText>
          <ThemedText style={styles.listItem}>• <ThemedText style={styles.bold}>Crash Reports:</ThemedText> Information about app crashes to help us improve stability.</ThemedText>
        </ThemedView>

        <ThemedText style={styles.sectionTitle}>3. How We Collect Information</ThemedText>
        <ThemedText style={styles.paragraph}>
          We collect information through:
        </ThemedText>
        <ThemedView style={styles.list}>
          <ThemedText style={styles.listItem}>• <ThemedText style={styles.bold}>Direct Collection:</ThemedText> Information you provide when using our App, such as custom email usernames.</ThemedText>
          <ThemedText style={styles.listItem}>• <ThemedText style={styles.bold}>Automatic Collection:</ThemedText> Information collected automatically through the App, such as usage data and device information.</ThemedText>
          <ThemedText style={styles.listItem}>• <ThemedText style={styles.bold}>Email Servers:</ThemedText> Emails received from third parties to your temporary email address.</ThemedText>
        </ThemedView>
        
        <ThemedText style={styles.sectionTitle}>4. How We Use Your Information</ThemedText>
        <ThemedText style={styles.paragraph}>
          We use the collected information to:
        </ThemedText>
        <ThemedView style={styles.list}>
          <ThemedText style={styles.listItem}>• Provide and maintain our App and services</ThemedText>
          <ThemedText style={styles.listItem}>• Generate temporary email addresses based on your request</ThemedText>
          <ThemedText style={styles.listItem}>• Process and deliver emails to your temporary inbox</ThemedText>
          <ThemedText style={styles.listItem}>• Improve our App and user experience</ThemedText>
          <ThemedText style={styles.listItem}>• Monitor and prevent abuse of our services</ThemedText>
          <ThemedText style={styles.listItem}>• Analyze usage patterns to better optimize our App</ThemedText>
          <ThemedText style={styles.listItem}>• Fix bugs and troubleshoot issues</ThemedText>
          <ThemedText style={styles.listItem}>• Enforce our Terms of Service</ThemedText>
        </ThemedView>

        <ThemedText style={styles.sectionTitle}>5. Data Retention</ThemedText>
        <ThemedText style={styles.paragraph}>
          All emails and attachments in your temporary inbox are automatically deleted after a limited 
          period (typically 24 hours). We do not permanently store or archive any emails beyond this period.
        </ThemedText>
        <ThemedText style={styles.paragraph}>
          Basic usage data and crash reports may be retained for up to 90 days to help us improve our service.
        </ThemedText>

        <ThemedText style={styles.sectionTitle}>6. Data Sharing and Disclosure</ThemedText>
        <ThemedText style={styles.paragraph}>
          We do not sell or rent your personal information to third parties. We may share your information in the following circumstances:
        </ThemedText>
        <ThemedView style={styles.list}>
          <ThemedText style={styles.listItem}>• <ThemedText style={styles.bold}>Service Providers:</ThemedText> With trusted third-party service providers who help us operate our App, such as hosting providers and analytics services.</ThemedText>
          <ThemedText style={styles.listItem}>• <ThemedText style={styles.bold}>Legal Compliance:</ThemedText> When required by law, regulation, legal process, or governmental request.</ThemedText>
          <ThemedText style={styles.listItem}>• <ThemedText style={styles.bold}>Protection of Rights:</ThemedText> To protect our rights, privacy, safety, or property, as well as that of our users or others.</ThemedText>
          <ThemedText style={styles.listItem}>• <ThemedText style={styles.bold}>Business Transfers:</ThemedText> In connection with a merger, acquisition, or sale of all or a portion of our assets.</ThemedText>
        </ThemedView>

        <ThemedText style={styles.sectionTitle}>7. App Permissions</ThemedText>
        <ThemedText style={styles.paragraph}>
          Our App may request the following permissions:
        </ThemedText>
        <ThemedView style={styles.list}>
          <ThemedText style={styles.listItem}>• <ThemedText style={styles.bold}>Internet Access:</ThemedText> Required to send/receive emails and connect to our servers.</ThemedText>
          <ThemedText style={styles.listItem}>• <ThemedText style={styles.bold}>Storage:</ThemedText> Required to save attachments if you choose to download them.</ThemedText>
          <ThemedText style={styles.listItem}>• <ThemedText style={styles.bold}>Notifications:</ThemedText> To alert you about new emails (optional).</ThemedText>
          <ThemedText style={styles.listItem}>• <ThemedText style={styles.bold}>Camera:</ThemedText> Only if you choose to scan QR codes (optional).</ThemedText>
        </ThemedView>
        <ThemedText style={styles.paragraph}>
          You can manage permissions through your device settings at any time.
        </ThemedText>

        <ThemedText style={styles.sectionTitle}>8. Children's Privacy</ThemedText>
        <ThemedText style={styles.paragraph}>
          Our App is not directed to children under the age of 13. We do not knowingly collect personal 
          information from children under 13. If you are a parent or guardian and you believe that your 
          child has provided us with personal information, please contact us immediately so that we can 
          take steps to remove such information.
        </ThemedText>

        <ThemedText style={styles.sectionTitle}>9. Data Security</ThemedText>
        <ThemedText style={styles.paragraph}>
          We implement appropriate security measures to protect your information:
        </ThemedText>
        <ThemedView style={styles.list}>
          <ThemedText style={styles.listItem}>• Secure HTTPS connections</ThemedText>
          <ThemedText style={styles.listItem}>• Encryption of sensitive data</ThemedText>
          <ThemedText style={styles.listItem}>• Automatic data deletion</ThemedText>
          <ThemedText style={styles.listItem}>• Regular security assessments</ThemedText>
          <ThemedText style={styles.listItem}>• Protection against unauthorized access</ThemedText>
        </ThemedView>
        <ThemedText style={styles.paragraph}>
          However, no method of transmission over the internet or method of electronic storage is 100% 
          secure. While we strive to use commercially acceptable means to protect your information, we 
          cannot guarantee its absolute security.
        </ThemedText>

        <ThemedText style={styles.sectionTitle}>10. Your Rights</ThemedText>
        <ThemedText style={styles.paragraph}>
          Depending on your location, you may have certain rights regarding your personal information:
        </ThemedText>
        <ThemedView style={styles.list}>
          <ThemedText style={styles.listItem}>• Access your temporary emails</ThemedText>
          <ThemedText style={styles.listItem}>• Delete your temporary emails</ThemedText>
          <ThemedText style={styles.listItem}>• Create new temporary email addresses</ThemedText>
          <ThemedText style={styles.listItem}>• Request deletion of your usage data</ThemedText>
        </ThemedView>
        <ThemedText style={styles.paragraph}>
          To exercise any of these rights, please contact us using the information provided below.
        </ThemedText>

        <ThemedText style={styles.sectionTitle}>11. International Data Transfers</ThemedText>
        <ThemedText style={styles.paragraph}>
          Our services are operated in the United States. If you are located outside of the United States, 
          please be aware that information we collect will be transferred to and processed in the United States. 
          By using our App, you consent to this transfer and processing of your information in the United States, 
          which may have different data protection laws than those in your country.
        </ThemedText>

        <ThemedText style={styles.sectionTitle}>12. Changes to This Policy</ThemedText>
        <ThemedText style={styles.paragraph}>
          We may update this Privacy Policy from time to time. We will notify you of any changes by posting the 
          new Privacy Policy in the App and updating the &quot;Last updated&quot; date at the top of this policy.
        </ThemedText>
        <ThemedText style={styles.paragraph}>
          You are advised to review this Privacy Policy periodically for any changes. Changes to this 
          Privacy Policy are effective when they are posted on this page. Your continued use of the App 
          after we post changes indicates your acceptance of the updated Privacy Policy.
        </ThemedText>

        <ThemedText style={styles.sectionTitle}>13. Contact Us</ThemedText>
        <ThemedText style={styles.paragraph}>
          If you have any questions about this Privacy Policy, please contact us at:
        </ThemedText>
        <ThemedText style={styles.paragraph}>
          Email: privacy@temp-mail.lol
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
  bold: {
    fontWeight: '600',
  },
}); 