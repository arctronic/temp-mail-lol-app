import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useThemeColor } from '@/hooks/useThemeColor';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, Linking, StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';

interface EmailContentProps {
  message: string;
}

// Detect content type (HTML, plain text, or potentially markdown)
const detectContentType = (content: string): 'html' | 'text' => {
  if (!content) return 'text';
  
  // Check if content contains HTML tags
  const htmlRegex = /<\/?[a-z][\s\S]*>/i;
  if (htmlRegex.test(content)) {
    return 'html';
  }
  
  return 'text';
};

// Convert plain text to HTML with proper line breaks and link detection
const convertTextToHtml = (text: string, linkColor: string): string => {
  if (!text) return '';
  
  // Escape HTML special characters
  let escapedText = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
  
  // Convert URLs to clickable links
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  escapedText = escapedText.replace(
    urlRegex, 
    `<a href="$1" style="color: ${linkColor}; text-decoration: underline;">$1</a>`
  );
  
  // Convert line breaks to <br> tags and preserve paragraphs
  return escapedText
    .replace(/\n\s*\n/g, '</p><p>') // Convert double line breaks to paragraphs
    .replace(/\n/g, '<br />'); // Convert single line breaks to <br />
};

export const EmailContent = ({ message }: EmailContentProps) => {
  const [htmlContent, setHtmlContent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [contentHeight, setContentHeight] = useState(300);
  
  const borderColor = useThemeColor({}, 'border');
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');
  const { width } = Dimensions.get('window');

  useEffect(() => {
    const processEmail = () => {
      if (!message) {
        setHtmlContent('');
        setLoading(false);
        return;
      }
      
      const contentType = detectContentType(message);
      let emailContent: string;
      
      try {
        if (contentType === 'html') {
          // For HTML content, wrap it in a div
          emailContent = `<div>${message}</div>`;
        } else {
          // For plain text, convert to HTML with proper formatting
          const convertedText = convertTextToHtml(message, tintColor);
          emailContent = `<div style="color: ${textColor}; font-family: sans-serif; font-size: 16px; line-height: 1.5;"><p>${convertedText}</p></div>`;
        }
        
        // Create full HTML document with proper styling for the WebView
        const styledHtml = `
          <!DOCTYPE html>
          <html>
            <head>
              <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
              <style>
                body {
                  margin: 0;
                  padding: 12px 16px;
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
                  color: ${textColor};
                  background-color: ${backgroundColor};
                  font-size: 16px;
                  line-height: 1.6;
                }
                a {
                  color: ${tintColor};
                  text-decoration: underline;
                }
                img {
                  max-width: 100%;
                  height: auto;
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
                }
                
                /* Gmail-like styles */
                .gmail-quote {
                  border-left: 2px solid ${borderColor};
                  padding-left: 16px;
                  margin-left: 8px;
                  color: ${textColor}CC;
                }
                blockquote {
                  border-left: 3px solid ${borderColor};
                  padding-left: 16px;
                  margin-left: 0;
                  margin-right: 0;
                  color: ${textColor}DD;
                }
              </style>
            </head>
            <body>
              ${emailContent}
            </body>
          </html>
        `;
        
        setHtmlContent(styledHtml);
      } catch (error) {
        console.error('Error rendering email:', error);
        // Fallback to basic rendering if parsing fails
        const simpleHtml = `
          <!DOCTYPE html>
          <html>
            <head>
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <style>
                body {
                  font-family: sans-serif;
                  color: ${textColor};
                  background-color: ${backgroundColor};
                  padding: 12px 16px;
                  font-size: 16px;
                  line-height: 1.6;
                }
                pre {
                  white-space: pre-wrap;
                  word-wrap: break-word;
                }
              </style>
            </head>
            <body>
              <pre>${message.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
            </body>
          </html>
        `;
        setHtmlContent(simpleHtml);
      } finally {
        setLoading(false);
      }
    };
    
    processEmail();
  }, [message, textColor, backgroundColor, tintColor, borderColor, width]);

  // Handle WebView height adjustment based on content
  const onWebViewMessage = (event: any) => {
    const height = Number(event.nativeEvent.data);
    if (!isNaN(height) && height > 0) {
      setContentHeight(height + 20); // Add some padding
    }
  };

  // JavaScript to calculate HTML content height and send it back
  const injectedJavaScript = `
    setTimeout(function() {
      const height = document.body.scrollHeight;
      window.ReactNativeWebView.postMessage(height.toString());
    }, 500);
    
    // Make all links open in system browser
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
    
    true;
  `;

  // Handle messages from WebView
  const handleWebViewMessage = (event: any) => {
    const data = event.nativeEvent.data;
    
    // Handle link clicks
    if (data.startsWith('link:')) {
      const url = data.substring(5);
      Linking.openURL(url);
    } 
    // Handle height adjustments
    else {
      const height = Number(data);
      if (!isNaN(height) && height > 0) {
        setContentHeight(height + 20); // Add padding
      }
    }
  };

  return (
    <ThemedView style={[styles.container, { borderColor }]}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={tintColor} size="small" />
          <ThemedText>Loading email content...</ThemedText>
        </View>
      ) : message ? (
        <WebView
          style={[styles.webView, { height: contentHeight }]}
          originWhitelist={['*']}
          source={{ html: htmlContent }}
          scrollEnabled={true}
          onMessage={handleWebViewMessage}
          injectedJavaScript={injectedJavaScript}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <ThemedText style={styles.emptyText}>No content available</ThemedText>
      )}
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    height: 200,
  },
  webView: {
    backgroundColor: 'transparent',
    minHeight: 100,
  },
  emptyText: {
    padding: 20,
    fontSize: 16,
    textAlign: 'center',
    fontStyle: 'italic',
    opacity: 0.6,
  },
}); 