import { getMockWellbore } from 'domain/wells/wellbore/service/__fixtures/wellbore';

import { Well } from '@cognite/sdk-wells';

export const getMockWell = (extras?: Partial<Well>): Well => {
  return {
    matchingId: 'test-well-1',
    name: 'test-well',
    description: 'test-well-desc',
    operator: 'test-operator',
    field: 'test-field',
    wellhead: {
      x: 1,
      y: 2,
      crs: 'EPSG:4326',
    },
    // spudDate: '2021-05-28T08:32:32.316Z',
    waterDepth: {
      value: 10,
      unit: 'meter',
    },
    sources: [
      {
        assetExternalId: '123_source1',
        sourceName: 'source1',
      },
    ],
    wellbores: [getMockWellbore()],
    ...extras,
  };
};
