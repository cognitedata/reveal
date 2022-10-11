import { getFocusedHighlightContent } from '../getFocusedHighlightContent';

describe('getFocusedHighlightContent', () => {
  it('should not contain any emphasize (<em>) tags', () => {
    const highlightContent =
      'maintenance tasks through a mobile or tablet-based application. In short, Cognite <em>Infield</em> digitalizes <em>routine</em> rounds and integrates work management. • Cognite Maintain';
    const content = getFocusedHighlightContent(highlightContent);
    const containsEMOpen = content.indexOf('<em>');
    const containsEMClose = content.indexOf('</em>');
    expect(containsEMOpen).toEqual(-1);
    expect(containsEMClose).toEqual(-1);
  });
  it('should be same as highlightContent if there is no emphasize tags', () => {
    const highlightContent =
      'maintenance tasks through a mobile or tablet-based application. In short, Cognite Infield digitalizes routine rounds and integrates work management. • Cognite Maintain';
    const content = getFocusedHighlightContent(highlightContent);
    expect(content).toEqual(highlightContent);
  });
});
