import { Document } from 'domain/documents';

export const getHighlightContent = (document: Document) => {
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

  return '–'; // This is a special character(–), not a good old minus sign (-)
};
