import { screen } from '@testing-library/react';

import { testRenderer } from '__test-utils/renderer';
import { AxisPlacement } from 'components/charts/common/Axis';
import { DEFAULT_MARGINS } from 'components/charts/constants';

import { Axes } from './Axes';
import { AxesProps } from './types';

jest.mock('d3-axis', () => ({
  axisTop: jest.fn(),
  axisLeft: jest.fn(),
}));

jest.mock('d3-selection', () => ({
  select: jest.fn(),
}));

const AxesComponent = (props: AxesProps) => (
  <svg>
    <Axes {...props} />
  </svg>
);

describe('StackedBarChart -> Axes', () => {
  const defaultProps: AxesProps = {
    scales: { x: [0, 100] as any, y: [0, 100] as any },
    margins: DEFAULT_MARGINS,
    chartDimensions: { width: 100, height: 100 },
    ticks: 20,
  };

  const testInit = (props: AxesProps = defaultProps) =>
    testRenderer(AxesComponent, undefined, props);

  it('should render axes as expected', async () => {
    testInit();

    expect(screen.getByTestId(`axis-${AxisPlacement.Top}`)).toBeInTheDocument();
    expect(
      screen.getByTestId(`axis-${AxisPlacement.Left}`)
    ).toBeInTheDocument();
  });
});
