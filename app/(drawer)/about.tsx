import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useThemePreference } from '@/contexts/ThemeContext';
import { useThemeColor } from '@/hooks/useThemeColor';
import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';

export default function AboutScreen() {
  const { themeVersion } = useThemePreference();
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({}, 'border');
  const tintColor = useThemeColor({}, 'tint');
  const backgroundColor = useThemeColor({}, 'background');

  return (
    <ThemedView style={styles.container} key={`about-screen-${themeVersion}`}>
      <ScrollView 
        style={[styles.scrollView, { backgroundColor }]}
        contentContainerStyle={styles.scrollContent}
      >
        <ThemedView style={styles.content}>
          <ThemedView style={styles.header}>
            <IconSymbol name="envelope.fill" size={64} color={tintColor} />
            <ThemedText style={styles.title}>About Temp Mail</ThemedText>
            <ThemedText style={styles.version}>Version 1.0.0</ThemedText>
          </ThemedView>

          <ThemedView style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Our Mission</ThemedText>
            <ThemedText style={styles.text}>
              Temp Mail provides temporary, disposable email addresses to help protect your privacy online. 
              We believe everyone deserves the right to browse the internet without compromising their personal information.
            </ThemedText>
          </ThemedView>

          <ThemedView style={styles.section}>
            <ThemedText style={styles.sectionTitle}>How It Works</ThemedText>
            <ThemedText style={styles.text}>
              Generate a temporary email address instantly. Use it for sign-ups, verifications, or any situation 
              where you need an email but want to protect your privacy. All emails are automatically deleted after 24 hours.
            </ThemedText>
          </ThemedView>

          <ThemedView style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Features</ThemedText>
            <ThemedView style={styles.featureList}>
              <ThemedView style={styles.feature}>
                <IconSymbol name="checkmark.circle.fill" size={20} color={tintColor} />
                <ThemedText style={styles.featureText}>Instant email generation</ThemedText>
              </ThemedView>
              <ThemedView style={styles.feature}>
                <IconSymbol name="checkmark.circle.fill" size={20} color={tintColor} />
                <ThemedText style={styles.featureText}>Automatic deletion after 24 hours</ThemedText>
              </ThemedView>
              <ThemedView style={styles.feature}>
                <IconSymbol name="checkmark.circle.fill" size={20} color={tintColor} />
                <ThemedText style={styles.featureText}>No registration required</ThemedText>
              </ThemedView>
              <ThemedView style={styles.feature}>
                <IconSymbol name="checkmark.circle.fill" size={20} color={tintColor} />
                <ThemedText style={styles.featureText}>Attachment support</ThemedText>
              </ThemedView>
              <ThemedView style={styles.feature}>
                <IconSymbol name="checkmark.circle.fill" size={20} color={tintColor} />
                <ThemedText style={styles.featureText}>Mobile and web access</ThemedText>
              </ThemedView>
            </ThemedView>
          </ThemedView>

          <ThemedView style={[styles.footer, { borderTopColor: borderColor }]}>
            <ThemedText style={styles.footerText}>
              Built with privacy in mind. No personal data collected.
            </ThemedText>
            <ThemedText style={styles.copyright}>
              © 2023 Temp Mail Services. All rights reserved.
            </ThemedText>
          </ThemedView>
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
  header: {
    alignItems: 'center',
    marginBottom: 32,
    paddingVertical: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  version: {
    fontSize: 16,
    opacity: 0.6,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
  },
  text: {
    fontSize: 16,
    lineHeight: 24,
    opacity: 0.8,
  },
  featureList: {
    gap: 12,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureText: {
    fontSize: 16,
    flex: 1,
  },
  footer: {
    marginTop: 32,
    paddingTop: 24,
    borderTopWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.7,
    marginBottom: 8,
  },
  copyright: {
    fontSize: 12,
    textAlign: 'center',
    opacity: 0.5,
  },
}); 