import { screen } from '@testing-library/react';

import { testRenderer } from '__test-utils/renderer';

import { ChartZoomActions } from '../ChartZoomActions';
import { ChartZoomActionsProps } from '../types';

describe('ChartZoomActions', () => {
  const defaultProps: ChartZoomActionsProps = {
    zoomOut: jest.fn(),
    zoomIn: jest.fn(),
    disableZoomOut: true,
    disableZoomIn: true,
    resetZoom: jest.fn(),
  };

  const testInit = async (props: ChartZoomActionsProps = defaultProps) =>
    testRenderer(ChartZoomActions, undefined, props);

  it('should render the zoom action buttons as expected', () => {
    testInit();

    expect(screen.getByTestId('chart-zoom-out-button')).toBeInTheDocument();
    expect(screen.getByTestId('chart-zoom-in-button')).toBeInTheDocument();
    expect(screen.getByTestId('chart-reset-zoom-button')).toBeInTheDocument();
  });
});
