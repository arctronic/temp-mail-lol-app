import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useThemePreference } from '@/contexts/ThemeContext';
import { useThemeColor } from '@/hooks/useThemeColor';
import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, TextInput } from 'react-native';

export default function ContactScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({}, 'border');
  const tintColor = useThemeColor({}, 'tint');
  const { themeVersion } = useThemePreference();

  const handleSubmit = async () => {
    if (!name || !email || !subject || !message) {
      Alert.alert(
        'Missing Information',
        'Please fill in all fields before submitting.',
        [{ text: 'OK' }],
        { cancelable: true }
      );
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulating API call with a delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      Alert.alert(
        'Message Sent',
        'Thank you for contacting us. We will get back to you soon!',
        [{ text: 'OK' }],
        { cancelable: true }
      );

      // Reset form
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
    } catch (error) {
      Alert.alert(
        'Error',
        'Failed to send message. Please try again later.',
        [{ text: 'OK' }],
        { cancelable: true }
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ThemedView style={styles.container} key={`contact-screen-${themeVersion}`}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
      >
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          <ThemedView style={styles.content}>
            <ThemedText style={styles.title}>Contact Us</ThemedText>
            <ThemedText style={styles.subtitle}>
              Have a question or feedback? We&apos;d love to hear from you!
            </ThemedText>

            <ThemedView style={styles.form}>
              <ThemedView style={styles.inputGroup}>
                <ThemedText style={styles.label}>Name</ThemedText>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: `${backgroundColor}80`,
                      color: textColor,
                      borderColor,
                    }
                  ]}
                  value={name}
                  onChangeText={setName}
                  placeholder="Your name"
                  placeholderTextColor={`${textColor}80`}
                />
              </ThemedView>

              <ThemedView style={styles.inputGroup}>
                <ThemedText style={styles.label}>Email</ThemedText>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: `${backgroundColor}80`,
                      color: textColor,
                      borderColor,
                    }
                  ]}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Your email"
                  placeholderTextColor={`${textColor}80`}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </ThemedView>

              <ThemedView style={styles.inputGroup}>
                <ThemedText style={styles.label}>Subject</ThemedText>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: `${backgroundColor}80`,
                      color: textColor,
                      borderColor,
                    }
                  ]}
                  value={subject}
                  onChangeText={setSubject}
                  placeholder="Message subject"
                  placeholderTextColor={`${textColor}80`}
                />
              </ThemedView>

              <ThemedView style={styles.inputGroup}>
                <ThemedText style={styles.label}>Message</ThemedText>
                <TextInput
                  style={[
                    styles.textArea,
                    {
                      backgroundColor: `${backgroundColor}80`,
                      color: textColor,
                      borderColor,
                    }
                  ]}
                  value={message}
                  onChangeText={setMessage}
                  placeholder="Your message"
                  placeholderTextColor={`${textColor}80`}
                  multiline
                  numberOfLines={6}
                  textAlignVertical="top"
                />
              </ThemedView>

              <Pressable
                style={({ pressed }) => [
                  styles.submitButton,
                  {
                    backgroundColor: tintColor,
                    opacity: pressed || isSubmitting ? 0.7 : 1,
                  }
                ]}
                onPress={handleSubmit}
                disabled={isSubmitting}
              >
                <ThemedText style={[styles.submitButtonText, { color: '#fff' }]}>
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </ThemedText>
              </Pressable>
            </ThemedView>
          </ThemedView>
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoidView: {
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
  form: {
    gap: 16,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
  },
  input: {
    height: 48,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 16,
  },
  textArea: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 16,
    minHeight: 120,
  },
  submitButton: {
    height: 48,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
}); 