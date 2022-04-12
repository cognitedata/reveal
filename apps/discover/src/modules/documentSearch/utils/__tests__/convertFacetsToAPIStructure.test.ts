import { DocumentsFacets } from 'modules/documentSearch/types';

import { convertFacetsToAPIStructure } from '../convertFacetsToAPIStructure';

describe('convert Facets To API Structure test', () => {
  it('convert to api structure', () => {
    const facets: DocumentsFacets = {
      fileCategory: ['Unknown'],
      labels: [{ externalId: 'PDF' }],
      lastcreated: [],
      lastmodified: [],
      location: ['location'],
      pageCount: [],
    };

    const apiStructure = convertFacetsToAPIStructure(facets);
    expect(apiStructure.labels).toEqual([{ externalId: 'PDF' }]);
    expect(apiStructure.fileCategory).toEqual(['Unknown']);
    expect(apiStructure.location).toEqual(['location']);
  });
});
