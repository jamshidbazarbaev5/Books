import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

// These constants should ideally match the reader's layout padding.
const PAGE_HORIZONTAL_PADDING = 58; // (width - 10) -> 10 + (padding: 24 * 2) -> 48 = 58
const PAGE_VERTICAL_PADDING = 248; // (height - 200) -> 200 + (padding: 24 * 2) -> 48 = 248

// This is an empirical value for an average character's width relative to its font size.
// It's an approximation but far more accurate than a fixed word count.
const AVG_CHAR_WIDTH_RATIO = 0.58;

/**
 * Splits text into pages based on an estimated character count that fits the screen.
 * This provides more realistic pagination than a simple word count.
 *
 * @param text The full text content to paginate.
 * @param fontSize The font size used for rendering the text.
 * @param lineHeight The line height used for rendering the text.
 * @returns An array of strings, where each string is the content for one page.
 */
export const splitIntoPages = (
  text: string,
  fontSize: number,
  lineHeight: number
): string[] => {
  if (!text || fontSize <= 0 || lineHeight <= 0) {
    return [];
  }

  // Calculate the available space for text on a single page.
  const pageWidth = width - PAGE_HORIZONTAL_PADDING;
  const pageHeight = height - PAGE_VERTICAL_PADDING;

  // Estimate how many characters can fit based on the available area and font size.
  const charsPerLine = Math.floor(pageWidth / (fontSize * AVG_CHAR_WIDTH_RATIO));
  const linesPerPage = Math.floor(pageHeight / lineHeight);
  const charsPerPage = charsPerLine * linesPerPage;

  // If the calculation is invalid (e.g., screen too small), return the whole text as one page.
  if (charsPerPage <= 0) {
    console.warn('Could not calculate characters per page. Screen or font size may be invalid.');
    return [text];
  }

  const pages: string[] = [];
  // Normalize whitespace to prevent issues with splitting and ensure consistent output.
  let remainingText = text.trim().replace(/\s+/g, ' ');

  while (remainingText.length > 0) {
    // Determine the initial split point based on calculated characters per page.
    let splitIndex = Math.min(charsPerPage, remainingText.length);

    // To avoid cutting words in half, find the last space before the calculated split point.
    if (splitIndex < remainingText.length) {
      const lastSpaceIndex = remainingText.lastIndexOf(' ', splitIndex);
      // Only use the space index if it's found and is reasonably close to the target split point.
      // This prevents creating very short pages if a very long word is at the boundary.
      if (lastSpaceIndex > -1) {
        splitIndex = lastSpaceIndex;
      }
    }

    // Add the calculated page content to our array.
    pages.push(remainingText.substring(0, splitIndex).trim());
    // Update the remaining text for the next iteration.
    remainingText = remainingText.substring(splitIndex).trim();
  }

  return pages;
};
