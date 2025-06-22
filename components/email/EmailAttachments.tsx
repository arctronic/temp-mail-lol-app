import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useThemeColor } from '@/hooks/useThemeColor';
import * as FileSystem from 'expo-file-system';
import * as Haptics from 'expo-haptics';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

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

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const EmailAttachments = ({ attachments }: EmailAttachmentsProps) => {
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');
  const borderColor = useThemeColor({}, 'border');
  const mutedColor = useThemeColor({}, 'tabIconDefault');
  const [downloadingAttachments, setDownloadingAttachments] = useState<Record<string, boolean>>({});
  const [expandedAttachments, setExpandedAttachments] = useState(false);

  // Animation for expand/collapse
  const attachmentsHeight = useSharedValue(0);

  const handleDownload = async (attachment: Attachment) => {
    const attachmentId = `${attachment.filename}-${Date.now()}`;
    setDownloadingAttachments(prev => ({ ...prev, [attachmentId]: true }));

    // Haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      const base64Data = attachment.data.$binary.base64;
      const fileUri = `${FileSystem.cacheDirectory}${attachment.filename}`;
      
      // Write the base64 data to a file
      await FileSystem.writeAsStringAsync(fileUri, base64Data, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Success haptic
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Show success message
      Alert.alert(
        'Download Complete',
        `${attachment.filename} has been downloaded to the app cache.`,
        [{ text: 'OK' }]
      );

    } catch (error) {
      console.error('Error downloading attachment:', error);
      
      // Error haptic
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      
      let errorMessage = 'Failed to download attachment.';
      if (error instanceof Error) {
        if (error.message.includes('permission')) {
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

  // Helper function to get file icon based on extension
  const getFileIcon = (filename: string): string => {
    const extension = filename.split('.').pop()?.toLowerCase();
    const iconMap: Record<string, string> = {
      'pdf': 'doc.richtext',
      'jpg': 'photo',
      'jpeg': 'photo', 
      'png': 'photo',
      'gif': 'photo',
      'doc': 'doc.text',
      'docx': 'doc.text',
      'xls': 'tablecells',
      'xlsx': 'tablecells',
      'txt': 'doc.plaintext',
      'zip': 'archivebox',
      'rar': 'archivebox',
      'mp3': 'music.note',
      'mp4': 'video',
      'mov': 'video',
      'avi': 'video',
    };
    return iconMap[extension || ''] || 'doc';
  };

  // Helper function to get file size (estimate from base64)
  const getFileSize = (base64: string): string => {
    const sizeInBytes = (base64.length * 3) / 4;
    if (sizeInBytes < 1024) return `${Math.round(sizeInBytes)} B`;
    if (sizeInBytes < 1024 * 1024) return `${Math.round(sizeInBytes / 1024)} KB`;
    return `${Math.round(sizeInBytes / (1024 * 1024))} MB`;
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
      'mp3': 'audio/mpeg',
      'mp4': 'video/mp4',
      'mov': 'video/quicktime',
      'avi': 'video/x-msvideo',
    };
    return mimeTypes[extension || ''] || 'application/octet-stream';
  };

  const toggleExpansion = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setExpandedAttachments(!expandedAttachments);
  };

  const animatedContainerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(1, { damping: 15 }) }],
  }));

  if (!attachments || attachments.length === 0) {
    return null;
  }

  const displayedAttachments = expandedAttachments ? attachments : attachments.slice(0, 3);
  const hasMoreAttachments = attachments.length > 3;

  return (
    <Animated.View 
      style={[styles.container, { borderColor }, animatedContainerStyle]}
      entering={FadeInDown.duration(400)}
    >
      <View style={[styles.header, { borderBottomColor: borderColor }]}>
        <View style={styles.headerContent}>
          <IconSymbol name="paperclip" size={18} color={textColor} />
          <ThemedText style={styles.title}>
            {attachments.length} Attachment{attachments.length !== 1 ? 's' : ''}
          </ThemedText>
        </View>
        {hasMoreAttachments && (
          <Pressable
            style={({ pressed }) => [
              styles.expandButton,
              { opacity: pressed ? 0.7 : 1 }
            ]}
            onPress={toggleExpansion}
          >
            <ThemedText style={[styles.expandText, { color: tintColor }]}>
              {expandedAttachments ? 'Show less' : `+${attachments.length - 3} more`}
            </ThemedText>
            <IconSymbol 
              name={expandedAttachments ? 'chevron.up' : 'chevron.down'} 
              size={14} 
              color={tintColor} 
            />
          </Pressable>
        )}
      </View>

      <View style={styles.attachmentList}>
        {displayedAttachments.map((attachment, index) => {
          const attachmentId = `${attachment.filename}-${index}`;
          const isDownloading = downloadingAttachments[attachmentId];
          const fileIcon = getFileIcon(attachment.filename);
          const fileSize = getFileSize(attachment.data.$binary.base64);

          return (
            <AnimatedPressable
              key={index}
              style={({ pressed }) => [
                styles.attachmentItem,
                { 
                  opacity: pressed ? 0.8 : 1,
                  backgroundColor: pressed ? `${tintColor}10` : 'transparent',
                  borderBottomColor: borderColor,
                  borderBottomWidth: index < displayedAttachments.length - 1 ? StyleSheet.hairlineWidth : 0,
                }
              ]}
              onPress={() => !isDownloading && handleDownload(attachment)}
              disabled={isDownloading}
              entering={FadeInDown.delay(index * 100).duration(300)}
            >
              <View style={[styles.fileIconContainer, { backgroundColor: `${tintColor}15` }]}>
                <IconSymbol name={fileIcon} size={20} color={tintColor} />
              </View>
              
              <View style={styles.fileInfo}>
                <ThemedText style={styles.filename} numberOfLines={1}>
                  {attachment.filename}
                </ThemedText>
                <ThemedText style={[styles.fileSize, { color: mutedColor }]}>
                  {fileSize} • {getMimeType(attachment.filename).split('/')[0]}
                </ThemedText>
              </View>
              
              <View style={styles.actionContainer}>
                {isDownloading ? (
                  <View style={styles.downloadingContainer}>
                    <ActivityIndicator size="small" color={tintColor} />
                    <ThemedText style={[styles.downloadingText, { color: tintColor }]}>
                      Downloading...
                    </ThemedText>
                  </View>
                ) : (
                  <View style={[styles.downloadButton, { backgroundColor: `${tintColor}20` }]}>
                    <IconSymbol name="arrow.down.circle.fill" size={24} color={tintColor} />
                  </View>
                )}
              </View>
            </AnimatedPressable>
          );
        })}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    backgroundColor: 'rgba(128, 128, 128, 0.03)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
  expandButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  expandText: {
    fontSize: 14,
    fontWeight: '500',
  },
  attachmentList: {
    paddingHorizontal: 0,
  },
  attachmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  fileIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fileInfo: {
    flex: 1,
    gap: 2,
  },
  filename: {
    fontSize: 15,
    fontWeight: '500',
    lineHeight: 20,
  },
  fileSize: {
    fontSize: 12,
    fontWeight: '400',
  },
  actionContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  downloadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  downloadingText: {
    fontSize: 12,
    fontWeight: '500',
  },
  downloadButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 