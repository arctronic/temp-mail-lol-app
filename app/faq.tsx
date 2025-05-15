import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useThemeColor } from '@/hooks/useThemeColor';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

interface FAQItem {
  question: string;
  answer: string;
}

const faqItems: FAQItem[] = [
  {
    question: 'What is Temp Mail?',
    answer: 'Temp Mail is a temporary email service that provides disposable email addresses. It helps protect your privacy by allowing you to create temporary email addresses for sign-ups, verifications, and other purposes without using your primary email.',
  },
  {
    question: 'How long do emails stay in my inbox?',
    answer: 'Emails in your temporary inbox are automatically deleted after 24 hours. This helps maintain privacy and keeps your inbox clean.',
  },
  {
    question: 'Is Temp Mail free to use?',
    answer: 'Yes, Temp Mail is completely free to use. We provide all features, including custom usernames, attachment handling, and QR code sharing, at no cost.',
  },
  {
    question: 'Can I use Temp Mail for important communications?',
    answer: 'While Temp Mail is great for temporary use, we recommend using your primary email for important communications. Temp Mail is best suited for sign-ups, verifications, and other temporary needs.',
  },
  {
    question: 'How secure is Temp Mail?',
    answer: 'We take security seriously. All emails are automatically deleted after 24 hours, and we use secure connections for all communications. However, as with any email service, we recommend not sharing sensitive information.',
  },
  {
    question: 'Can I use custom usernames?',
    answer: 'Yes! You can create custom usernames for your temporary email addresses. Just enter your desired username in the input field, and we\'ll generate an email address with that username.',
  },
  {
    question: 'What about attachments?',
    answer: 'Temp Mail supports email attachments. You can view and download attachments from your temporary inbox. All attachments are automatically deleted along with the email after 24 hours.',
  },
  {
    question: 'Is there a mobile app?',
    answer: 'Yes! You\'re currently using our mobile app. We also have a web version available at our website for desktop users.',
  },
];

export default function FAQScreen() {
  const [expandedItems, setExpandedItems] = useState<Record<number, boolean>>({});
  const borderColor = useThemeColor({}, 'border');
  const textColor = useThemeColor({}, 'text');

  const toggleItem = (index: number) => {
    setExpandedItems(prev => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  return (
    <ScrollView style={styles.container}>
      <ThemedView style={styles.content}>
        <ThemedText style={styles.title}>Frequently Asked Questions</ThemedText>
        <ThemedText style={styles.subtitle}>
          Find answers to common questions about Temp Mail
        </ThemedText>

        <View style={styles.faqList}>
          {faqItems.map((item, index) => (
            <ThemedView
              key={index}
              style={[
                styles.faqItem,
                { borderBottomColor: borderColor },
                index < faqItems.length - 1 && styles.faqItemBorder,
              ]}
            >
              <Pressable
                style={({ pressed }) => [
                  styles.questionContainer,
                  { opacity: pressed ? 0.7 : 1 }
                ]}
                onPress={() => toggleItem(index)}
              >
                <ThemedText style={styles.question}>{item.question}</ThemedText>
                <IconSymbol
                  name={expandedItems[index] ? 'chevron.up' : 'chevron.down'}
                  size={20}
                  color={textColor}
                />
              </Pressable>
              
              {expandedItems[index] && (
                <ThemedText style={styles.answer}>{item.answer}</ThemedText>
              )}
            </ThemedView>
          ))}
        </View>

        <ThemedView style={[styles.contactCard, { borderColor }]}>
          <ThemedText style={styles.contactTitle}>Still have questions?</ThemedText>
          <ThemedText style={styles.contactText}>
            Feel free to contact us through our contact form. We&apos;re here to help!
          </ThemedText>
        </ThemedView>
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
    gap: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
  },
  faqList: {
    gap: 0,
  },
  faqItem: {
    paddingVertical: 16,
  },
  faqItemBorder: {
    borderBottomWidth: 1,
  },
  questionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 16,
  },
  question: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  answer: {
    fontSize: 16,
    lineHeight: 24,
    marginTop: 12,
    opacity: 0.9,
  },
  contactCard: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 8,
  },
  contactTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  contactText: {
    fontSize: 16,
    opacity: 0.9,
  },
}); 