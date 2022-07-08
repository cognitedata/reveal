import { screen } from '@testing-library/react';

import { mockWellboreOptions } from '__test-utils/fixtures/well';
import { testRenderer } from '__test-utils/renderer';

import { OverviewComponent } from '../Overview';
import { OverviewModel } from '../types';

const getMockOverviewModel = (
  extras: Partial<OverviewModel> = {}
): OverviewModel => {
  const model: OverviewModel = {
    id: '1',
    matchingId: '1',
    wellId: '1',
    wellMatchingId: '1',
    name: 'test',
    wellName: 'test-well',
    sources: 'test-source',
    operator: 'test-operator',
    spudDate: '2021-04-15T13:31:27.767Z',
    waterDepth: { value: 1, unit: 'ft' },
    md: '1',
    tvd: '2',

    ...mockWellboreOptions,
    ...extras,
  };

  return model;
};

describe('Module Preview Selector', () => {
  const overviewData: OverviewModel[] = [getMockOverviewModel()];

  const page = (viewProps?: any) =>
    testRenderer(OverviewComponent, undefined, viewProps);

  const defaultTestInit = async () => {
    return { ...page({ overviewData }) };
  };

  it('should render ok', async () => {
    await defaultTestInit();
    expect(screen.getByText('Well')).toBeInTheDocument();
    expect(screen.getByText('Field')).toBeInTheDocument();
    expect(screen.getByTitle('test-source')).toBeInTheDocument();
    expect(screen.getByTitle('15-Apr-2021')).toBeInTheDocument();
  });
});
