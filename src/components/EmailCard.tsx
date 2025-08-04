import React from 'react';
import {View, StyleSheet, TouchableOpacity} from 'react-native';
import {Card, Text, Avatar, IconButton, useTheme} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {Email} from '../types';

interface EmailCardProps {
  email: Email;
  onPress: () => void;
  onDelete?: () => void;
  showActions?: boolean;
}

const EmailCard: React.FC<EmailCardProps> = ({
  email,
  onPress,
  onDelete,
  showActions = true,
}) => {
  const theme = useTheme();

  const formatTimestamp = (timestamp: string): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInHours * 60);
      return `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const truncateText = (text: string, maxLength: number): string => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  };

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Card
        style={[
          styles.card,
          {
            backgroundColor: email.isRead
              ? theme.colors.surface
              : theme.colors.secondaryContainer,
          },
        ]}>
        <Card.Content style={styles.content}>
          <View style={styles.header}>
            <Avatar.Text
              size={40}
              label={getInitials(email.from)}
              style={[
                styles.avatar,
                {backgroundColor: theme.colors.primary},
              ]}
              labelStyle={{color: theme.colors.onPrimary}}
            />
            <View style={styles.emailInfo}>
              <View style={styles.senderRow}>
                <Text
                  variant="titleMedium"
                  style={[
                    styles.sender,
                    {
                      color: theme.colors.onSurface,
                      fontWeight: email.isRead ? 'normal' : 'bold',
                    },
                  ]}>
                  {truncateText(email.from, 25)}
                </Text>
                <Text
                  variant="bodySmall"
                  style={[styles.timestamp, {color: theme.colors.onSurfaceVariant}]}>
                  {formatTimestamp(email.timestamp)}
                </Text>
              </View>
              <Text
                variant="bodyMedium"
                style={[
                  styles.subject,
                  {
                    color: theme.colors.onSurface,
                    fontWeight: email.isRead ? 'normal' : '600',
                  },
                ]}>
                {truncateText(email.subject || 'No Subject', 40)}
              </Text>
              <Text
                variant="bodySmall"
                style={[styles.preview, {color: theme.colors.onSurfaceVariant}]}>
                {truncateText(
                  email.body.replace(/<[^>]*>/g, '').trim() || 'No content',
                  60
                )}
              </Text>
            </View>
            {showActions && onDelete && (
              <IconButton
                icon="delete"
                size={20}
                iconColor={theme.colors.error}
                onPress={onDelete}
                style={styles.deleteButton}
              />
            )}
          </View>
          
          {email.attachments && email.attachments.length > 0 && (
            <View style={styles.attachmentRow}>
              <Icon
                name="attach-file"
                size={16}
                color={theme.colors.onSurfaceVariant}
              />
              <Text
                variant="bodySmall"
                style={[
                  styles.attachmentText,
                  {color: theme.colors.onSurfaceVariant},
                ]}>
                {email.attachments.length} attachment
                {email.attachments.length > 1 ? 's' : ''}
              </Text>
            </View>
          )}
          
          {!email.isRead && (
            <View
              style={[
                styles.unreadIndicator,
                {backgroundColor: theme.colors.primary},
              ]}
            />
          )}
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 4,
    elevation: 2,
  },
  content: {
    paddingVertical: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  avatar: {
    marginRight: 12,
  },
  emailInfo: {
    flex: 1,
  },
  senderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  sender: {
    flex: 1,
  },
  timestamp: {
    marginLeft: 8,
  },
  subject: {
    marginBottom: 4,
  },
  preview: {
    lineHeight: 18,
  },
  deleteButton: {
    margin: 0,
  },
  attachmentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingLeft: 52, // Align with email content
  },
  attachmentText: {
    marginLeft: 4,
  },
  unreadIndicator: {
    position: 'absolute',
    right: 8,
    top: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});

export default EmailCard;

