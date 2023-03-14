import { InternalDocument } from '@data-exploration-lib/domain-layer';
import { DASH } from '@data-exploration-components/utils/constants'; // Don't change the import, fails the tests

export const getHighlightContent = (document: InternalDocument) => {
  if (
    document &&
    document.highlight &&
    document.highlight.content?.length > 0
  ) {
    // Remove all whitespaces and new lines
    const highlightSpaceTrimRegex = /\s+/g;
    return document.highlight.content[0]
      .replace(highlightSpaceTrimRegex, ' ')
      .trim();
  }

  return DASH; // This is a special character(–), not a good old minus sign (-)
};

export const getFocusedHighlightContent = (highlightContent: string) => {
  // We want to show a small part of the highlighted content around the query.
  const HIGHLIGHTED_CONTENT_TEXT_PADDING = 30;
  const highlightStartPosition = highlightContent.indexOf('<em>');
  const highlightEndPosition = highlightContent.indexOf('</em>');

  if (highlightStartPosition >= 0) {
    const content =
      '...' +
      highlightContent.substring(
        highlightStartPosition - HIGHLIGHTED_CONTENT_TEXT_PADDING,
        highlightEndPosition + HIGHLIGHTED_CONTENT_TEXT_PADDING
      ) +
      '...';
    // Remove markups for italic text
    const searchRegExp = /<\/?em>+/gi;
    return content.replace(searchRegExp, '');
  }

  return highlightContent;
};
