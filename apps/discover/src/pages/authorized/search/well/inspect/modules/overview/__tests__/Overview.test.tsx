import { screen } from '@testing-library/react';

import { getMockOverviewModel } from '__test-utils/fixtures/well/overviewModel';
import { testRenderer } from '__test-utils/renderer';

import { OverviewComponent } from '../Overview';
import { OverviewModel } from '../types';

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
    expect(screen.getByTitle('15.Apr.2021')).toBeInTheDocument();
  });
});
