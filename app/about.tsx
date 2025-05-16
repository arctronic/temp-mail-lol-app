import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { PageHeader } from '@/components/ui/PageHeader';
import { useThemePreference } from '@/contexts/ThemeContext';
import { useThemeColor } from '@/hooks/useThemeColor';
import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

export default function AboutScreen() {
  const borderColor = useThemeColor({}, 'border');
  const { themeVersion } = useThemePreference();

  return (
    <View style={styles.container} key={`about-screen-${themeVersion}`}>
      <PageHeader title="About" showBackButton />
      <ScrollView style={styles.scrollView}>
        <ThemedView style={[styles.content, { borderColor }]}>
          <ThemedText style={styles.title}>About Temp Mail</ThemedText>
          
          <ThemedText style={styles.paragraph}>
            Temp Mail is a secure, temporary email service that helps you protect your privacy online. 
            Our service allows you to create disposable email addresses instantly, keeping your primary 
            email address safe from spam and unwanted communications.
          </ThemedText>

          <ThemedText style={styles.sectionTitle}>Our Mission</ThemedText>
          <ThemedText style={styles.paragraph}>
            We believe in protecting user privacy and providing a simple, efficient way to manage 
            temporary communications. Our goal is to make online privacy accessible to everyone.
          </ThemedText>

          <ThemedText style={styles.sectionTitle}>Key Features</ThemedText>
          <ThemedView style={styles.featureList}>
            <ThemedText style={styles.featureItem}>• Instant email generation</ThemedText>
            <ThemedText style={styles.featureItem}>• Custom username support</ThemedText>
            <ThemedText style={styles.featureItem}>• Real-time email updates</ThemedText>
            <ThemedText style={styles.featureItem}>• Secure attachment handling</ThemedText>
            <ThemedText style={styles.featureItem}>• QR code sharing</ThemedText>
            <ThemedText style={styles.featureItem}>• Cross-platform support</ThemedText>
          </ThemedView>

          <ThemedText style={styles.sectionTitle}>Privacy & Security</ThemedText>
          <ThemedText style={styles.paragraph}>
            We take your privacy seriously. All emails are automatically deleted after a short period, 
            and we never store or analyze the content of your messages. Our service is designed to be 
            completely anonymous and secure.
          </ThemedText>

          <ThemedText style={styles.sectionTitle}>Contact Us</ThemedText>
          <ThemedText style={styles.paragraph}>
            Have questions or suggestions? We&apos;d love to hear from you! Visit our contact page to get 
            in touch with our team.
          </ThemedText>
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
    gap: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 8,
    marginBottom: 4,
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 24,
    opacity: 0.9,
  },
  featureList: {
    gap: 8,
  },
  featureItem: {
    fontSize: 16,
    lineHeight: 24,
    opacity: 0.9,
  },
}); 