import { screen } from '@testing-library/react';
import groupBy from 'lodash/groupBy';

import { Data, data, xScale } from '__test-utils/fixtures/charts';
import { testRenderer } from '__test-utils/renderer';
import { DEFAULT_MARGINS } from 'components/Charts/constants';

import { Bars } from '../Bars';
import { BarsProps } from '../types';

const BarsComponent = (props: BarsProps<Data>) => (
  <svg>
    <Bars {...props} />
  </svg>
);

describe('StackedBarChart -> Bars', () => {
  const groupedData = groupBy(data, 'label');

  const defaultProps: BarsProps<Data> = {
    initialGroupedData: groupedData,
    groupedData,
    scales: { x: xScale, y: jest.fn() as any },
    xScaleMaxValue: 100,
    yScaleDomain: Object.keys(groupedData),
    accessors: { x: 'count', y: 'label' },
    margins: DEFAULT_MARGINS,
    barComponentDimensions: { width: 100, height: 30 },
    onSelectBar: jest.fn(),
  };

  const testInit = (props: BarsProps<Data> = defaultProps) =>
    testRenderer(BarsComponent, undefined, props);

  it('should render bar group labels as expected', () => {
    testInit();

    expect(screen.getAllByTestId('bar-label').length).toEqual(2);
    expect(screen.getByText('Label1')).toBeInTheDocument();
    expect(screen.getByText('Label2')).toBeInTheDocument();
  });

  it('should render bars as expected', () => {
    testInit();
    expect(screen.getAllByTestId('bar').length).toEqual(5);
  });
});
