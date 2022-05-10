import 'modules/map/__mocks/mockMapbox';
import { screen } from '@testing-library/react';

import { getMockMeasurementChartData } from '__test-utils/fixtures/measurements';
import { testRenderer } from '__test-utils/renderer';

import { CompareViewCard, Props } from '../CompareViewCard';

describe('WellCentricBulkActions Tests', () => {
  const page = (props: Props) => {
    return testRenderer(CompareViewCard, undefined, props);
  };

  it('Should render plot with passed curve - wellbore name in legend', async () => {
    const mockChartData = getMockMeasurementChartData();
    const [curveName, wellboreName] = mockChartData.customdata as string[];
    page({
      axisNames: {
        x: 'x',
        y: 'y',
        x2: 'x2',
      },
      chartData: [mockChartData],
      title: 'Test Title',
    });
    expect(screen.getByText(curveName)).toBeInTheDocument();
    expect(screen.getByText(wellboreName)).toBeInTheDocument();
  });
});
