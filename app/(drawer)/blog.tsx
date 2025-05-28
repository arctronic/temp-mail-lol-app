import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useThemePreference } from '@/contexts/ThemeContext';
import { useThemeColor } from '@/hooks/useThemeColor';
import React from 'react';
import { Pressable, ScrollView, StyleSheet } from 'react-native';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
}

const blogPosts: BlogPost[] = [
  {
    id: '1',
    title: 'Protecting Your Privacy Online',
    excerpt: 'Learn how temporary email addresses can help protect your personal information when signing up for online services.',
    date: '2023-10-15',
    readTime: '3 min read'
  },
  {
    id: '2',
    title: 'The Rise of Email Spam',
    excerpt: 'Understanding how spam works and why temporary emails are an effective solution for avoiding unwanted messages.',
    date: '2023-10-10',
    readTime: '5 min read'
  },
  {
    id: '3',
    title: 'Best Practices for Online Security',
    excerpt: 'Essential tips for staying safe online, including the use of temporary emails for account verification.',
    date: '2023-10-05',
    readTime: '4 min read'
  }
];

export default function BlogScreen() {
  const { themeVersion } = useThemePreference();
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({}, 'border');
  const tintColor = useThemeColor({}, 'tint');
  const backgroundColor = useThemeColor({}, 'background');

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <ThemedView style={styles.container} key={`blog-screen-${themeVersion}`}>
      <ScrollView 
        style={[styles.scrollView, { backgroundColor }]}
        contentContainerStyle={styles.scrollContent}
      >
        <ThemedView style={styles.content}>
          <ThemedText style={styles.title}>Blog</ThemedText>
          <ThemedText style={styles.subtitle}>
            Stay updated with the latest news and tips about online privacy and security.
          </ThemedText>

          <ThemedView style={styles.blogList}>
            {blogPosts.map((post) => (
              <Pressable
                key={post.id}
                style={({ pressed }) => [
                  styles.blogPost,
                  { 
                    borderBottomColor: borderColor,
                    backgroundColor: pressed ? `${backgroundColor}80` : 'transparent'
                  }
                ]}
              >
                <ThemedView style={styles.postContent}>
                  <ThemedText style={styles.postTitle}>{post.title}</ThemedText>
                  <ThemedText style={styles.postExcerpt}>{post.excerpt}</ThemedText>
                  <ThemedView style={styles.postMeta}>
                    <ThemedText style={styles.postDate}>{formatDate(post.date)}</ThemedText>
                    <ThemedText style={styles.readTime}>{post.readTime}</ThemedText>
                  </ThemedView>
                </ThemedView>
                <IconSymbol name="chevron.right" size={20} color={tintColor} />
              </Pressable>
            ))}
          </ThemedView>

          <ThemedView style={[styles.comingSoon, { borderTopColor: borderColor }]}>
            <IconSymbol name="doc.text.fill" size={48} color={`${textColor}40`} />
            <ThemedText style={styles.comingSoonTitle}>More Posts Coming Soon</ThemedText>
            <ThemedText style={styles.comingSoonText}>
              We're working on more helpful articles about privacy, security, and online safety.
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
  blogList: {
    flex: 1,
  },
  blogPost: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  postContent: {
    flex: 1,
    marginRight: 12,
  },
  postTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  postExcerpt: {
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.7,
    marginBottom: 8,
  },
  postMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  postDate: {
    fontSize: 12,
    opacity: 0.6,
  },
  readTime: {
    fontSize: 12,
    opacity: 0.6,
  },
  comingSoon: {
    marginTop: 32,
    paddingTop: 32,
    borderTopWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
  },
  comingSoonTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  comingSoonText: {
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.7,
    lineHeight: 20,
  },
}); 