import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useEmail } from '@/contexts/EmailContext';
import { useLookup } from '@/contexts/LookupContext';
import { useThemeColor } from '@/hooks/useThemeColor';
import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

// Minimum character length for usernames - should match the value in EmailContext
const MIN_USERNAME_LENGTH = 4;

export const EmailGenerator = () => {
  const { 
    generatedEmail, 
    generateNewEmail, 
    copyEmailToClipboard, 
    setCustomUsername,
    resetToApiMode,
    domain 
  } = useEmail();
  
  const { addEmailToLookup } = useLookup();

  const [username, setUsername] = useState<string>('');
  const [showLengthWarning, setShowLengthWarning] = useState<boolean>(false);

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({}, 'border');
  const warningColor = useThemeColor({}, 'warning');
  const tintColor = useThemeColor({}, 'tint');

  useEffect(() => {
    // Initialize local username state from generatedEmail
    if (generatedEmail) {
      setUsername(generatedEmail.split('@')[0]);
    }
  }, [generatedEmail]);

  const handleUsernameChange = (text: string) => {
    setUsername(text);
    
    // Reset to API mode when user manually changes username
    resetToApiMode();
    setCustomUsername(text);
    
    // Show warning if username is too short
    setShowLengthWarning(text.length > 0 && text.length < MIN_USERNAME_LENGTH);
  };
  
  const handleSaveToLookup = async () => {
    if (generatedEmail && username.length >= MIN_USERNAME_LENGTH) {
      await addEmailToLookup(generatedEmail);
    } else if (username.length < MIN_USERNAME_LENGTH) {
      setShowLengthWarning(true);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.inputContainer}>
        <View style={styles.emailInputWrapper}>
          <TextInput
            value={username}
            onChangeText={handleUsernameChange}
            style={[
              styles.input,
              { 
                backgroundColor: `${backgroundColor}80`, // 50% opacity
                color: textColor,
                borderColor: borderColor,
              }
            ]}
            placeholder="Enter username"
            placeholderTextColor={`${textColor}80`}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <ThemedText style={styles.domain}>@{domain}</ThemedText>
        </View>
        
        {showLengthWarning && (
          <View style={styles.warningContainer}>
            <IconSymbol name="exclamationmark.triangle.fill" size={12} color={warningColor} />
            <ThemedText style={[styles.warningText, { color: warningColor }]}>
              Username should be at least {MIN_USERNAME_LENGTH} characters
            </ThemedText>
          </View>
        )}
      </View>

      <View style={styles.buttonContainer}>
        <Pressable
          style={({ pressed }) => [
            styles.button,
            { opacity: pressed ? 0.7 : 1 }
          ]}
          onPress={copyEmailToClipboard}
        >
          <IconSymbol name="doc.on.doc" size={16} color={textColor} />
          <ThemedText style={styles.buttonText}>Copy</ThemedText>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.button,
            { opacity: pressed ? 0.7 : 1 }
          ]}
          onPress={() => {
            resetToApiMode();
            generateNewEmail();
          }}
        >
          <IconSymbol name="arrow.clockwise" size={16} color={textColor} />
          <ThemedText style={styles.buttonText}>New</ThemedText>
        </Pressable>
      </View>
      
      <Pressable
        style={({ pressed }) => [
          styles.saveButton,
          { 
            opacity: pressed ? 0.8 : 1,
            backgroundColor: tintColor
          }
        ]}
        onPress={handleSaveToLookup}
      >
        <IconSymbol name="list.bullet.clipboard.fill" size={20} color="#fff" />
        <ThemedText style={styles.saveButtonText}>Save to Lookup List</ThemedText>
      </Pressable>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    borderRadius: 12,
    gap: 20,
  },
  inputContainer: {
    gap: 10,
  },
  emailInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  input: {
    flex: 1,
    height: 48,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 16,
  },
  domain: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 4,
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
    marginLeft: 4,
  },
  warningText: {
    fontSize: 12,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    minHeight: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    minHeight: 44,
    borderRadius: 22,
    paddingHorizontal: 16,
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
}); 