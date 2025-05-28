import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useThemePreference } from '@/contexts/ThemeContext';
import { useThemeColor } from '@/hooks/useThemeColor';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet } from 'react-native';

interface FAQItem {
  question: string;
  answer: string;
}

const faqData: FAQItem[] = [
  {
    question: "What is Temp Mail?",
    answer: "Temp Mail is a service that provides temporary, disposable email addresses to protect your privacy when signing up for online services."
  },
  {
    question: "How long do emails stay in my inbox?",
    answer: "Emails are automatically deleted after 24 hours to ensure your privacy and keep the service clean."
  },
  {
    question: "Is Temp Mail free to use?",
    answer: "Yes, Temp Mail is completely free to use. No registration or payment required."
  },
  {
    question: "Can I use Temp Mail for important communications?",
    answer: "No, Temp Mail is designed for temporary use only. Don't use it for important communications as emails are automatically deleted."
  },
  {
    question: "How secure is Temp Mail?",
    answer: "Temp Mail uses secure connections and automatically deletes all emails. However, remember that temporary emails are not suitable for sensitive information."
  },
  {
    question: "Can I use custom usernames?",
    answer: "Currently, email addresses are randomly generated to ensure uniqueness and privacy."
  },
  {
    question: "What about attachments?",
    answer: "Yes, you can receive emails with attachments. All attachments are also automatically deleted after 24 hours."
  },
  {
    question: "Is there a mobile app?",
    answer: "You're using it! This is our mobile app built with React Native for both iOS and Android."
  }
];

export default function FAQScreen() {
  const { themeVersion } = useThemePreference();
  const [expandedItems, setExpandedItems] = useState<number[]>([]);
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({}, 'border');
  const tintColor = useThemeColor({}, 'tint');
  const backgroundColor = useThemeColor({}, 'background');

  const toggleExpanded = (index: number) => {
    setExpandedItems(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  return (
    <ThemedView style={styles.container} key={`faq-screen-${themeVersion}`}>
      <ScrollView 
        style={[styles.scrollView, { backgroundColor }]}
        contentContainerStyle={styles.scrollContent}
      >
        <ThemedView style={styles.content}>
          <ThemedText style={styles.title}>Frequently Asked Questions</ThemedText>
          <ThemedText style={styles.subtitle}>
            Find answers to common questions about Temp Mail
          </ThemedText>

          <ThemedView style={styles.faqList}>
            {faqData.map((item, index) => (
              <ThemedView key={index} style={[styles.faqItem, { borderBottomColor: borderColor }]}>
                <Pressable
                  style={({ pressed }) => [
                    styles.questionContainer,
                    { backgroundColor: pressed ? `${backgroundColor}80` : 'transparent' }
                  ]}
                  onPress={() => toggleExpanded(index)}
                >
                  <ThemedText style={styles.question}>{item.question}</ThemedText>
                  <IconSymbol
                    name={expandedItems.includes(index) ? "chevron.up" : "chevron.down"}
                    size={20}
                    color={tintColor}
                  />
                </Pressable>
                {expandedItems.includes(index) && (
                  <ThemedView style={styles.answerContainer}>
                    <ThemedText style={styles.answer}>{item.answer}</ThemedText>
                  </ThemedView>
                )}
              </ThemedView>
            ))}
          </ThemedView>

          <ThemedView style={[styles.contactSection, { borderTopColor: borderColor }]}>
            <ThemedText style={styles.contactTitle}>Still have questions?</ThemedText>
            <ThemedText style={styles.contactText}>
              Feel free to contact us through our contact form. We're here to help!
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
  title: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
    marginBottom: 24,
  },
  faqList: {
    flex: 1,
  },
  faqItem: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    marginBottom: 8,
  },
  questionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 4,
  },
  question: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
    marginRight: 12,
  },
  answerContainer: {
    paddingHorizontal: 4,
    paddingBottom: 16,
  },
  answer: {
    fontSize: 15,
    lineHeight: 22,
    opacity: 0.8,
  },
  contactSection: {
    marginTop: 32,
    paddingTop: 24,
    borderTopWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
  },
  contactTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  contactText: {
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.7,
  },
}); 