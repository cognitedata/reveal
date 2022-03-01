import 'modules/map/__mocks/mockMapbox';
import { screen } from '@testing-library/react';

import { testRenderer } from '__test-utils/renderer';

import Chart from '../Chart';

const chartProps = {
  data: [
    {
      x: [1, 2, 3],
      y: [4, 5, 6],
      type: 'scatter',
      mode: 'lines',
      hovertemplate: `%{y}`,
    },
  ],
  axisNames: { x: 'x-axis', y: 'y-axis' },
  title: 'test chart',
};

describe('Module Chart', () => {
  const page = (viewProps?: any) =>
    testRenderer(Chart as React.FC, undefined, viewProps);

  const defaultTestInit = async () => {
    return {
      ...page(chartProps),
    };
  };

  afterAll(jest.clearAllMocks);
  beforeEach(jest.clearAllMocks);

  it(`should render chart correctly`, async () => {
    await defaultTestInit();
    const row = await screen.findByText('x-axis');
    expect(row).toBeInTheDocument();
  });

  it(`should display chart Tiltle`, async () => {
    await defaultTestInit();
    const row = await screen.findByText('test chart');
    expect(row).toBeInTheDocument();
  });
});
