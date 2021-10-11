import { DocumentsFacets } from 'modules/documentSearch/types';

import { convertFacetsToAPIStructure } from '../convertFacetsToAPIStructure';

describe('convert Facets To API Structure test', () => {
  it('convert to api structure', () => {
    const facets: DocumentsFacets = {
      filetype: ['Unknown'],
      labels: [{ externalId: 'PDF' }],
      lastcreated: [],
      lastmodified: [],
      location: ['location'],
    };

    const apiStructure = convertFacetsToAPIStructure(facets);
    expect(apiStructure.labels).toEqual([{ externalId: 'PDF' }]);
    expect(apiStructure.filetype).toEqual(['Unknown']);
    expect(apiStructure.location).toEqual(['location']);
  });
});
