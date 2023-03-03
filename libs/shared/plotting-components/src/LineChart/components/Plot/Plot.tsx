import * as React from 'react';

import PlotlyPlot, { Figure } from 'react-plotly.js';
import {
  Layout as PlotlyLayout,
  Config as PlotlyConfig,
  PlotHoverEvent,
  PlotMouseEvent,
  PlotRelayoutEvent,
} from 'plotly.js';

import { getCommonAxisLayoutProps } from '../../utils/getCommonAxisLayoutProps';
import { Config, Data, Layout, LineChartProps } from '../../types';
import { getMarginLayout } from '../../utils/getMarginLayout';
import { useMemo, useRef } from 'react';
import { useAxisTickCount } from '../../hooks/useAxisTickCount';
import { adaptToPlotlyPlotData } from '../../utils/adaptToPlotlyPlotData';

import { PlotWrapper } from './elements';
import { useAxisRangeMode } from '../../hooks/useAxisRangeMode';
import { useZoomPlot } from '../../hooks/useZoomPlot';

export interface PlotProps extends Pick<LineChartProps, 'xAxis' | 'yAxis'> {
  data: Data | Data[];
  layout: Required<Layout>;
  config: Required<Config>;
  onHover?: (event: PlotHoverEvent) => void;
  onUnhover?: (event: PlotMouseEvent) => void;
}

export const Plot: React.FC<PlotProps> = React.memo(
  ({ data, xAxis, yAxis, layout, config, onHover, onUnhover }) => {
    const plotRef = useRef<HTMLDivElement>(null);

    const adaptedData = useMemo(() => adaptToPlotlyPlotData(data), [data]);

    const { xAxisRangeMode, yAxisRangeMode } = useAxisRangeMode(data);

    const { xAxisTickCount, yAxisTickCount, updateAxisTickCount } =
      useAxisTickCount({ xAxis, yAxis });

    const { xAxisZoomLayout, yAxisZoomLayout, updateZoom, resetZoom } =
      useZoomPlot();

    const { showTicks } = layout;
    const { responsive, scrollZoom } = config;

    const plotLayout: Partial<PlotlyLayout> = {
      xaxis: {
        ...getCommonAxisLayoutProps(xAxis, layout),
        ...xAxisZoomLayout,
        rangemode: xAxisRangeMode,
        nticks: xAxisTickCount,
      },
      yaxis: {
        ...getCommonAxisLayoutProps(yAxis, layout),
        ...yAxisZoomLayout,
        rangemode: yAxisRangeMode,
        nticks: yAxisTickCount,
      },
      margin: getMarginLayout(layout),
    };

    const plotConfig: Partial<PlotlyConfig> = {
      scrollZoom,
      showAxisDragHandles: false,
    };

    const handleUpdate = (figure: Figure) => {
      updateZoom(figure);
    };

    const handleRelayout = (_event: PlotRelayoutEvent) => {
      updateAxisTickCount(plotRef.current);
    };

    const handleDoubleClick = () => {
      resetZoom();
    };

    return useMemo(() => {
      return (
        <PlotWrapper ref={plotRef} showticks={showTicks}>
          <PlotlyPlot
            data={adaptedData}
            layout={plotLayout}
            config={plotConfig}
            useResizeHandler={responsive}
            onHover={onHover}
            onUnhover={onUnhover}
            onUpdate={handleUpdate}
            onRelayout={handleRelayout}
            onDoubleClick={handleDoubleClick}
          />
        </PlotWrapper>
      );
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [adaptedData, plotLayout]);
  }
);
