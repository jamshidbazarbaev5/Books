export const splitIntoPages = (text: string, wordsPerPage: number = 150): string[] => {
  if (!text) return [];
  // Replace multiple whitespace/newlines with single space to avoid empty words
  const words = text.trim().replace(/\s+/g, ' ').split(' ');
  const pages: string[] = [];
  for (let i = 0; i < words.length; i += wordsPerPage) {
    pages.push(words.slice(i, i + wordsPerPage).join(' '));
  }
  return pages;
};
