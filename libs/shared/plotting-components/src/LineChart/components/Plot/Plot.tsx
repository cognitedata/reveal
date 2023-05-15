import {
  useImperativeHandle,
  useRef,
  useMemo,
  useCallback,
  useEffect,
  memo,
  forwardRef,
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
import {
  Config,
  Layout,
  LineChartProps,
  PlotRange,
  PresetPlotRange,
} from '../../types';
import { useAxisTickCount } from '../../hooks/useAxisTickCount';
import { useHandlePlotRange } from '../../hooks/useHandlePlotRange';
import { useLayoutMargin } from '../../hooks/useLayoutMargin';
import { useLayoutFixedRangeConfig } from '../../hooks/useLayoutFixedRangeConfig';
import { usePlotDataRangeInitial } from '../../hooks/usePlotDataRangeInitial';
import { usePlotDataRange } from '../../hooks/usePlotDataRange';
import { useDeepMemo } from '../../hooks/useDeep';
import { getPlotlyHoverMode } from '../../utils/getPlotlyHoverMode';
import {
  getPlotRangeFromPlotSelectionEvent,
  getPlotRangeFromRelayoutEvent,
} from '../../utils/extractPlotRange';

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
  presetRange?: PresetPlotRange;
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

export const Plot = memo(
  forwardRef<PlotElement, PlotProps>(
    (
      {
        data,
        dataRevision,
        isLoading,
        variant,
        xAxis,
        yAxis,
        presetRange,
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
        presetRange,
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

      const plotDataRange = usePlotDataRange({ data });

      const initialRange = usePlotDataRangeInitial({
        plotDataRange,
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

      const plotLayout: Partial<PlotlyLayout> = useDeepMemo(
        () => ({
          xaxis: {
            ...getCommonAxisLayoutProps('x', xAxis, layout),
            nticks: tickCount.x,
            range: presetRange?.x || range?.x,
            fixedrange: fixedRange.x,
          },
          yaxis: {
            ...getCommonAxisLayoutProps('y', yAxis, layout),
            nticks: tickCount.y,
            range: presetRange?.y || range?.y,
            fixedrange: fixedRange.y,
          },
          ...fixedRangeLayoutConfig,
          margin,
          hovermode: getPlotlyHoverMode(config.hoverMode),
        }),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [tickCount, presetRange, range, fixedRange, fixedRangeLayoutConfig]
      );

      const isScrollZoomEnabled = Boolean(scrollZoom);
      const isPanEnabled = Boolean(pan);

      const plotConfig: Partial<PlotlyConfig> = useMemo(
        () => ({
          staticPlot: isEmptyData,
          scrollZoom: isScrollZoomEnabled && isCursorOnPlot,
          showAxisDragHandles: isPanEnabled,
          displayModeBar: false,
        }),
        [isEmptyData, isScrollZoomEnabled, isPanEnabled, isCursorOnPlot]
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

      // eslint-disable-next-line react-hooks/exhaustive-deps
      const handleRelayout = useCallback(
        debounce((event: PlotRelayoutEvent) => {
          const plotRange = getPlotRangeFromRelayoutEvent(event);
          setPlotRange(plotRange);
          handleManualRelayout();
        }, 500),
        [plotDataRange, setPlotRange, handleManualRelayout]
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
            onInitialized={handleManualRelayout}
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
