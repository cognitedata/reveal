import { Well } from '@cognite/sdk-wells-v3';

import { getMockWellbore } from './wellbore';

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
    waterDepth: {
      value: 10,
      unit: 'meter',
    },
    sources: [],
    wellbores: [getMockWellbore()],
    ...extras,
  };
};
