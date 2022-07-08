import { WellInternal } from 'domain/wells/well/internal/types';
import { getMockWellbore } from 'domain/wells/wellbore/internal/__fixtures/getMockWellbore';

import { Asset } from '@cognite/sdk';

export const getMockWell = (extras?: Partial<WellInternal>): WellInternal => {
  return {
    id: 'test-well-1',
    name: 'test-well',
    description: 'test-well-desc',
    operator: 'test-operator',
    field: 'test-field',
    wellhead: {
      id: 1,
      x: 1,
      y: 2,
      crs: 'EPSG:4326',
    },
    waterDepth: {
      value: 10,
      unit: 'meter',
    },
    sources: ['source1', 'source2'],
    sourceList: 'source1, source2',
    sourceAssets: () => Promise.resolve([] as Asset[]),
    wellbores: [getMockWellbore()],
    ...extras,
  };
};
