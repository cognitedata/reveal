import { screen } from '@testing-library/react';

import { Data, data } from '__test-utils/fixtures/charts';
import { testRenderer } from '__test-utils/renderer';

import { Plots } from '../Plots';
import { PlotsProps } from '../types';

const PlotsComponent = (props: PlotsProps<Data>) => (
  <svg>
    <Plots {...props} />
  </svg>
);

describe('ScatterPlot -> Plots', () => {
  const defaultProps: PlotsProps<Data> = {
    data,
    scales: { x: jest.fn() as any, y: jest.fn() as any },
    accessors: { x: 'count', y: 'label' },
  };

  const testInit = (props: PlotsProps<Data> = defaultProps) =>
    testRenderer(PlotsComponent, undefined, props);

  it('should render plots as expected', () => {
    testInit();
    expect(screen.getAllByTestId('plot').length).toEqual(5);
  });
});
