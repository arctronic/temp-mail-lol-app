import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useThemeColor } from '@/hooks/useThemeColor';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { decode } from 'html-entities';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Dimensions, Linking, StyleSheet, View } from 'react-native';
import ParsedText from 'react-native-parsed-text';
import RenderHtml from 'react-native-render-html';
import { WebView } from 'react-native-webview';

interface EmailContentProps {
  htmlContent: string;
}

// Security: List of allowed HTML tags (XSS prevention)
const ALLOWED_TAGS = [
  'p', 'br', 'strong', 'b', 'em', 'i', 'u', 'span', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'ul', 'ol', 'li', 'blockquote', 'a', 'img', 'table', 'tr', 'td', 'th', 'thead', 'tbody',
  'font', 'center', 'hr'
];

// Security: List of allowed attributes
const ALLOWED_ATTRIBUTES = ['href', 'src', 'alt', 'title', 'style', 'color', 'size', 'face'];

// Task 2.6: Normalize escaped characters in email body
const normalizeEmailBody = (raw: string): string => {
  if (!raw) return '';
  
  return raw
    .replace(/\\n/g, '\n')     // Escaped newlines
    .replace(/\\t/g, '\t')     // Escaped tabs
    .replace(/\\"/g, '"')      // Escaped double quotes
    .replace(/\\'/g, "'")      // Escaped single quotes
    .replace(/\\r/g, '\r')     // Escaped carriage returns
    .replace(/\\\\/g, '\\');   // Escaped backslashes (do this last)
};

// Task 2.6: Enhanced content type detection
const detectContentType = (content: string): 'html' | 'plaintext' => {
  if (!content) return 'plaintext';
  
  // Normalize content first
  const normalized = normalizeEmailBody(content);
  
  // Check if content contains valid HTML tags
  const htmlRegex = /<\/?[a-z][\s\S]*>/i;
  const hasHtmlTags = htmlRegex.test(normalized);
  
  // Check for HTML entities
  const hasHtmlEntities = /&[a-zA-Z0-9#]+;/.test(normalized);
  
  // If it has HTML tags or entities, treat as HTML
  if (hasHtmlTags || hasHtmlEntities) {
    return 'html';
  }
  
  return 'plaintext';
};

// Security: Sanitize HTML to prevent XSS attacks
const sanitizeHtml = (html: string): string => {
  if (!html) return '';
  
  // Remove potentially dangerous elements
  let sanitized = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove scripts
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '') // Remove iframes
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '') // Remove objects
    .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '') // Remove embeds
    .replace(/<form\b[^<]*(?:(?!<\/form>)<[^<]*)*<\/form>/gi, '') // Remove forms
    .replace(/javascript:/gi, '') // Remove javascript: links
    .replace(/on\w+\s*=/gi, ''); // Remove event handlers (onclick, onload, etc.)
  
  // Remove dangerous attributes from all elements
  sanitized = sanitized.replace(/(<[^>]+)\s+(on\w+|javascript|vbscript|data|formaction|fscommand)\s*=\s*["'][^"']*["']/gi, '$1');
  
  return sanitized;
};

// Convert plain text to HTML with proper line breaks and link detection (for fallback)
const convertTextToHtml = (text: string, linkColor: string): string => {
  if (!text) return '';
  
  // Decode HTML entities first
  let decodedText = decode(text);
  
  // Escape HTML special characters to prevent XSS
  let escapedText = decodedText
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
  
  // Convert URLs to clickable links (more comprehensive regex)
  const urlRegex = /(https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&=]*))/g;
  escapedText = escapedText.replace(
    urlRegex, 
    `<a href="$1" style="color: ${linkColor}; text-decoration: underline;">$1</a>`
  );
  
  // Convert email addresses to clickable links
  const emailRegex = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g;
  escapedText = escapedText.replace(
    emailRegex,
    `<a href="mailto:$1" style="color: ${linkColor}; text-decoration: underline;">$1</a>`
  );
  
  // Convert line breaks to <br> tags and preserve paragraphs
  return escapedText
    .replace(/\n\s*\n/g, '</p><p>') // Convert double line breaks to paragraphs
    .replace(/\n/g, '<br />'); // Convert single line breaks to <br />
};

export const EmailContent = ({ htmlContent }: EmailContentProps) => {
  const [processedContent, setProcessedContent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [contentHeight, setContentHeight] = useState(300);
  const [renderMode, setRenderMode] = useState<'webview' | 'renderhtml' | 'plaintext'>('plaintext');
  
  const borderColor = useThemeColor({}, 'border');
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');
  const mutedColor = useThemeColor({}, 'tabIconDefault');
  const { width } = Dimensions.get('window');

  // Task 2.6: Handle OTP copy functionality
  const handleOTPPress = async (otp: string) => {
    try {
      await Clipboard.setStringAsync(otp);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('OTP Copied', `${otp} has been copied to clipboard`, [{ text: 'OK' }]);
    } catch (error) {
      console.error('Failed to copy OTP:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  // Task 2.6: Handle link press functionality
  const handleLinkPress = async (url: string) => {
    try {
      // Security: Only allow safe links
      if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('mailto:')) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        await Linking.openURL(url);
      }
    } catch (error) {
      console.error('Failed to open link:', error);
      Alert.alert('Error', 'Failed to open link');
    }
  };

  useEffect(() => {
    const processEmail = () => {
      if (!htmlContent) {
        setProcessedContent('');
        setLoading(false);
        return;
      }
      
      // Task 2.6: Normalize the content first
      const normalizedContent = normalizeEmailBody(htmlContent);
      const contentType = detectContentType(normalizedContent);
      
      try {
        if (contentType === 'html') {
          // Sanitize HTML content for security
          const sanitizedHtml = sanitizeHtml(normalizedContent);
          
          // Check if content is complex enough to warrant WebView
          const complexHtmlRegex = /<table|<iframe|<object|<embed|<video|<audio|style\s*=|class\s*=/i;
          const shouldUseWebView = complexHtmlRegex.test(sanitizedHtml) || sanitizedHtml.length > 2000;
          
          if (shouldUseWebView) {
            // For complex HTML, use WebView with full document
            const webViewContent = `
              <!DOCTYPE html>
              <html>
                <head>
                  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
                  <style>
                    body {
                      margin: 0;
                      padding: 16px;
                      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
                      color: ${textColor};
                      background-color: ${backgroundColor};
                      font-size: 16px;
                      line-height: 1.6;
                      word-wrap: break-word;
                    }
                    a {
                      color: ${tintColor};
                      text-decoration: underline;
                    }
                    img {
                      max-width: 100%;
                      height: auto;
                      border-radius: 8px;
                    }
                    p {
                      margin-bottom: 16px;
                    }
                    * {
                      max-width: 100%;
                      word-break: break-word;
                    }
                    table {
                      width: 100% !important;
                      max-width: ${width - 64}px !important;
                      height: auto !important;
                      border-collapse: collapse;
                      border: 1px solid ${borderColor};
                    }
                    td, th {
                      padding: 8px;
                      border: 1px solid ${borderColor};
                    }
                    
                    /* Gmail-like styles */
                    .gmail-quote {
                      border-left: 2px solid ${borderColor};
                      padding-left: 16px;
                      margin-left: 8px;
                      color: ${textColor}CC;
                    }
                    blockquote {
                      border-left: 3px solid ${tintColor};
                      padding-left: 16px;
                      margin-left: 0;
                      margin-right: 0;
                      color: ${textColor}DD;
                      font-style: italic;
                    }
                    
                    /* Security: Hide potentially dangerous elements */
                    script, iframe, object, embed, form {
                      display: none !important;
                    }
                  </style>
                </head>
                <body>
                  ${sanitizedHtml}
                </body>
              </html>
            `;
            setRenderMode('webview');
            setProcessedContent(webViewContent);
          } else {
            // For simple HTML, use sanitized content for react-native-render-html
            setRenderMode('renderhtml');
            setProcessedContent(sanitizedHtml);
          }
        } else {
          // Task 2.6: For plaintext, use parsed text to handle OTPs and links
          setRenderMode('plaintext');
          setProcessedContent(normalizedContent);
        }
        
      } catch (error) {
        console.error('Error processing email content:', error);
        // Fallback to safe plain text rendering
        const safeText = normalizedContent.replace(/</g, '&lt;').replace(/>/g, '&gt;');
        setRenderMode('plaintext');
        setProcessedContent(safeText);
      } finally {
        setLoading(false);
      }
    };
    
    processEmail();
  }, [htmlContent, textColor, backgroundColor, tintColor, borderColor, width]);

  // Handle WebView height adjustment based on content
  const onWebViewMessage = (event: any) => {
    const data = event.nativeEvent.data;
    
    // Handle link clicks
    if (data.startsWith('link:')) {
      const url = data.substring(5);
      handleLinkPress(url);
    } 
    // Handle height adjustments
    else {
      const height = Number(data);
      if (!isNaN(height) && height > 0) {
        setContentHeight(Math.min(height + 40, 1000)); // Cap max height
      }
    }
  };

  // JavaScript to calculate HTML content height and handle links safely
  const injectedJavaScript = `
    setTimeout(function() {
      const height = Math.max(document.body.scrollHeight, document.body.offsetHeight);
      window.ReactNativeWebView.postMessage(height.toString());
    }, 500);
    
    // Security: Handle links safely
    document.addEventListener('click', function(e) {
      var target = e.target;
      while(target && target.tagName !== 'A') {
        target = target.parentNode;
        if (!target) return;
      }
      if (target.tagName === 'A' && target.href) {
        e.preventDefault();
        window.ReactNativeWebView.postMessage('link:' + target.href);
        return false;
      }
    }, false);
    
    // Security: Disable context menu and text selection for better UX
    document.addEventListener('contextmenu', function(e) {
      e.preventDefault();
    }, false);
    
    true;
  `;

  // Render HTML styles for react-native-render-html
  const renderHtmlStyles = {
    body: {
      color: textColor,
      fontSize: 16,
      lineHeight: 24,
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    },
    a: {
      color: tintColor,
      textDecorationLine: 'underline' as const,
    },
    p: {
      marginBottom: 16,
    },
    blockquote: {
      borderLeftWidth: 3,
      borderLeftColor: tintColor,
      paddingLeft: 16,
      marginLeft: 0,
      fontStyle: 'italic' as const,
      color: textColor + 'DD',
    },
    img: {
      borderRadius: 8,
    },
  };

  const renderHtmlProps = {
    contentWidth: width - 32,
    tagsStyles: renderHtmlStyles,
    systemFonts: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica', 'Arial'],
    enableExperimentalMarginCollapsing: true,
    renderersProps: {
      a: {
        onPress: (event: any, href: string) => {
          handleLinkPress(href);
        },
      },
    },
  };

  // Task 2.6: ParsedText configuration for plaintext emails
  const parsedTextStyles = StyleSheet.create({
    container: {
      padding: 16,
    },
    text: {
      fontSize: 16,
      lineHeight: 24,
      color: textColor,
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    },
    url: {
      color: tintColor,
      textDecorationLine: 'underline' as const,
    },
    email: {
      color: tintColor,
      textDecorationLine: 'underline' as const,
    },
    otp: {
      backgroundColor: `${tintColor}20`,
      color: tintColor,
      fontWeight: '700',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6,
      borderWidth: 1,
      borderColor: `${tintColor}40`,
    },
  });

  return (
    <ThemedView style={[styles.container, { borderColor }]}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={tintColor} size="small" />
          <ThemedText style={styles.loadingText}>Loading email content...</ThemedText>
        </View>
      ) : processedContent ? (
        <>
          {renderMode === 'webview' && (
            <WebView
              style={[styles.webView, { height: contentHeight }]}
              originWhitelist={['*']}
              source={{ html: processedContent }}
              scrollEnabled={false}
              onMessage={onWebViewMessage}
              injectedJavaScript={injectedJavaScript}
              showsHorizontalScrollIndicator={false}
              showsVerticalScrollIndicator={false}
              javaScriptEnabled={true}
              domStorageEnabled={false}
              startInLoadingState={true}
              allowsInlineMediaPlayback={false}
              mediaPlaybackRequiresUserAction={true}
            />
          )}

          {renderMode === 'renderhtml' && (
            <View style={styles.renderHtmlContainer}>
              <RenderHtml
                source={{ html: processedContent }}
                {...renderHtmlProps}
              />
            </View>
          )}

          {renderMode === 'plaintext' && (
            <View style={parsedTextStyles.container}>
              <ParsedText
                style={parsedTextStyles.text}
                parse={[
                  // Task 2.6: Detect and highlight OTPs (4-8 digit numbers)
                  {
                    pattern: /\b\d{4,8}\b/g,
                    style: parsedTextStyles.otp,
                    onPress: handleOTPPress,
                  },
                  // Task 2.6: Detect URLs
                  {
                    type: 'url',
                    style: parsedTextStyles.url,
                    onPress: handleLinkPress,
                  },
                  // Task 2.6: Detect email addresses
                  {
                    type: 'email',
                    style: parsedTextStyles.email,
                    onPress: (email) => handleLinkPress(`mailto:${email}`),
                  },
                  // Task 2.6: Detect phone numbers
                  {
                    type: 'phone',
                    style: parsedTextStyles.url,
                    onPress: (phone) => handleLinkPress(`tel:${phone}`),
                  },
                ]}
                childrenProps={{
                  allowFontScaling: false,
                }}
              >
                {processedContent}
              </ParsedText>
            </View>
          )}
        </>
      ) : (
        <ThemedText style={styles.emptyText}>No content available</ThemedText>
      )}
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: 0,
    overflow: 'hidden',
    marginBottom: 16,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    height: 150,
  },
  loadingText: {
    fontSize: 14,
    opacity: 0.7,
  },
  webView: {
    backgroundColor: 'transparent',
    minHeight: 100,
  },
  renderHtmlContainer: {
    padding: 16,
  },
  emptyText: {
    padding: 20,
    fontSize: 16,
    textAlign: 'center',
    fontStyle: 'italic',
    opacity: 0.6,
  },
}); 