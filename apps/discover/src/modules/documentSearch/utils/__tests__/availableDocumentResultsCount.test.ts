import { DocumentPayload } from '@cognite/discover-api-types';

import { patchDocumentPayloadCount } from '../availableDocumentResultsCount';

describe('availableDocumentResultsCount tests', () => {
  it('should patch document payload count as expected', () => {
    const currentContent: DocumentPayload[] = [
      { id: 'Test1', name: 'Test1', count: 100 },
      { name: 'Test2', count: 200 },
    ];
    const patchContent: DocumentPayload[] = [
      { id: 'Test1', name: 'Test1', count: 50 },
    ];

    expect(patchDocumentPayloadCount(currentContent, patchContent)).toEqual([
      { id: 'Test1', name: 'Test1', count: 50 },
      { name: 'Test2', count: 0 },
    ]);
  });
});
