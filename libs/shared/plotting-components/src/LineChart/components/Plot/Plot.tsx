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
import { getMarginLayout } from '../../utils/getMarginLayout';
import { useAxisTickCount } from '../../hooks/useAxisTickCount';
import { adaptToPlotlyPlotData } from '../../utils/adaptToPlotlyPlotData';

import { PlotWrapper } from './elements';
import { useAxisRangeMode } from '../../hooks/useAxisRangeMode';
import { useHandlePlotRange } from '../../hooks/useHandlePlotRange';
import { getFixedRangeConfig } from '../../utils/getFixedRangeConfig';
import { getSelectDirection } from '../../utils/getSelectDirection';
import { useAxisDirection } from '../../hooks/useAxisDirection';
import { getPlotAreaCursor } from '../../utils/getPlotAreaCursor';
import { useIsCursorOnPlotArea } from '../../hooks/useIsCursorOnPlotArea';

export interface PlotElement {
  getPlotRange: () => PlotRange;
  setPlotRange: (range: PlotRange) => void;
  resetPlotRange: () => void;
}

export interface PlotProps extends Pick<LineChartProps, 'xAxis' | 'yAxis'> {
  data: Data | Data[];
  layout: Required<Layout>;
  config: Required<Config>;
  onHover?: (event: PlotHoverEvent) => void;
  onUnhover?: (event: PlotMouseEvent) => void;
}

export const Plot = React.memo(
  React.forwardRef<PlotElement, PlotProps>(
    ({ data, xAxis, yAxis, layout, config, onHover, onUnhover }, ref) => {
      const { showTicks } = layout;
      const { responsive, scrollZoom, selectionZoom, pan } = config;

      const plotRef = useRef<HTMLDivElement>(
        (ref as React.RefObject<HTMLDivElement>).current
      );

      const adaptedData = useMemo(() => adaptToPlotlyPlotData(data), [data]);

      const { tickCount, updateAxisTickCount } = useAxisTickCount({
        x: xAxis?.tickCount,
        y: yAxis?.tickCount,
      });
      const { range, setPlotRange, resetPlotRange } = useHandlePlotRange();
      const { xAxisRangeMode, yAxisRangeMode } = useAxisRangeMode(data);

      const { isCursorOnPlotArea, initializePlotAreaCursorDetector } =
        useIsCursorOnPlotArea();

      const scrollZoomDirection = useAxisDirection(scrollZoom);
      const selectionZoomDirection = useAxisDirection(selectionZoom);
      const panDirection = useAxisDirection(pan);

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

      const getAxisFixedRange = (axis: 'x' | 'y') => {
        if (scrollZoomDirection && isCursorOnPlotArea) {
          return getFixedRangeConfig(scrollZoomDirection, axis);
        }
        if (panDirection) {
          return getFixedRangeConfig(panDirection, axis);
        }
        return false;
      };

      const plotLayout: Partial<PlotlyLayout> = {
        xaxis: {
          ...getCommonAxisLayoutProps(xAxis, layout),
          nticks: tickCount.x,
          range: range.x,
          rangemode: xAxisRangeMode,
          fixedrange: getAxisFixedRange('x'),
        },
        yaxis: {
          ...getCommonAxisLayoutProps(yAxis, layout),
          nticks: tickCount.y,
          range: range.y,
          rangemode: yAxisRangeMode,
          fixedrange: getAxisFixedRange('y'),
        },
        margin: getMarginLayout(layout),
        dragmode: selectionZoomDirection ? 'select' : false,
        selectdirection: getSelectDirection(selectionZoomDirection),
      };

      const plotConfig: Partial<PlotlyConfig> = {
        scrollZoom: isCursorOnPlotArea && Boolean(scrollZoomDirection),
        showAxisDragHandles: true,
      };

      const handleInitialized = (figure: Figure, graph: HTMLElement) => {
        initializePlotAreaCursorDetector(graph);
        handleUpdate(figure, graph);
      };

      const handleUpdate = (figure: Figure, _graph: HTMLElement) => {
        const { xaxis, yaxis } = figure.layout;
        setPlotRange({
          x: xaxis?.range as AxisRange | undefined,
          y: yaxis?.range as AxisRange | undefined,
        });
      };

      const handleRelayout = (_event: PlotRelayoutEvent) => {
        updateAxisTickCount(plotRef.current);
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
        <PlotWrapper
          ref={plotRef}
          showticks={showTicks}
          cursor={getPlotAreaCursor(selectionZoomDirection)}
        >
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
