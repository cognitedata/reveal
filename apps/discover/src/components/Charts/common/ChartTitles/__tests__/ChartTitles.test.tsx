import { screen } from '@testing-library/react';

import { testRenderer } from '__test-utils/renderer';

import { ChartTitles, ChartTitlesProps } from '../ChartTitles';

describe('ChartTitles', () => {
  const testInit = async (props?: ChartTitlesProps) =>
    testRenderer(ChartTitles, undefined, props);

  it('should not render anything when props are undefined', () => {
    testInit();
    expect(screen.queryByTestId('chart-title')).not.toBeInTheDocument();
    expect(screen.queryByTestId('chart-subtitle')).not.toBeInTheDocument();
  });

  it('should render the passed title and subtitle', () => {
    const title = 'Test Title';
    const subtitle = 'Test Subtitle';

    testInit({ title, subtitle });

    expect(screen.getByTestId('chart-title')).toBeInTheDocument();
    expect(screen.getByTestId('chart-subtitle')).toBeInTheDocument();
    expect(screen.getByText(title)).toBeInTheDocument();
    expect(screen.getByText(subtitle)).toBeInTheDocument();
  });
});
