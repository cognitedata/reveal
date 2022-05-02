import { screen } from '@testing-library/react';

import { testRenderer } from '__test-utils/renderer';

import { Axis } from '../Axis';
import { AxisPlacement, AxisProps } from '../types';

jest.mock('d3-axis', () => ({
  axisTop: jest.fn(),
}));

jest.mock('d3-selection', () => ({
  select: jest.fn(),
}));

const AxisComponent = (props: AxisProps) => (
  <svg>
    <Axis {...props} />
  </svg>
);

describe('Axis', () => {
  const defaultProps: AxisProps = {
    placement: AxisPlacement.Top,
    scale: jest.fn() as any,
    translate: 'translate(0, 0)',
  };

  const testInit = (props: AxisProps = defaultProps) =>
    testRenderer(AxisComponent, undefined, props);

  it('should render axis as expected', async () => {
    testInit();

    expect(screen.getByTestId(`axis-${AxisPlacement.Top}`)).toBeInTheDocument();
  });
});
