import { screen } from '@testing-library/react';
import groupBy from 'lodash/groupBy';

import { Data, data } from '__test-utils/fixtures/stackedBarChart';
import { testRenderer } from '__test-utils/renderer';

import { DEFAULT_MARGINS } from '../../constants';
import { ChartSVG } from '../../elements';
import { BarsProps } from '../../types';
import { Bars } from '../Bars';

const BarsComponent = (props: BarsProps<Data>) => (
  <ChartSVG>
    <Bars {...props} />
  </ChartSVG>
);

describe('StackedBarChart -> Bars', () => {
  const groupedData = groupBy(data, 'label');

  const defaultProps: BarsProps<Data> = {
    groupedData,
    scales: { x: jest.fn() as any, y: jest.fn() as any },
    yScaleDomain: Object.keys(groupedData),
    accessors: { x: 'count', y: 'label' },
    margins: DEFAULT_MARGINS,
    barComponentDimensions: { width: 100, height: 30 },
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
