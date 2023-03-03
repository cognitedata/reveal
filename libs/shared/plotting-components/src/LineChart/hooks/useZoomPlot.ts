import { useMemo, useState } from 'react';

import { LayoutAxis } from 'plotly.js';
import { Figure } from 'react-plotly.js';

export const useZoomPlot = () => {
  const [xAxisRange, setXAxisRange] = useState<[number, number]>();
  const [yAxisRange, setYAxisRange] = useState<[number, number]>();

  const [autoMargin, setAutoMargin] = useState(true);

  const xAxisZoomLayout: Partial<LayoutAxis> = useMemo(
    () => ({
      range: xAxisRange,
      automargin: autoMargin,
    }),
    [autoMargin, xAxisRange]
  );

  const yAxisZoomLayout: Partial<LayoutAxis> = useMemo(
    () => ({
      range: yAxisRange,
      automargin: autoMargin,
    }),
    [autoMargin, yAxisRange]
  );

  const updateZoom = (figure: Figure) => {
    setAutoMargin(false);
    setXAxisRange(figure.layout.xaxis?.range as [number, number]);
    setYAxisRange(figure.layout.yaxis?.range as [number, number]);
  };

  const resetZoom = () => {
    setAutoMargin(true);
    setXAxisRange(undefined);
    setYAxisRange(undefined);
  };

  return {
    xAxisZoomLayout,
    yAxisZoomLayout,
    updateZoom,
    resetZoom,
  };
};
