import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useThemeColor } from '@/hooks/useThemeColor';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { decode } from 'html-entities';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Dimensions, Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import AutoHeightWebView from 'react-native-autoheight-webview';
import ParsedText from 'react-native-parsed-text';
import RenderHtml from 'react-native-render-html';
import sanitizeHtml from 'sanitize-html';

interface EmailContentProps {
  htmlContent: string;
  allowExternalImages?: boolean;
}

// Best practices implementation following the July 2025 guide
class EmailContentProcessor {
  // Calculate content size in KB (like the guide suggests)
  static getContentSizeKB(content: string): number {
    return new Blob([content]).size / 1024;
  }

  // Clean and normalize email content
  static normalizeContent(content: string): string {
    if (!content) return '';
    
    return content
      .replace(/\\n/g, '\n')
      .replace(/\\t/g, '\t')
      .replace(/\\"/g, '"')
      .replace(/\\'/g, "'")
      .replace(/\\r/g, '\r')
      .replace(/\\\\/g, '\\')
      .replace(/&nbsp;/g, ' ')
      .trim();
  }

  // Fast content type detection
  static detectContentType(content: string): 'html' | 'text' {
    if (!content) return 'text';
    
    // Quick HTML indicators
    const hasHtmlTags = /<(?:html|head|body|div|p|br|table|tr|td|ul|ol|li|h[1-6]|strong|b|em|i|a|img|span)\b[^>]*>/i.test(content);
    const hasHtmlEntities = /&(?:amp|lt|gt|quot|nbsp|#\d+|#x[0-9a-f]+);/i.test(content);
    const hasHtmlStructure = /<[^>]+>.*<\/[^>]+>/s.test(content);
    
    // Additional check for malformed HTML or text that looks like HTML but isn't
    const htmlTagCount = (content.match(/<[^>]+>/g) || []).length;
    const urlCount = (content.match(/https?:\/\/\S+/g) || []).length;
    
    // If there are many URLs but few HTML tags, it's likely plain text
    if (urlCount > 2 && htmlTagCount < 3) {
      return 'text';
    }
    
    const isHtml = hasHtmlTags || hasHtmlEntities || hasHtmlStructure;
    
    if (__DEV__) {
      console.log('🔍 Content Detection:', {
        hasHtmlTags,
        hasHtmlEntities, 
        hasHtmlStructure,
        htmlTagCount,
        urlCount,
        finalDecision: isHtml ? 'html' : 'text'
      });
    }
    
    return isHtml ? 'html' : 'text';
  }

  // Professional HTML sanitization using sanitize-html (as recommended)
  static sanitizeHtml(html: string, allowExternalImages: boolean = false): string {
    if (!html) return '';

    const allowedSchemes = ['http', 'https', 'mailto', 'tel'];
    if (allowExternalImages) {
      allowedSchemes.push('data', 'cid');
    }

    return sanitizeHtml(html, {
      allowedTags: [
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'p', 'div', 'span', 'br', 'hr',
        'strong', 'b', 'em', 'i', 'u', 's', 'sub', 'sup',
        'ul', 'ol', 'li',
        'table', 'thead', 'tbody', 'tr', 'th', 'td',
        'blockquote', 'pre', 'code',
        'a', 'img',
        'center', 'font', 'small'
      ],
      allowedAttributes: {
        a: ['href', 'name', 'target'],
        img: allowExternalImages ? ['src', 'alt', 'title', 'width', 'height'] : ['alt', 'title'],
        table: ['width', 'cellpadding', 'cellspacing', 'border'],
        td: ['colspan', 'rowspan', 'width', 'height'],
        th: ['colspan', 'rowspan', 'width', 'height'],
        '*': ['style', 'class'] // Allow basic styling
      },
      allowedSchemes,
      allowedSchemesAppliedToAttributes: ['href', 'src'],
      disallowedTagsMode: 'discard',
      allowedIframeHostnames: [], // No iframes allowed
             // Remove dangerous protocols
       transformTags: {
         'img': (tagName: string, attribs: { [key: string]: string }) => {
           // Block external images if not allowed
           if (!allowExternalImages && attribs.src && !attribs.src.startsWith('data:') && !attribs.src.startsWith('cid:')) {
             return {
               tagName: 'div',
               attribs: {
                 style: 'background: #f0f0f0; padding: 8px; border-radius: 4px; text-align: center; margin: 8px 0;'
               },
               text: '🖼️ External image blocked for privacy'
             };
           }
           return { tagName, attribs };
         }
       }
    });
  }

  // Enhanced plain text formatting
  static formatPlainText(text: string): string {
    if (!text) return '';
    
    // Decode HTML entities
    let formatted = decode(text);
    
    // Preserve paragraph structure and handle mixed URL/text content
    const paragraphs = formatted.split(/\n\s*\n/);
    return paragraphs
      .map(p => {
        // Handle lines that mix text and URLs (common in Facebook emails)
        let line = p.replace(/\n/g, ' ').trim();
        
        // Add spaces around URLs to help with parsing
        line = line.replace(/(https?:\/\/\S+)/g, ' $1 ');
        
        // Clean up extra spaces
        line = line.replace(/\s+/g, ' ').trim();
        
        return line;
      })
      .filter(p => p.length > 0)
      .join('\n\n');
  }

  // Decision logic following the guide: "email HTML length > 150 kB → WebView"
  static shouldUseWebView(html: string): boolean {
    if (!html || html.length < 1000) return false;
    
    const sizeKB = EmailContentProcessor.getContentSizeKB(html);
    
    // Follow the guide's recommendation: >150KB = WebView
    if (sizeKB > 150) return true;
    
    // Also check for complex CSS that RenderHtml can't handle
    const hasComplexCSS = /(?:position\s*:\s*(?:absolute|fixed|relative)|float\s*:|display\s*:\s*(?:flex|grid)|transform\s*:|@media)/i.test(html);
    const hasComplexTables = (html.match(/<table/gi) || []).length > 2;
    const hasMJMLPatterns = /mso-|outlook|conditional/i.test(html);
    
    return hasComplexCSS || hasComplexTables || hasMJMLPatterns;
  }
}

export const EmailContent = ({ htmlContent, allowExternalImages = false }: EmailContentProps) => {
  const [renderState, setRenderState] = useState<{
    mode: 'loading' | 'html' | 'webview' | 'text' | 'error';
    content: string;
    sanitizedContent?: string;
  }>({
    mode: 'loading',
    content: '',
  });

  const [showExternalImages, setShowExternalImages] = useState(allowExternalImages);

  // Theme colors
  const borderColor = useThemeColor({}, 'border');
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');
  const { width } = Dimensions.get('window');

  // Process content following best practices from the guide
  const processedContent = useMemo(() => {
    if (!htmlContent) return null;
    
    const normalized = EmailContentProcessor.normalizeContent(htmlContent);
    const contentType = EmailContentProcessor.detectContentType(normalized);
    
    if (contentType === 'html') {
      // Use sanitize-html as recommended
      const sanitized = EmailContentProcessor.sanitizeHtml(normalized, showExternalImages);
      const needsWebView = EmailContentProcessor.shouldUseWebView(sanitized);
      
      return {
        type: needsWebView ? 'webview' : 'html',
        content: sanitized,
        originalContent: normalized,
        sizeKB: EmailContentProcessor.getContentSizeKB(sanitized),
      };
    }
    
    return {
      type: 'text',
      content: EmailContentProcessor.formatPlainText(normalized),
      originalContent: normalized,
      sizeKB: EmailContentProcessor.getContentSizeKB(normalized),
    };
  }, [htmlContent, showExternalImages]);

  // Handle link presses
  const handleLinkPress = async (url: string) => {
    try {
      const safeUrlPattern = /^(https?:\/\/|mailto:|tel:)/i;
      if (safeUrlPattern.test(url)) {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        await Linking.openURL(url);
      } else {
        Alert.alert('Invalid Link', 'This link cannot be opened for security reasons.');
      }
    } catch (error) {
      console.error('Failed to open link:', error);
      Alert.alert('Error', 'Failed to open link');
    }
  };

  // Handle OTP copying
  const handleOTPPress = async (otp: string) => {
    try {
      await Clipboard.setStringAsync(otp);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('OTP Copied', `${otp} has been copied to clipboard`);
    } catch (error) {
      console.error('Failed to copy OTP:', error);
    }
  };

  // Handle external image loading (like Gmail's "Load images" button)
  const handleLoadExternalImages = () => {
    setShowExternalImages(true);
  };

  // Process content when it changes
  useEffect(() => {
    if (!processedContent) {
      setRenderState({ mode: 'error', content: 'No content available' });
      return;
    }

    try {
      if (processedContent.type === 'webview') {
        setRenderState({
          mode: 'webview',
          content: processedContent.content,
          sanitizedContent: processedContent.content,
        });
      } else if (processedContent.type === 'html') {
        setRenderState({
          mode: 'html',
          content: processedContent.content,
          sanitizedContent: processedContent.content,
        });
      } else {
        setRenderState({
          mode: 'text',
          content: processedContent.content,
        });
      }
    } catch (error) {
      console.error('Error processing email content:', error);
      setRenderState({
        mode: 'text',
        content: processedContent?.originalContent || htmlContent || 'Error processing content',
      });
    }
  }, [processedContent, htmlContent]);

  // Optimized RenderHtml configuration (following guide recommendations)
  const renderHtmlConfig = useMemo(() => ({
    contentWidth: width - 32,
    tagsStyles: {
      body: {
        color: textColor,
        fontSize: 16,
        lineHeight: 24,
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
        margin: 0,
        padding: 0,
      },
      a: {
        color: tintColor,
        textDecorationLine: 'underline' as const,
      },
      p: {
        marginBottom: 16,
        lineHeight: 24,
      },
      blockquote: {
        borderLeftWidth: 3,
        borderLeftColor: tintColor,
        paddingLeft: 16,
        marginLeft: 0,
        fontStyle: 'italic' as const,
        backgroundColor: borderColor + '10',
        padding: 12,
        borderRadius: 6,
      },
      img: {
        borderRadius: 8,
        marginVertical: 8,
        maxWidth: '100%',
      },
      table: {
        borderWidth: 1,
        borderColor: borderColor,
        borderRadius: 6,
        marginVertical: 16,
        borderCollapse: 'collapse' as const,
      },
      th: {
        backgroundColor: borderColor + '40',
        fontWeight: 'bold' as const,
        padding: 8,
        borderWidth: 1,
        borderColor: borderColor,
      },
      td: {
        padding: 8,
        borderWidth: 1,
        borderColor: borderColor,
      },
      pre: {
        backgroundColor: borderColor + '20',
        padding: 12,
        borderRadius: 6,
        fontSize: 14,
        fontFamily: 'Courier New, monospace',
      },
      code: {
        backgroundColor: borderColor + '30',
        paddingHorizontal: 4,
        paddingVertical: 2,
        borderRadius: 3,
        fontSize: 14,
        fontFamily: 'Courier New, monospace',
      },
    },
    systemFonts: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica', 'Arial'],
    renderersProps: {
      a: {
        onPress: (event: any, href: string) => handleLinkPress(href),
      },
      img: {
        enableExperimentalPercentWidth: true,
      },
    },
    defaultTextProps: {
      selectable: false,
    },
  }), [width, textColor, tintColor, borderColor]);

  // Optimized ParsedText patterns
  const textPatterns = useMemo(() => [
    {
      pattern: /\b\d{4,8}\b/g,
      style: {
        backgroundColor: `${tintColor}20`,
        color: tintColor,
        fontWeight: '700' as const,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: `${tintColor}40`,
      },
      onPress: handleOTPPress,
    },
    // Enhanced URL pattern to handle Facebook's long URLs
    {
      pattern: /(https?:\/\/(?:[-\w.])+(?::[0-9]+)?(?:\/(?:[\w\/_.])*)?(?:\?(?:[\w&%=.#-])*)?(?:#(?:[\w.-])*)?)/g,
      style: {
        color: tintColor,
        textDecorationLine: 'underline' as const,
        fontSize: 14, // Slightly smaller for long URLs
      },
      onPress: handleLinkPress,
    },
    {
      type: 'email' as const,
      style: {
        color: tintColor,
        textDecorationLine: 'underline' as const,
      },
      onPress: (email: string) => handleLinkPress(`mailto:${email}`),
    },
    {
      type: 'phone' as const,
      style: {
        color: tintColor,
        textDecorationLine: 'underline' as const,
      },
      onPress: (phone: string) => handleLinkPress(`tel:${phone}`),
    },
  ], [tintColor]);

  // Debug logging for development
  useEffect(() => {
    if (__DEV__ && htmlContent) {
      console.log('📧 Email Content Debug:');
      console.log('Raw content length:', htmlContent.length);
      console.log('Raw content preview:', htmlContent.substring(0, 200) + '...');
      console.log('Content type detected:', processedContent?.type);
      console.log('Processed content preview:', processedContent?.content.substring(0, 200) + '...');
    }
  }, [htmlContent, processedContent]);

  // Check if content has external images that are blocked
  const hasBlockedImages = useMemo(() => {
    if (!htmlContent || showExternalImages) return false;
    
    // Check for external image URLs
    const externalImagePattern = /<img[^>]+src\s*=\s*["'](?!data:|cid:)[^"']+["'][^>]*>/gi;
    return externalImagePattern.test(htmlContent);
  }, [htmlContent, showExternalImages]);

  return (
    <ThemedView style={[styles.container, { borderColor }]}>
      {/* External Images Notice (like Gmail) */}
      {hasBlockedImages && (
        <View style={[styles.imagesNotice, { backgroundColor: borderColor + '20', borderColor }]}>
          <Text style={[styles.imagesNoticeText, { color: textColor }]}>
            🖼️ External images are blocked for privacy
          </Text>
          <TouchableOpacity
            style={[styles.loadImagesButton, { backgroundColor: tintColor }]}
            onPress={handleLoadExternalImages}
          >
            <Text style={styles.loadImagesButtonText}>Load Images</Text>
          </TouchableOpacity>
        </View>
      )}

      {renderState.mode === 'loading' ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={tintColor} size="small" />
          <ThemedText style={styles.loadingText}>Loading email content...</ThemedText>
        </View>
      ) : renderState.mode === 'error' ? (
        <View style={styles.errorContainer}>
          <ThemedText style={[styles.errorText, { color: '#ff6b6b' }]}>
            Failed to load email content
          </ThemedText>
          <Text style={[styles.errorDetails, { color: textColor + '80' }]}>
            {renderState.content}
          </Text>
        </View>
      ) : renderState.mode === 'webview' ? (
        /* Using react-native-autoheight-webview as recommended */
        <AutoHeightWebView
          style={[styles.webView, { backgroundColor }]}
          source={{ html: renderState.content }}
          scrollEnabled={false}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          javaScriptEnabled={true}
          domStorageEnabled={false}
          allowsInlineMediaPlayback={false}
          onShouldStartLoadWithRequest={(request) => {
            // Handle link clicks
            if (request.url !== 'about:blank') {
              handleLinkPress(request.url);
              return false;
            }
            return true;
          }}
          onError={() => {
            // Fallback to HTML mode if WebView fails
            setRenderState(prev => ({
              ...prev,
              mode: 'html',
            }));
          }}
        />
      ) : renderState.mode === 'html' ? (
        <View style={styles.htmlContainer}>
          <RenderHtml
            source={{ html: renderState.content }}
            {...renderHtmlConfig}
          />
        </View>
      ) : (
        <View style={styles.textContainer}>
          <ParsedText
            style={[styles.textContent, { color: textColor }]}
            parse={textPatterns}
            childrenProps={{ 
              allowFontScaling: false,
              // Better text wrapping for long URLs
              numberOfLines: undefined,
              adjustsFontSizeToFit: false,
            }}
          >
            {renderState.content}
          </ParsedText>
          
          {/* Show raw content in development for debugging */}
          {__DEV__ && (
            <View style={[styles.debugInfo, { backgroundColor: borderColor + '10', borderColor, marginTop: 16 }]}>
              <Text style={[styles.debugText, { color: textColor + '80' }]}>
                Raw content length: {htmlContent?.length || 0} chars
              </Text>
              <Text style={[styles.debugText, { color: textColor + '80' }]} numberOfLines={3}>
                Raw: {htmlContent?.substring(0, 150) + '...'}
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Debug info in development */}
      {__DEV__ && processedContent && (
        <View style={[styles.debugInfo, { backgroundColor: borderColor + '10', borderColor }]}>
          <Text style={[styles.debugText, { color: textColor + '80' }]}>
            Mode: {renderState.mode} | Size: {processedContent.sizeKB?.toFixed(1)}KB
          </Text>
        </View>
      )}
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 16,
    backgroundColor: 'transparent',
  },
  imagesNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderBottomWidth: 1,
  },
  imagesNoticeText: {
    fontSize: 14,
    flex: 1,
  },
  loadImagesButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginLeft: 8,
  },
  loadImagesButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    height: 120,
  },
  loadingText: {
    fontSize: 14,
    opacity: 0.7,
  },
  errorContainer: {
    padding: 16,
    gap: 8,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  errorDetails: {
    fontSize: 12,
    textAlign: 'center',
    opacity: 0.7,
  },
  webView: {
    minHeight: 150,
  },
  htmlContainer: {
    padding: 16,
  },
  textContainer: {
    padding: 16,
  },
  textContent: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  },
  debugInfo: {
    padding: 8,
    borderTopWidth: 1,
    alignItems: 'center',
  },
  debugText: {
    fontSize: 11,
    fontFamily: 'Courier New, monospace',
  },
}); 