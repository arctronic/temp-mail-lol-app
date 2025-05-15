
export const formatEmailContent = (content: string): string => {
  if (!content) return '';
  
  if (content.trim().startsWith('<')) {
    return `<div class="max-w-full overflow-x-hidden">${content}</div>`;
  }
  
  return `<pre class="whitespace-pre-wrap font-inherit break-words">${
    content
      .split('\n')
      .map(line => line.trim())
      .join('\n')
  }</pre>`;
};

export const detectContentType = (content: string): 'html' | 'markdown' | 'text' => {
  if (!content) return 'text';
  
  if (content.trim().startsWith('<')) {
    return 'html';
  }
  
  // Basic markdown detection - checks for common markdown syntax
  const markdownPatterns = [
    /^#+ /, // Headers
    /\[.*\]\(.*\)/, // Links
    /\*\*.*\*\*/, // Bold
    /\*.*\*/, // Italic
    /```[\s\S]*```/, // Code blocks
    /^\s*[-*+] /, // Lists
    /^\s*\d+\. / // Numbered lists
  ];
  
  if (markdownPatterns.some(pattern => pattern.test(content))) {
    return 'markdown';
  }
  
  return 'text';
};
