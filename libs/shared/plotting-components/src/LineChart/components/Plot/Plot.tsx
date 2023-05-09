import * as React from 'react';
import {
  useImperativeHandle,
  useRef,
  useMemo,
  useCallback,
  useEffect,
} from 'react';

import PlotlyPlot from 'react-plotly.js';
import {
  Layout as PlotlyLayout,
  Config as PlotlyConfig,
  PlotHoverEvent,
  PlotMouseEvent,
  PlotSelectionEvent,
  PlotRelayoutEvent,
} from 'plotly.js';

import debounce from 'lodash/debounce';

import { getCommonAxisLayoutProps } from '../../utils/getCommonAxisLayoutProps';
import { Config, Layout, LineChartProps, PlotRange } from '../../types';
import { useAxisTickCount } from '../../hooks/useAxisTickCount';
import { useHandlePlotRange } from '../../hooks/useHandlePlotRange';
import { useLayoutMargin } from '../../hooks/useLayoutMargin';
import { useLayoutFixedRangeConfig } from '../../hooks/useLayoutFixedRangeConfig';
import { usePlotDataRangeInitial } from '../../hooks/usePlotDataRangeInitial';
import { getPlotlyHoverMode } from '../../utils/getPlotlyHoverMode';
import {
  getPlotRangeFromPlotSelectionEvent,
  getPlotRangeFromRelayoutEvent,
} from '../../utils/extractPlotRange';
import { isUndefinedPlotRange } from '../../utils/isUndefinedPlotRange';

import { PlotWrapper } from './elements';
import { usePlotData } from '../../hooks/usePlotData';
import { Loader } from '../Loader';

export interface PlotElement {
  getPlotRange: () => PlotRange | undefined;
  setPlotRange: (range: PlotRange) => void;
  resetPlotRange: () => void;
}

export interface PlotProps
  extends Pick<
    LineChartProps,
    | 'data'
    | 'dataRevision'
    | 'isLoading'
    | 'xAxis'
    | 'yAxis'
    | 'variant'
    | 'onRangeChange'
  > {
  layout: Layout;
  config: Config;
  isCursorOnPlot: boolean;
  width?: number;
  height?: number;
  onHover?: (event: PlotHoverEvent) => void;
  onUnhover?: (event: PlotMouseEvent) => void;
  onSelecting?: (event?: PlotSelectionEvent) => void;
  onSelected?: (event?: PlotSelectionEvent) => void;
}

export const Plot = React.memo(
  React.forwardRef<PlotElement, PlotProps>(
    (
      {
        data,
        dataRevision,
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
        onRangeChange,
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

      const initialRange = usePlotDataRangeInitial({
        data,
        showMarkers,
        dataRevision,
      });

      const { range, setPlotRange, resetPlotRange } = useHandlePlotRange({
        initialRange,
        onRangeChange,
      });

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
            range: range?.x,
            fixedrange: fixedRange.x,
          },
          yaxis: {
            ...getCommonAxisLayoutProps('y', yAxis, layout),
            nticks: tickCount.y,
            range: range?.y,
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

      const handleManualRelayout = useCallback(() => {
        updateAxisTickCount(plotRef.current, isEmptyData);
        updateLayoutMargin(plotRef.current);
      }, [isEmptyData, updateAxisTickCount, updateLayoutMargin]);

      const handleInitialized = useCallback(() => {
        resetPlotRange();
        handleManualRelayout();
      }, [resetPlotRange, handleManualRelayout]);

      // eslint-disable-next-line react-hooks/exhaustive-deps
      const handleRelayout = useCallback(
        debounce((event: PlotRelayoutEvent) => {
          if (initialRange) {
            const plotRange = getPlotRangeFromRelayoutEvent(event);

            if (!isUndefinedPlotRange(plotRange)) {
              setPlotRange({
                x: plotRange.x || initialRange.x,
                y: plotRange.y || initialRange.y,
              });
            }
          }
          handleManualRelayout();
        }, 500),
        [initialRange, setPlotRange, handleManualRelayout]
      );

      const handleSelected = useCallback(
        (event?: PlotSelectionEvent) => {
          const plotRange = getPlotRangeFromPlotSelectionEvent(event);
          setPlotRange(plotRange);
          onSelected?.(event);
        },
        [setPlotRange, onSelected]
      );

      const handleResetPlotZoom = useCallback(() => {
        resetPlotRange();
        handleManualRelayout();
      }, [resetPlotRange, handleManualRelayout]);

      useEffect(() => {
        handleManualRelayout();
      }, [handleManualRelayout, plotData]);

      if (isLoading) {
        return <Loader variant={variant} style={{ height, width }} />;
      }

      return (
        <PlotWrapper
          ref={plotRef}
          showticks={showTicks}
          cursor={cursor}
          variant={variant}
        >
          <PlotlyPlot
            data={plotData}
            layout={plotLayout}
            config={plotConfig}
            style={plotStyle}
            useResizeHandler={responsive}
            onInitialized={handleInitialized}
            onHover={onHover}
            onUnhover={onUnhover}
            onRelayout={handleRelayout}
            onSelecting={onSelecting}
            onSelected={handleSelected}
            onDeselect={handleResetPlotZoom}
            onDoubleClick={handleResetPlotZoom}
          />
        </PlotWrapper>
      );
    }
  )
);
