import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { AppHeader } from '@/components/ui/AppHeader';
import { useThemePreference } from '@/contexts/ThemeContext';
import { useThemeColor } from '@/hooks/useThemeColor';
import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

interface BlogPost {
  title: string;
  date: string;
  summary: string;
}

const blogPosts: BlogPost[] = [
  {
    title: 'Welcome to Temp Mail!',
    date: '2024-06-01',
    summary: 'Learn how Temp Mail can help you protect your privacy and keep your inbox clean with disposable email addresses.',
  },
  {
    title: 'Top 5 Uses for Temporary Email',
    date: '2024-05-20',
    summary: 'Discover the most popular ways our users take advantage of temporary email addresses for security and convenience.',
  },
  {
    title: 'How We Keep Your Data Secure',
    date: '2024-05-10',
    summary: 'A behind-the-scenes look at the security measures we use to protect your temporary inbox and personal information.',
  },
];

export default function BlogScreen() {
  const borderColor = useThemeColor({}, 'border');
  const { themeVersion } = useThemePreference();

  return (
    <View style={styles.container} key={`blog-screen-${themeVersion}`}>
      <AppHeader title="Blog" />
      <ScrollView style={styles.scrollView}>
        <ThemedView style={[styles.content, { borderColor }]}>  
          <ThemedText style={styles.title}>Blog</ThemedText>
          <ThemedText style={styles.subtitle}>Latest news and updates from Temp Mail</ThemedText>
          <View style={styles.postList}>
            {blogPosts.map((post, idx) => (
              <ThemedView key={idx} style={[styles.postCard, { borderColor }]}>  
                <ThemedText style={styles.postTitle}>{post.title}</ThemedText>
                <ThemedText style={styles.postDate}>{new Date(post.date).toLocaleDateString()}</ThemedText>
                <ThemedText style={styles.postSummary}>{post.summary}</ThemedText>
              </ThemedView>
            ))}
          </View>
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
    gap: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
    marginBottom: 12,
  },
  postList: {
    gap: 16,
  },
  postCard: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    gap: 8,
    backgroundColor: 'transparent',
  },
  postTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  postDate: {
    fontSize: 14,
    opacity: 0.6,
  },
  postSummary: {
    fontSize: 16,
    opacity: 0.9,
  },
}); 