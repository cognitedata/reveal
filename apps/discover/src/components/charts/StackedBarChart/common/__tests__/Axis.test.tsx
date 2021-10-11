import { screen } from '@testing-library/react';

import { testRenderer } from '__test-utils/renderer';

import { AXIS_PLACEMENT } from '../../constants';
import { ChartSVG } from '../../elements';
import { AxisProps } from '../../types';
import { Axis } from '../Axis';

jest.mock('d3-axis', () => ({
  axisTop: jest.fn(),
}));

jest.mock('d3-selection', () => ({
  select: jest.fn(),
}));

const AxisComponent = (props: AxisProps) => (
  <ChartSVG>
    <Axis {...props} />
  </ChartSVG>
);

describe('StackedBarChart -> Axis', () => {
  const defaultProps: AxisProps = {
    placement: AXIS_PLACEMENT.Top,
    scale: jest.fn() as any,
    translate: 'translate(0, 0)',
  };

  const testInit = (props: AxisProps = defaultProps) =>
    testRenderer(AxisComponent, undefined, props);

  it('should render axis as expected', async () => {
    testInit();

    expect(
      screen.getByTestId(`axis-${AXIS_PLACEMENT.Top}`)
    ).toBeInTheDocument();
  });
});
