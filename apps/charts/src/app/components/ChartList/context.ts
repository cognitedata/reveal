import React from 'react';

import PreviewPlotContainer from '@charts-app/components/PlotlyChart/PreviewPlotContainer';

export interface ChartListContextInterface {
  PreviewPlotContainer: typeof PreviewPlotContainer;
}

export const ChartListContext = React.createContext<ChartListContextInterface>({
  PreviewPlotContainer,
});
