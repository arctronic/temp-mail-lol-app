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
            <ThemedText style={styles.version}>Version 2.0.0</ThemedText>
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
              Generate temporary email addresses instantly or create custom ones. Use them for sign-ups, verifications, 
              or any situation where you need an email but want to protect your privacy. Save up to 5 emails in your 
              lookup list for automatic monitoring. All emails are automatically deleted after 24 hours.
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
                <ThemedText style={styles.featureText}>Custom email addresses</ThemedText>
              </ThemedView>
              <ThemedView style={styles.feature}>
                <IconSymbol name="checkmark.circle.fill" size={20} color={tintColor} />
                <ThemedText style={styles.featureText}>Lookup list (save up to 5 emails)</ThemedText>
              </ThemedView>
              <ThemedView style={styles.feature}>
                <IconSymbol name="checkmark.circle.fill" size={20} color={tintColor} />
                <ThemedText style={styles.featureText}>Push notifications for new emails</ThemedText>
              </ThemedView>
              <ThemedView style={styles.feature}>
                <IconSymbol name="checkmark.circle.fill" size={20} color={tintColor} />
                <ThemedText style={styles.featureText}>Read/unread email tracking</ThemedText>
              </ThemedView>
              <ThemedView style={styles.feature}>
                <IconSymbol name="checkmark.circle.fill" size={20} color={tintColor} />
                <ThemedText style={styles.featureText}>Automatic email checking (every 30 seconds)</ThemedText>
              </ThemedView>
              <ThemedView style={styles.feature}>
                <IconSymbol name="checkmark.circle.fill" size={20} color={tintColor} />
                <ThemedText style={styles.featureText}>Dark and light theme support</ThemedText>
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
                <ThemedText style={styles.featureText}>Cross-platform (iOS, Android, Web)</ThemedText>
              </ThemedView>
              <ThemedView style={styles.feature}>
                <IconSymbol name="checkmark.circle.fill" size={20} color={tintColor} />
                <ThemedText style={styles.featureText}>Local storage for offline access</ThemedText>
              </ThemedView>
            </ThemedView>
          </ThemedView>

          <ThemedView style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Privacy & Security</ThemedText>
            <ThemedText style={styles.text}>
              We DO NOT store any data on our servers. All emails are automatically deleted every 24 hours from our systems. 
              Your privacy is completely protected - we don&apos;t collect personal information, track your usage, or keep any records.
            </ThemedText>
            <ThemedText style={[styles.text, { marginTop: 12 }]}>
              The ONLY way to keep emails is by adding them to your lookup list, which stores them locally on your device only. 
              This local storage is completely private and under your control. Even then, the original emails are still deleted 
              from our servers after 24 hours - only your local copies remain.
            </ThemedText>
          </ThemedView>

          <ThemedView style={[styles.footer, { borderTopColor: borderColor }]}>
            <ThemedText style={styles.footerText}>
              Built with privacy in mind. No personal data collected.
            </ThemedText>
            <ThemedText style={styles.copyright}>
              © 2024 Temp Mail Services. All rights reserved.
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