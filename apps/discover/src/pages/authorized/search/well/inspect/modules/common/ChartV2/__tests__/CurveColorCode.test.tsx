import { screen } from '@testing-library/react';
import { PlotData } from 'plotly.js';

import { testRenderer } from '__test-utils/renderer';

import CurveColorCode from '../CurveColorCode';

describe('View Mode Selector', () => {
  const testInit = async (viewProps?: Partial<PlotData>) =>
    testRenderer(CurveColorCode, undefined, viewProps);

  it('should display line', async () => {
    await testInit({
      line: {},
    });
    expect(screen.getByTestId('chart-line')).toBeInTheDocument();
  });

  it('should display triangle', async () => {
    await testInit({
      marker: {},
    });
    expect(screen.getByTestId('chart-symbol')).toBeInTheDocument();
  });
});
