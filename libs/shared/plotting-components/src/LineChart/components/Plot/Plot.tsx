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

import debounce from 'lodash/debounce';
import {
  Layout as PlotlyLayout,
  Config as PlotlyConfig,
  PlotHoverEvent,
  PlotMouseEvent,
  PlotSelectionEvent,
  PlotRelayoutEvent,
} from 'plotly.js';

import { useAxisTickCount } from '../../hooks/useAxisTickCount';
import { useDeepMemo } from '../../hooks/useDeep';
import { useHandlePlotRange } from '../../hooks/useHandlePlotRange';
import { useLayoutFixedRangeConfig } from '../../hooks/useLayoutFixedRangeConfig';
import { useLayoutMargin } from '../../hooks/useLayoutMargin';
import { usePlotData } from '../../hooks/usePlotData';
import { usePlotDataRange } from '../../hooks/usePlotDataRange';
import { usePlotDataRangeInitial } from '../../hooks/usePlotDataRangeInitial';
import { usePlotRevision } from '../../hooks/usePlotRevision';
import {
  Config,
  Layout,
  LineChartProps,
  PlotRange,
  PresetPlotRange,
} from '../../types';
import {
  getPlotRangeFromPlotSelectionEvent,
  getPlotRangeFromRelayoutEvent,
} from '../../utils/extractPlotRange';
import { getCommonAxisLayoutProps } from '../../utils/getCommonAxisLayoutProps';
import { getPlotlyHoverMode } from '../../utils/getPlotlyHoverMode';
import { Loader } from '../Loader';

import { PlotWrapper } from './elements';

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
  height?: React.CSSProperties['height'];
  onHover?: (event: PlotHoverEvent) => void;
  onUnhover?: (event: PlotMouseEvent) => void;
  onSelecting?: (event?: PlotSelectionEvent) => void;
  onSelected?: (event?: PlotSelectionEvent) => void;
  inverted?: boolean;
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
        height,
        onHover,
        onUnhover,
        onSelecting,
        onSelected,
        onRangeChange,
        inverted,
      },
      ref
    ) => {
      const { showTicks, showMarkers } = layout;
      const { responsive, scrollZoom, pan } = config;

      const plotRef = useRef<HTMLDivElement>(null);

      const plotRevision = usePlotRevision(plotRef);

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
        presetRange,
      });

      const { range, setPlotRange, resetPlotRange } = useHandlePlotRange({
        initialRange,
        plotDataRange,
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
            automargin: true,
          },
          ...fixedRangeLayoutConfig,
          margin,
          hovermode: getPlotlyHoverMode(config.hoverMode, plotData.length),
          autosize: responsive,
          showlegend: false,
        }),
        [
          tickCount,
          presetRange,
          range,
          fixedRange,
          fixedRangeLayoutConfig,
          margin,
          plotData.length,
        ]
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

      const handleManualRelayout = useCallback(() => {
        updateAxisTickCount(plotRef.current, isEmptyData);
        updateLayoutMargin(plotRef.current);
      }, [isEmptyData, updateAxisTickCount, updateLayoutMargin]);

      // eslint-disable-next-line react-hooks/exhaustive-deps
      const handleRelayout = useCallback(
        debounce((event: PlotRelayoutEvent) => {
          const plotRange = getPlotRangeFromRelayoutEvent(event);
          setPlotRange(plotRange, true);
          handleManualRelayout();
        }, 500),
        [plotDataRange, setPlotRange, handleManualRelayout]
      );

      const handleSelected = useCallback(
        (event?: PlotSelectionEvent) => {
          const plotRange = getPlotRangeFromPlotSelectionEvent(event);
          setPlotRange(plotRange, false);
          onSelected?.(event);
        },
        [setPlotRange, onSelected]
      );

      const handleResetPlotZoom = useCallback(() => {
        resetPlotRange();
        handleManualRelayout();
      }, [resetPlotRange, handleManualRelayout]);

      useEffect(() => {
        /**
         * We need this side-effect to be triggered slightly after the container changes.
         * Otherwise the calculations are made with the old measurements.
         */
        setTimeout(() => handleManualRelayout());
      }, [handleManualRelayout, plotData, plotRevision]);

      if (isLoading) {
        return <Loader variant={variant} height={height} />;
      }

      return (
        <PlotWrapper
          ref={plotRef}
          showticks={showTicks}
          cursor={cursor}
          variant={variant}
          inverted={inverted}
        >
          <PlotlyPlot
            data={plotData}
            revision={plotRevision}
            layout={plotLayout}
            config={plotConfig}
            style={{ width: '100%', height: '100%' }}
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
