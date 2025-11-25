export function extractTextFromContent(content: any): string | undefined {
  if (typeof content === 'string') {
    return content;
  }
  if (Array.isArray(content) && content.length > 0) {
    const firstPart = content[0];
    if (typeof firstPart === 'string') {
      return firstPart;
    }
    if (firstPart && typeof firstPart === 'object' && 'text' in firstPart) {
      return firstPart.text;
    }
  }
  return undefined;
}