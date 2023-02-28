import * as React from 'react';

import PlotlyPlot, { Figure } from 'react-plotly.js';
import {
  Layout as PlotlyLayout,
  PlotHoverEvent,
  PlotMouseEvent,
} from 'plotly.js';

import { PlotWrapper } from '../elements';
import { getCommonAxisLayoutProps } from '../utils/getCommonAxisLayoutProps';
import { Data, Layout, LineChartProps } from '../types';
import { getMarginLayout } from '../utils/getMarginLayout';
import { useMemo } from 'react';
import { getRangeMode } from '../utils/getRangeMode';
import { useAxisTickCount } from '../hooks/useAxisTickCount';
import { adaptToPlotlyPlotData } from '../utils/adaptToPlotlyPlotData';

export interface PlotProps extends Pick<LineChartProps, 'xAxis' | 'yAxis'> {
  data: Data | Data[];
  layout: Required<Layout>;
  onHover?: (event: PlotHoverEvent) => void;
  onUnhover?: (event: PlotMouseEvent) => void;
  onUpdate?: (figure: Figure, graph: HTMLElement) => void;
}

export const Plot: React.FC<PlotProps> = React.memo(
  ({ data, xAxis, yAxis, layout, onHover, onUnhover, onUpdate }) => {
    const { xAxisTickCount, yAxisTickCount, updateAxisTickCount } =
      useAxisTickCount({ xAxis, yAxis });

    const adaptedData = useMemo(() => adaptToPlotlyPlotData(data), [data]);

    const xAxisRangeMode = useMemo(() => getRangeMode(data, 'x'), [data]);
    const yAxisRangeMode = useMemo(() => getRangeMode(data, 'y'), [data]);

    const { responsive, showTicks } = layout;

    const plotLayout: Partial<PlotlyLayout> = {
      xaxis: {
        ...getCommonAxisLayoutProps(xAxis, layout),
        rangemode: xAxisRangeMode,
        nticks: xAxisTickCount,
      },
      yaxis: {
        ...getCommonAxisLayoutProps(yAxis, layout),
        rangemode: yAxisRangeMode,
        nticks: yAxisTickCount,
      },
      margin: getMarginLayout(layout),
      dragmode: false,
    };

    const handleUpdate = (figure: Figure, graph: HTMLElement) => {
      updateAxisTickCount(graph);
      onUpdate?.(figure, graph);
    };

    return (
      <PlotWrapper showticks={showTicks}>
        <PlotlyPlot
          data={adaptedData}
          layout={plotLayout}
          useResizeHandler={responsive}
          onHover={onHover}
          onUnhover={onUnhover}
          onUpdate={handleUpdate}
        />
      </PlotWrapper>
    );
  }
);
