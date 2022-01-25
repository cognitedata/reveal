import { getMockAPIResponse } from '__test-utils/fixtures/document';

import { getDocumentsFacetsInfo } from '../getDocumentsFacetsInfo';
import { processFacets } from '../processFacets';

describe('getDocumentsFacetsInfo', () => {
  it('should return documents facets info', () => {
    const facets = processFacets(getMockAPIResponse());
    const facetsInfo = getDocumentsFacetsInfo(facets, {});
    expect(facetsInfo).toEqual([
      { content: [{ count: 100, name: 'PDF' }], name: 'File Type' },
      { content: [{ count: 200, name: 'TestId' }], name: 'Document Category' },
      { content: [{ count: 300, name: 'TestSource' }], name: 'Source' },
    ]);
  });

  it('should return labels mapped documents facets info', () => {
    const facets = processFacets(getMockAPIResponse());
    const facetsInfo = getDocumentsFacetsInfo(facets, {
      TestId: 'NewIdTestId',
      TestSource: 'NewTestSource',
    });
    expect(facetsInfo).toEqual([
      { content: [{ count: 100, name: 'PDF' }], name: 'File Type' },
      {
        content: [{ count: 200, name: 'NewIdTestId' }],
        name: 'Document Category',
      },
      { content: [{ count: 300, name: 'NewTestSource' }], name: 'Source' },
    ]);
  });
});
