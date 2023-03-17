import * as React from 'react';
import { useImperativeHandle, useRef, useMemo, useCallback } from 'react';

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
  Variant,
} from '../../types';
import { useAxisTickCount } from '../../hooks/useAxisTickCount';
import { useHandlePlotRange } from '../../hooks/useHandlePlotRange';
import { useLayoutMargin } from '../../hooks/useLayoutMargin';
import { useLayoutFixedRangeConfig } from '../../hooks/useLayoutFixedRangeConfig';
import { usePlotDataRange } from '../../hooks/usePlotDataRange';
import { getPlotlyHoverMode } from '../../utils/getPlotlyHoverMode';

import { PlotWrapper } from './elements';
import { usePlotData } from '../../hooks/usePlotData';
import { Loader } from '../Loader';

export interface PlotElement {
  getPlotRange: () => PlotRange;
  setPlotRange: (range: PlotRange) => void;
  resetPlotRange: () => void;
}

export interface PlotProps extends Pick<LineChartProps, 'xAxis' | 'yAxis'> {
  data: Data | Data[];
  isLoading?: boolean;
  variant?: Variant;
  layout: Layout;
  config: Config;
  isCursorOnPlot: boolean;
  width?: number;
  height?: number;
  onHover?: (event: PlotHoverEvent) => void;
  onUnhover?: (event: PlotMouseEvent) => void;
  onSelecting?: (event: PlotSelectionEvent) => void;
  onSelected?: (event?: PlotSelectionEvent) => void;
  onInitialized?: (figure: Figure, graph: HTMLElement) => void;
}

export const Plot = React.memo(
  React.forwardRef<PlotElement, PlotProps>(
    (
      {
        data,
        isLoading,
        variant,
        xAxis,
        yAxis,
        layout,
        config,
        isCursorOnPlot,
        width,
        height,
        onHover,
        onUnhover,
        onSelecting,
        onSelected,
      },
      ref
    ) => {
      const { showTicks, showMarkers } = layout;
      const { responsive, scrollZoom, pan } = config;

      const plotRef = useRef<HTMLDivElement>(null);

      const { plotData, isEmptyData } = usePlotData({
        data,
        showMarkers,
        variant,
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

      const plotLayout: Partial<PlotlyLayout> = useMemo(
        () => ({
          xaxis: {
            ...getCommonAxisLayoutProps('x', xAxis, layout),
            nticks: tickCount.x,
            range: range.x,
            fixedrange: fixedRange.x,
          },
          yaxis: {
            ...getCommonAxisLayoutProps('y', yAxis, layout),
            nticks: tickCount.y,
            range: range.y,
            fixedrange: fixedRange.y,
          },
          ...fixedRangeLayoutConfig,
          margin,
          hovermode: getPlotlyHoverMode(config.hoverMode),
        }),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [tickCount, range, fixedRange, fixedRangeLayoutConfig]
      );

      const isScrollZoomEnabled = Boolean(scrollZoom);
      const isPanEnabled = Boolean(pan);

      const plotConfig: Partial<PlotlyConfig> = useMemo(
        () => ({
          scrollZoom: isScrollZoomEnabled && isCursorOnPlot,
          showAxisDragHandles: isPanEnabled,
          displayModeBar: false,
        }),
        [isScrollZoomEnabled, isPanEnabled, isCursorOnPlot]
      );

      const plotStyle: React.CSSProperties = useMemo(
        () => ({
          height,
          width,
        }),
        [height, width]
      );

      const handleUpdate = useCallback(
        (figure: Figure, _graph: HTMLElement) => {
          const { xaxis, yaxis } = figure.layout;
          setPlotRange({
            x: xaxis?.range as AxisRange | undefined,
            y: yaxis?.range as AxisRange | undefined,
          });
        },
        [setPlotRange]
      );

      const handleRelayout = useCallback(
        (_event: PlotRelayoutEvent) => {
          updateAxisTickCount(plotRef.current, isEmptyData);
          updateLayoutMargin(plotRef.current);
        },
        [isEmptyData, updateAxisTickCount, updateLayoutMargin]
      );

      const handleSelected = useCallback(
        (event?: PlotSelectionEvent) => {
          onSelected?.(event);
          setPlotRange({
            x: event?.range?.x as AxisRange | undefined,
            y: event?.range?.y as AxisRange | undefined,
          });
        },
        [onSelected, setPlotRange]
      );

      if (isLoading) {
        return <Loader variant={variant} style={{ height, width }} />;
      }

      return (
        <PlotWrapper
          ref={plotRef}
          showticks={showTicks}
          cursor={cursor}
          variant={variant}
          showyticklabels={plotLayout.yaxis?.showticklabels}
        >
          <PlotlyPlot
            data={plotData}
            layout={plotLayout}
            config={plotConfig}
            style={plotStyle}
            useResizeHandler={responsive}
            onInitialized={resetPlotRange}
            onHover={onHover}
            onUnhover={onUnhover}
            onUpdate={handleUpdate}
            onRelayout={handleRelayout}
            onSelecting={onSelecting}
            onSelected={handleSelected}
            onDeselect={resetPlotRange}
            onDoubleClick={resetPlotRange}
          />
        </PlotWrapper>
      );
    }
  )
);
