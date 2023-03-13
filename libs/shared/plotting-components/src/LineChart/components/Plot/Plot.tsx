import * as React from 'react';
import { useImperativeHandle, useRef } from 'react';

import PlotlyPlot, { Figure } from 'react-plotly.js';
import {
  Layout as PlotlyLayout,
  Config as PlotlyConfig,
  PlotHoverEvent,
  PlotMouseEvent,
  PlotRelayoutEvent,
  PlotSelectionEvent,
} from 'plotly.js';

import { getCommonAxisLayoutProps } from '../../utils/getCommonAxisLayoutProps';
import {
  AxisRange,
  Config,
  Data,
  Layout,
  LineChartProps,
  PlotRange,
} from '../../types';
import { useAxisTickCount } from '../../hooks/useAxisTickCount';
import { useHandlePlotRange } from '../../hooks/useHandlePlotRange';
import { useLayoutMargin } from '../../hooks/useLayoutMargin';
import { useLayoutFixedRangeConfig } from '../../hooks/useLayoutFixedRangeConfig';
import { usePlotDataRange } from '../../hooks/usePlotDataRange';
import { getPlotlyHoverMode } from '../../utils/getPlotlyHoverMode';

import { PlotWrapper } from './elements';
import { DEFAULT_BACKGROUND_COLOR } from '../../constants';
import { usePlotData } from '../../hooks/usePlotData';

export interface PlotElement {
  getPlotRange: () => PlotRange;
  setPlotRange: (range: PlotRange) => void;
  resetPlotRange: () => void;
}

export interface PlotProps extends Pick<LineChartProps, 'xAxis' | 'yAxis'> {
  data: Data | Data[];
  layout: Layout;
  config: Config;
  plotHoverEvent?: PlotHoverEvent;
  isCursorOnPlot: boolean;
  width?: number;
  height?: number;
  backgroundColor?: string;
  onHover?: (event: PlotHoverEvent) => void;
  onUnhover?: (event: PlotMouseEvent) => void;
  onInitialized?: (figure: Figure, graph: HTMLElement) => void;
}

export const Plot = React.memo(
  React.forwardRef<PlotElement, PlotProps>(
    (
      {
        data,
        xAxis,
        yAxis,
        layout,
        config,
        plotHoverEvent,
        isCursorOnPlot,
        width,
        height,
        backgroundColor = DEFAULT_BACKGROUND_COLOR,
        onHover,
        onUnhover,
      },
      ref
    ) => {
      const { showTicks, showMarkers } = layout;
      const { responsive } = config;

      const plotRef = useRef<HTMLDivElement>(null);

      const { plotData, dataRevision } = usePlotData({
        data,
        layout,
        plotHoverEvent,
        backgroundColor,
      });

      const { tickCount, updateAxisTickCount } = useAxisTickCount({
        x: xAxis?.tickCount,
        y: yAxis?.tickCount,
      });

      const { margin, updateLayoutMargin } = useLayoutMargin({
        layout,
        xAxis,
        yAxis,
      });

      const initialRange = usePlotDataRange(data, showMarkers);

      const { range, setPlotRange, resetPlotRange } =
        useHandlePlotRange(initialRange);

      const { fixedRange, fixedRangeLayoutConfig, cursor } =
        useLayoutFixedRangeConfig(config, isCursorOnPlot);

      useImperativeHandle(
        ref,
        () => {
          return {
            getPlotRange: () => range,
            setPlotRange,
            resetPlotRange,
          };
        },
        [range, setPlotRange, resetPlotRange]
      );

      const plotLayout: Partial<PlotlyLayout> = {
        xaxis: {
          ...getCommonAxisLayoutProps(xAxis, layout),
          nticks: tickCount.x,
          range: range.x,
          fixedrange: fixedRange.x,
        },
        yaxis: {
          ...getCommonAxisLayoutProps(yAxis, layout),
          nticks: tickCount.y,
          range: range.y,
          fixedrange: fixedRange.y,
        },
        ...fixedRangeLayoutConfig,
        margin,
        hovermode: getPlotlyHoverMode(config.hoverMode),
        datarevision: dataRevision,
      };

      const plotConfig: Partial<PlotlyConfig> = {
        scrollZoom: Boolean(config.scrollZoom) && isCursorOnPlot,
        showAxisDragHandles: true,
        displayModeBar: false,
      };

      const handleUpdate = (figure: Figure, _graph: HTMLElement) => {
        const { xaxis, yaxis } = figure.layout;
        setPlotRange({
          x: xaxis?.range as AxisRange | undefined,
          y: yaxis?.range as AxisRange | undefined,
        });
      };

      const handleRelayout = (_event: PlotRelayoutEvent) => {
        const graph = plotRef.current;
        updateAxisTickCount(graph);
        updateLayoutMargin(graph);
      };

      const handleSelected = (event?: PlotSelectionEvent) => {
        setPlotRange({
          x: event?.range?.x as AxisRange | undefined,
          y: event?.range?.y as AxisRange | undefined,
        });
      };

      return (
        <PlotWrapper ref={plotRef} showticks={showTicks} cursor={cursor}>
          <PlotlyPlot
            data={plotData}
            layout={plotLayout}
            config={plotConfig}
            style={{ height, width }}
            useResizeHandler={responsive}
            onInitialized={resetPlotRange}
            onHover={onHover}
            onUnhover={onUnhover}
            onUpdate={handleUpdate}
            onRelayout={handleRelayout}
            onSelected={handleSelected}
            onDeselect={resetPlotRange}
            onDoubleClick={resetPlotRange}
          />
        </PlotWrapper>
      );
    }
  )
);
