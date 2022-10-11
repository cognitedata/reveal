export const getFocusedHighlightContent = (highlightContent: string) => {
  // We want to show a small part of the highlighted content around the query.
  const HIGHLIGHTED_CONTENT_TEXT_PADDING = 30;
  const highlightStartPosition = highlightContent.indexOf('<em>');
  const highlightEndPosition = highlightContent.indexOf('</em>');

  if (highlightStartPosition >= 0) {
    let content =
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
