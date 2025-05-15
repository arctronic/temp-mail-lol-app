import { FlashList } from '@shopify/flash-list';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, View } from 'react-native';
import { ThemedText } from '../components/ThemedText';
import { ThemedView } from '../components/ThemedView';
import { IconSymbol } from '../components/ui/IconSymbol';
import { Email, useEmail } from '../contexts/EmailContext';
import { useLookup } from '../contexts/LookupContext';
import { useThemeColor } from '../hooks/useThemeColor';

export default function LookupScreen() {
  const { lookupEmails, addEmailToLookup, removeEmailFromLookup, refreshLookupEmails, isLoading } = useLookup();
  const { generatedEmail } = useEmail();
  const router = useRouter();
  const [expandedEmail, setExpandedEmail] = useState<string | null>(null);
  
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');
  const cardColor = useThemeColor({}, 'card');
  const borderColor = useThemeColor({}, 'border');
  
  // Format date from MongoDB date format
  const formatDate = (date: string | { $date: string }) => {
    const dateStr = typeof date === 'string' ? date : date.$date;
    return new Date(dateStr).toLocaleString();
  };
  
  // Group emails by domain for better organization
  const emailsByDomain = useMemo(() => {
    const domains = lookupEmails.reduce((acc, email) => {
      const domain = email.address.split('@')[1];
      if (!acc[domain]) acc[domain] = [];
      acc[domain].push(email);
      return acc;
    }, {} as Record<string, typeof lookupEmails>);
    
    return Object.entries(domains)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([domain, emails]) => ({
        domain,
        emails: emails.sort((a, b) => b.addedAt - a.addedAt),
      }));
  }, [lookupEmails]);
  
  const handleAddCurrentEmail = async () => {
    if (generatedEmail) {
      await addEmailToLookup(generatedEmail);
    }
  };
  
  const handleRemoveEmail = (address: string) => {
    Alert.alert(
      'Remove Email',
      `Are you sure you want to remove ${address} from your lookup list? All saved messages will be deleted.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: () => removeEmailFromLookup(address) },
      ]
    );
  };
  
  const handleViewMessage = (email: Email) => {
    // Trigger haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    // Navigate to message view with email data
    router.push({
      pathname: '/email',
      params: { 
        id: email.id,
        from: email.sender,
        to: email.receiver,
        subject: email.subject,
        date: typeof email.date === 'string' ? email.date : email.date.$date,
        fromLookup: 'true'
      }
    });
  };
  
  const toggleExpand = (address: string) => {
    setExpandedEmail(expandedEmail === address ? null : address);
  };
  
  interface DomainGroup {
    domain: string;
    emails: typeof lookupEmails;
  }

  const renderEmailItem = ({ item: domainGroup }: { item: DomainGroup }) => (
    <View style={styles.domainGroup}>
      <ThemedView style={styles.domainHeader}>
        <View style={styles.domainBadge}>
          <IconSymbol name="at" size={14} color="#fff" />
        </View>
        <ThemedText style={styles.domainText}>{domainGroup.domain}</ThemedText>
      </ThemedView>
      
      {domainGroup.emails.map((email) => (
        <View key={email.address} style={[styles.emailCard, { backgroundColor: cardColor, borderColor }]}>
          <Pressable
            style={styles.emailHeader}
            onPress={() => toggleExpand(email.address)}
          >
            <View style={styles.emailInfo}>
              <ThemedText style={styles.emailAddress}>{email.address}</ThemedText>
              <ThemedText style={styles.emailMeta}>
                Added: {new Date(email.addedAt).toLocaleDateString()}
              </ThemedText>
              <ThemedText style={styles.emailMeta}>
                Messages: {email.messages.length}
              </ThemedText>
            </View>
            <View style={styles.emailActions}>
              <Pressable 
                style={styles.actionButton}
                onPress={() => handleRemoveEmail(email.address)}
              >
                <IconSymbol name="trash" size={18} color="#ff4747" />
              </Pressable>
              <IconSymbol 
                name={expandedEmail === email.address ? "chevron.up" : "chevron.down"} 
                size={18} 
                color={textColor}
              />
            </View>
          </Pressable>
          
          {expandedEmail === email.address && (
            <View style={styles.messagesList}>
              {email.messages.length === 0 ? (
                <ThemedText style={styles.noMessages}>
                  No messages saved for this email.
                </ThemedText>
              ) : (
                email.messages.map((message: Email, index: number) => (
                  <Pressable
                    key={message.id || index}
                    style={({ pressed }) => [
                      styles.messageItem,
                      { opacity: pressed ? 0.7 : 1, borderColor }
                    ]}
                    onPress={() => handleViewMessage(message)}
                  >
                    <View style={styles.messageInfo}>
                      <ThemedText style={styles.messageSender} numberOfLines={1}>
                        {message.sender}
                      </ThemedText>
                      <ThemedText style={styles.messageSubject} numberOfLines={1}>
                        {message.subject || '(No subject)'}
                      </ThemedText>
                      <ThemedText style={styles.messageDate}>
                        {formatDate(message.date)}
                      </ThemedText>
                    </View>
                    <IconSymbol name="chevron.right" size={16} color={textColor} />
                  </Pressable>
                ))
              )}
            </View>
          )}
        </View>
      ))}
    </View>
  );
  
  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText style={styles.title}>My Lookup List</ThemedText>
        <Pressable
          style={({ pressed }) => [
            styles.refreshButton,
            { opacity: pressed ? 0.7 : 1, backgroundColor: tintColor }
          ]}
          onPress={refreshLookupEmails}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <IconSymbol name="arrow.clockwise" size={16} color="#fff" />
          )}
        </Pressable>
      </View>
      
      <View style={styles.addSection}>
        <ThemedText style={styles.addText}>
          Add current email to lookup list:
        </ThemedText>
        <Pressable
          style={({ pressed }) => [
            styles.addButton,
            { opacity: pressed ? 0.7 : 1, backgroundColor: tintColor }
          ]}
          onPress={handleAddCurrentEmail}
        >
          <ThemedText style={styles.addButtonText}>
            Add {generatedEmail}
          </ThemedText>
          <IconSymbol name="plus" size={16} color="#fff" />
        </Pressable>
      </View>
      
      {lookupEmails.length === 0 ? (
        <View style={styles.emptyState}>
          <IconSymbol name="envelope.badge" size={60} color={textColor} style={{ opacity: 0.3 }} />
          <ThemedText style={styles.emptyTitle}>No Saved Emails</ThemedText>
          <ThemedText style={styles.emptyText}>
            Add temporary emails to your lookup list to keep their messages even if the server deletes them.
          </ThemedText>
        </View>
      ) : (
        <FlashList
          data={emailsByDomain}
          renderItem={renderEmailItem}
          estimatedItemSize={200}
          contentContainerStyle={styles.listContent}
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  refreshButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addSection: {
    marginBottom: 20,
  },
  addText: {
    fontSize: 14,
    marginBottom: 8,
  },
  addButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
  },
  addButtonText: {
    color: 'white',
    fontWeight: '500',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    textAlign: 'center',
    opacity: 0.6,
    lineHeight: 20,
  },
  listContent: {
    paddingBottom: 24,
  },
  domainGroup: {
    marginBottom: 24,
  },
  domainHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  domainBadge: {
    backgroundColor: '#4a89ff',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  domainText: {
    fontSize: 16,
    fontWeight: '600',
  },
  emailCard: {
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
    overflow: 'hidden',
  },
  emailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
  },
  emailInfo: {
    flex: 1,
  },
  emailAddress: {
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 4,
  },
  emailMeta: {
    fontSize: 12,
    opacity: 0.6,
  },
  emailActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 8,
    marginRight: 8,
  },
  messagesList: {
    borderTopWidth: 1,
    borderColor: '#e0e0e0',
    paddingVertical: 8,
  },
  noMessages: {
    padding: 16,
    textAlign: 'center',
    opacity: 0.6,
  },
  messageItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  messageInfo: {
    flex: 1,
    marginRight: 8,
  },
  messageSender: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  messageSubject: {
    fontSize: 13,
    marginBottom: 4,
  },
  messageDate: {
    fontSize: 12,
    opacity: 0.6,
  },
}); 