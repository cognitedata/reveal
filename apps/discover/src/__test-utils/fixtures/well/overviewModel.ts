import { OverviewModel } from 'pages/authorized/search/well/inspect/modules/overview/types';

import { mockWellboreOptions } from '../well';

export const getMockOverviewModel = (
  extras: Partial<OverviewModel> = {}
): OverviewModel => {
  const model: OverviewModel = {
    id: 1,
    name: 'test',
    wellName: 'test-well',
    sources: ['test-source'],
    operator: 'test-operator',
    spudDate: '2021-04-15T13:31:27.767Z',
    waterDepth: { value: 1, unit: 'feet' },
    md: 'test-md',
    tvd: 'test-tvd',
    sourceWellbores: [],

    ...mockWellboreOptions,
    ...extras,
  };

  return model;
};
