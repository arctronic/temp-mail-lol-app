import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useThemeColor } from '@/hooks/useThemeColor';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, View } from 'react-native';

interface Attachment {
  filename: string;
  data: {
    $binary: {
      base64: string;
    }
  }
}

interface EmailAttachmentsProps {
  attachments: Attachment[];
}

export const EmailAttachments = ({ attachments }: EmailAttachmentsProps) => {
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({}, 'border');
  const [downloadingAttachments, setDownloadingAttachments] = useState<Record<string, boolean>>({});

  const handleDownload = async (attachment: Attachment) => {
    const attachmentId = `${attachment.filename}-${Date.now()}`;
    setDownloadingAttachments(prev => ({ ...prev, [attachmentId]: true }));

    try {
      const base64Data = attachment.data.$binary.base64;
      const fileUri = `${FileSystem.cacheDirectory}${attachment.filename}`;
      
      // Write the base64 data to a file
      await FileSystem.writeAsStringAsync(fileUri, base64Data, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Check if sharing is available
      if (!(await Sharing.isAvailableAsync())) {
        throw new Error('Sharing is not available on this device');
      }

      // Share the file
      await Sharing.shareAsync(fileUri, {
        dialogTitle: `Share ${attachment.filename}`,
        mimeType: getMimeType(attachment.filename),
      });

      // Clean up the file after sharing
      await FileSystem.deleteAsync(fileUri, { idempotent: true });
    } catch (error) {
      console.error('Error downloading attachment:', error);
      
      let errorMessage = 'Failed to download attachment.';
      if (error instanceof Error) {
        if (error.message.includes('not available')) {
          errorMessage = 'Sharing is not available on this device.';
        } else if (error.message.includes('permission')) {
          errorMessage = 'Permission denied to access the file.';
        } else if (error.message.includes('storage')) {
          errorMessage = 'Not enough storage space available.';
        }
      }

      Alert.alert(
        'Download Error',
        errorMessage,
        [{ text: 'OK' }],
        { cancelable: true }
      );
    } finally {
      setDownloadingAttachments(prev => ({ ...prev, [attachmentId]: false }));
    }
  };

  // Helper function to get MIME type based on file extension
  const getMimeType = (filename: string): string => {
    const extension = filename.split('.').pop()?.toLowerCase();
    const mimeTypes: Record<string, string> = {
      'pdf': 'application/pdf',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'doc': 'application/msword',
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'xls': 'application/vnd.ms-excel',
      'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'txt': 'text/plain',
      'zip': 'application/zip',
      'rar': 'application/x-rar-compressed',
    };
    return mimeTypes[extension || ''] || 'application/octet-stream';
  };

  return (
    <ThemedView style={[styles.container, { borderColor }]}>
      <ThemedText style={styles.title}>Attachments</ThemedText>
      <View style={styles.attachmentList}>
        {attachments.map((attachment, index) => {
          const attachmentId = `${attachment.filename}-${index}`;
          const isDownloading = downloadingAttachments[attachmentId];

          return (
            <Pressable
              key={index}
              style={({ pressed }) => [
                styles.attachmentItem,
                { 
                  opacity: pressed ? 0.7 : 1,
                  borderBottomColor: borderColor,
                  borderBottomWidth: index < attachments.length - 1 ? 1 : 0,
                }
              ]}
              onPress={() => !isDownloading && handleDownload(attachment)}
              disabled={isDownloading}
            >
              <IconSymbol name="doc" size={20} color={textColor} />
              <ThemedText style={styles.filename} numberOfLines={1}>
                {attachment.filename}
              </ThemedText>
              {isDownloading ? (
                <ActivityIndicator size="small" color={textColor} />
              ) : (
                <IconSymbol name="arrow.down.circle" size={20} color={textColor} />
              )}
            </Pressable>
          );
        })}
      </View>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 16,
    overflow: 'hidden',
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
    padding: 12,
    borderBottomWidth: 1,
  },
  attachmentList: {
    gap: 0,
  },
  attachmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
  },
  filename: {
    flex: 1,
    fontSize: 14,
  },
}); 