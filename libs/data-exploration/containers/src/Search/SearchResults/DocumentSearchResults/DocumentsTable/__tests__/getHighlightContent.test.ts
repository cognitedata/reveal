import { DASH, mockDocument } from '@data-exploration-lib/core';

import { getHighlightContent } from '../utils';

describe('getHighlightContent', () => {
  it('should return DASH when given empty string', () => {
    const highlightContent = getHighlightContent(mockDocument);
    expect(highlightContent).toEqual(DASH);
    expect(true).toBeTruthy();
  });

  it('should not have any whitespace character except a single space " "', () => {
    const rawHighlightContent =
      'maintenance tasks \n\nthrough a mobile or tablet-based application. In short, Cognite <em>Infield</em> digitalizes routine rounds \n\nand integrates work management.  \n\n• Cognite Maintain';
    const highlightContent = getHighlightContent({
      ...mockDocument,
      highlight: { name: [''], content: [rawHighlightContent] },
    });

    /* eslint-disable no-control-regex */
    const found = highlightContent.match(/\t\n\x0B\f\r/g);
    expect(found).toEqual(null);
  });
});