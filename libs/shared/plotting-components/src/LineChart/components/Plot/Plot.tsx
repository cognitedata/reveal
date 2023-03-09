import * as React from 'react';
import { useImperativeHandle, useMemo, useRef } from 'react';

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
import { useIsCursorOnPlotArea } from '../../hooks/useIsCursorOnPlotArea';
import { usePlotDataRange } from '../../hooks/usePlotDataRange';
import { adaptToPlotlyPlotData } from '../../utils/adaptToPlotlyPlotData';

import { PlotWrapper } from './elements';

export interface PlotElement {
  getPlotRange: () => PlotRange;
  setPlotRange: (range: PlotRange) => void;
  resetPlotRange: () => void;
}

export interface PlotProps extends Pick<LineChartProps, 'xAxis' | 'yAxis'> {
  data: Data | Data[];
  layout: Layout;
  config: Config;
  onHover?: (event: PlotHoverEvent) => void;
  onUnhover?: (event: PlotMouseEvent) => void;
}

export const Plot = React.memo(
  React.forwardRef<PlotElement, PlotProps>(
    ({ data, xAxis, yAxis, layout, config, onHover, onUnhover }, ref) => {
      const { showTicks, showMarkers } = layout;
      const { responsive } = config;

      const plotRef = useRef<HTMLDivElement>(null);

      const adaptedData = useMemo(() => {
        return adaptToPlotlyPlotData(data, showMarkers);
      }, [data, showMarkers]);

      const { tickCount, updateAxisTickCount } = useAxisTickCount({
        x: xAxis?.tickCount,
        y: yAxis?.tickCount,
      });

      const { margin, updateLayoutMargin } = useLayoutMargin(layout);

      const { isCursorOnPlotArea, initializePlotAreaCursorDetector } =
        useIsCursorOnPlotArea();

      const initialRange = usePlotDataRange(data, showMarkers);

      const { range, setPlotRange, resetPlotRange } =
        useHandlePlotRange(initialRange);

      const { fixedRange, fixedRangeLayoutConfig, cursor } =
        useLayoutFixedRangeConfig(config, isCursorOnPlotArea);

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
      };

      const plotConfig: Partial<PlotlyConfig> = {
        scrollZoom: Boolean(config.scrollZoom) && isCursorOnPlotArea,
        showAxisDragHandles: true,
        displayModeBar: false,
      };

      const handleInitialized = (_figure: Figure, graph: HTMLElement) => {
        initializePlotAreaCursorDetector(graph);
        resetPlotRange();
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

      const handleDeselect = () => {
        resetPlotRange();
      };

      const handleDoubleClick = () => {
        resetPlotRange();
      };

      return (
        <PlotWrapper ref={plotRef} showticks={showTicks} cursor={cursor}>
          <PlotlyPlot
            data={adaptedData}
            layout={plotLayout}
            config={plotConfig}
            useResizeHandler={responsive}
            onInitialized={handleInitialized}
            onHover={onHover}
            onUnhover={onUnhover}
            onUpdate={handleUpdate}
            onRelayout={handleRelayout}
            onSelected={handleSelected}
            onDeselect={handleDeselect}
            onDoubleClick={handleDoubleClick}
          />
        </PlotWrapper>
      );
    }
  )
);
