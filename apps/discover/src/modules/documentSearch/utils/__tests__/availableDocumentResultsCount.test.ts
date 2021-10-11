import { DocumentCategory, DocumentPayload } from 'modules/api/documents/types';

import {
  patchDocumentPayloadCount,
  mapDocumentCategoryToDocumentResultFacets,
} from '../availableDocumentResultsCount';
import { getEmptyDocumentStateFacets } from '../utils';

describe('availableDocumentResultsCount tests', () => {
  it('should patch document payload count as expected', () => {
    const currentContent: DocumentPayload[] = [
      { id: 'Test1', name: 'Test1', count: 100 },
      { name: 'Test2', count: 200 },
    ];
    const patchContent: DocumentPayload[] = [
      { id: 'Test1', name: 'Test1', count: 50 },
    ];

    expect(
      patchDocumentPayloadCount(currentContent, patchContent, true)
    ).toEqual([
      { id: 'Test1', name: 'Test1', count: 50 },
      { name: 'Test2', count: 200 },
    ]);

    expect(
      patchDocumentPayloadCount(currentContent, patchContent, false)
    ).toEqual([
      { id: 'Test1', name: 'Test1', count: 50 },
      { name: 'Test2', count: 0 },
    ]);
  });

  it('should map document category to document result facets as expected', () => {
    const samplePayload: DocumentPayload = {
      id: 'SamplePayload',
      name: 'SamplePayload',
      count: 100,
    };
    const documentCategory: DocumentCategory = {
      fileCategory: [samplePayload],
      labels: [samplePayload],
      location: [samplePayload],
    };

    expect(mapDocumentCategoryToDocumentResultFacets(documentCategory)).toEqual(
      {
        ...getEmptyDocumentStateFacets(),
        filetype: [samplePayload],
        labels: [samplePayload],
        location: [samplePayload],
      }
    );
  });
});
