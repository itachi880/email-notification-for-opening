export function sanitizeHTML(html: string): string {
  if (!html) return '';
  
  // Remove script tags entirely
  let sanitized = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
  
  // Remove style tags that might contain malicious CSS
  sanitized = sanitized.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
  
  // Remove dangerous attributes that can execute JavaScript
  const dangerousAttributes = [
    'onload', 'onclick', 'onmouseover', 'onmouseout', 'onmousedown', 'onmouseup',
    'onkeydown', 'onkeyup', 'onkeypress', 'onfocus', 'onblur', 'onchange',
    'onsubmit', 'onreset', 'onselect', 'onabort', 'onerror', 'onresize',
    'onscroll', 'onunload', 'onbeforeunload', 'ondragstart', 'ondrag',
    'ondragend', 'ondrop', 'ondragover', 'ondragenter', 'ondragleave',
    'oncontextmenu', 'oninput', 'oninvalid', 'onwheel', 'onanimationend',
    'onanimationiteration', 'onanimationstart', 'ontransitionend'
  ];
  
  // Remove dangerous attributes using regex (case insensitive)
  dangerousAttributes.forEach(attr => {
    const regex = new RegExp(`\\s*${attr}\\s*=\\s*["'][^"']*["']`, 'gi');
    sanitized = sanitized.replace(regex, '');
  });
  
  // Also remove attributes without quotes
  dangerousAttributes.forEach(attr => {
    const regex = new RegExp(`\\s*${attr}\\s*=\\s*[^\\s>]+`, 'gi');
    sanitized = sanitized.replace(regex, '');
  });
  
  // Remove javascript: URLs
  sanitized = sanitized.replace(/javascript:/gi, 'about:blank');
  
  // Remove vbscript: URLs
  sanitized = sanitized.replace(/vbscript:/gi, 'about:blank');
  
  // Remove data: URLs except for images
  sanitized = sanitized.replace(/data:(?!image\/)/gi, 'about:blank');
  
  // Remove dangerous tags but preserve content
  const dangerousTags = ['object', 'embed', 'applet', 'iframe', 'frame', 'frameset', 'meta', 'link'];
  dangerousTags.forEach(tag => {
    const regex = new RegExp(`<${tag}[^>]*>[\\s\\S]*?<\\/${tag}>`, 'gi');
    sanitized = sanitized.replace(regex, '');
    // Also remove self-closing versions
    const selfClosingRegex = new RegExp(`<${tag}[^>]*\\/>`, 'gi');
    sanitized = sanitized.replace(selfClosingRegex, '');
  });
  
  // Clean up HTML entities
  sanitized = sanitized.replace(/&lt;/g, '<')
                     .replace(/&gt;/g, '>')
                     .replace(/&amp;/g, '&')
                     .replace(/&quot;/g, '"')
                     .replace(/&#39;/g, "'");
  
  return sanitized;
}

export function isHTMLContent(content: string): boolean {
  if (!content || typeof content !== 'string') return false;
  
  // Check for common HTML indicators
  const htmlIndicators = [
    /<html[^>]*>/i,
    /<body[^>]*>/i,
    /<head[^>]*>/i,
    /<div[^>]*>/i,
    /<p[^>]*>/i,
    /<span[^>]*>/i,
    /<table[^>]*>/i,
    /<br\s*\/?>/i,
    /<img[^>]*>/i,
    /<a[^>]*href/i,
    /<strong[^>]*>/i,
    /<em[^>]*>/i,
    /<h[1-6][^>]*>/i
  ];
  
  // Check if any HTML indicators are present
  const hasHTMLTags = htmlIndicators.some(regex => regex.test(content));
  
  // Additional check for HTML entities
  const hasHTMLEntities = /&[a-zA-Z0-9#]+;/.test(content);
  
  // If it has both < and > and looks like HTML structure
  const hasTagStructure = content.includes('<') && content.includes('>') && 
                         /<[a-zA-Z!]+[^>]*>/.test(content);
  
  const isHTML = hasHTMLTags || (hasTagStructure && hasHTMLEntities);
  
  return isHTML;
}

export function extractTextFromHTML(html: string): string {
  // Simple text extraction - remove all HTML tags
  return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
}

export function formatPlainTextEmail(text: string): string {
  if (!text) return '';
  
  // Convert URLs to clickable links
  const urlRegex = /(https?:\/\/[^\s<>"'()\[\]]+[^\s<>"'()\[\].,;:!?])/gi;
  let formatted = text.replace(urlRegex, (url) => {
    // Truncate very long URLs for display
    const displayUrl = url.length > 80 ? url.substring(0, 77) + '...' : url;
    return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="break-all">${displayUrl}</a>`;
  });
  
  // Convert email addresses to mailto links
  const emailRegex = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g;
  formatted = formatted.replace(emailRegex, (email) => {
    return `<a href="mailto:${email}">${email}</a>`;
  });
  
  // Convert single line breaks to HTML breaks, but preserve the original spacing
  formatted = formatted.replace(/\r?\n/g, '<br>');
  
  // Clean up excessive line breaks (more than 2 consecutive)
  formatted = formatted.replace(/(<br>\s*){3,}/g, '<br><br>');
  
  return formatted;
}
