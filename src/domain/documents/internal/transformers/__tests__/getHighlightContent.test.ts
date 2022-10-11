import { getHighlightContent } from '../getHighlightContent';

describe('getHighlightContent', () => {
  it('should return "-" when given empty string', () => {
    const highlightContent = getHighlightContent('');
    expect(highlightContent).toEqual('–');
  });
  it('should not have any whitespace character except a single space " "', () => {
    const rawHighlightContent =
      'maintenance tasks \n\nthrough a mobile or tablet-based application. In short, Cognite <em>Infield</em> digitalizes routine rounds \n\nand integrates work management.  \n\n• Cognite Maintain';
    const mockDocument = { highlight: { content: [rawHighlightContent] } };
    const highlightContent = getHighlightContent(mockDocument);
    const found = highlightContent.match(/\t\n\x0B\f\r/g);
    expect(found).toEqual(null);
  });
});
