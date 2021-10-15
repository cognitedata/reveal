import { useCallback, useEffect, useMemo, useState, useRef } from 'react';

import isEmpty from 'lodash/isEmpty';
import isUndefined from 'lodash/isUndefined';

import { ZoomOutButton, ZoomInButton, ResetZoomButton } from './Buttons';
import { Axes } from './common/Axes';
import { Axis } from './common/Axis';
import { Bars } from './common/Bars';
import { Legend } from './common/Legend';
import {
  DEFAULT_MARGINS,
  DEFAULT_X_AXIS_SPACING,
  DEFAULT_Y_AXIS_SPACING,
  DEFAULT_X_AXIS_TICKS,
  DEFAULT_ZOOM_STEP_SIZE,
  DEFAULT_X_AXIS_PLACEMENT,
  LEGEND_BOTTOM_SPACING,
  X_AXIS_LABELS_HEIGHT,
  CHART_HEIGHT_CORRECTION,
} from './constants';
import {
  StackedBarChartWrapper,
  ChartStickyElement,
  ChartDetailsContainer,
  ChartActionButtonsContainer,
  ChartTitle,
  ChartSubtitle,
  AxisLabel,
  ChartContainer,
  ChartSVG,
} from './elements';
import { useChartScales } from './hooks/useChartScales';
import { useGroupedData } from './hooks/useGroupedData';
import { useProcessedData } from './hooks/useProcessedData';
import { useXScaleMaxValue } from './hooks/useXScaleMaxValue';
import { useZoomableChart } from './hooks/useZoomableChart';
import { ResetToDefault } from './ResetToDefault';
import {
  AxisPlacement,
  DataObject,
  LegendCheckboxState,
  StackedBarChartProps,
} from './types';
import {
  getAbsoluteOffsetLeft,
  getCheckedLegendCheckboxOptions,
  getDefaultBarColorConfig,
  getFilteredData,
  getLegendInitialCheckboxState,
} from './utils';

export const StackedBarChart = <T extends DataObject<T>>({
  data,
  xAxis,
  yAxis,
  yScaleDomain,
  groupDataInsideBarsBy,
  title,
  subtitle,
  options,
  offsetLeftDependencies,
  onUpdate,
  onClickBarLabel,
}: StackedBarChartProps<T>) => {
  const chartRef = useRef<HTMLDivElement>(null);

  const [filteredData, setFilteredData] = useState<T[]>(data);
  const [legendCheckboxState, setLegendCheckboxState] =
    useState<LegendCheckboxState>({});
  const [initialParentElementOffsetLeft, setInitialParentElementOffsetLeft] =
    useState<number>();

  const stringifiedData = JSON.stringify(data);
  const margins = options?.margins || DEFAULT_MARGINS;

  const xAccessor = xAxis.accessor;
  const yAccessor = yAxis.accessor;

  const xAxisPlacement = xAxis.placement || DEFAULT_X_AXIS_PLACEMENT;
  const isXAxisOnTop = xAxisPlacement === AxisPlacement.Top;

  const barColorConfig =
    options?.barColorConfig ||
    getDefaultBarColorConfig(options?.legendAccessor);

  const isolateLegend = !isUndefined(options?.isolateLegend)
    ? options?.isolateLegend
    : true;

  const initialCheckboxState: LegendCheckboxState = useMemo(() => {
    if (isEmpty(data) || isUndefined(barColorConfig)) return {};

    const checkboxState = getLegendInitialCheckboxState<T>(
      data,
      barColorConfig.accessor
    );

    setLegendCheckboxState(checkboxState);
    return checkboxState;
  }, [stringifiedData]);

  useEffect(() => {
    setFilteredData(data);
    setLegendCheckboxState(initialCheckboxState);
  }, [stringifiedData, initialCheckboxState]);

  useEffect(() => {
    setInitialParentElementOffsetLeft(
      chartRef.current?.parentElement?.offsetLeft
    );
  }, offsetLeftDependencies);

  const chartAbsoluteOffsetLeft = getAbsoluteOffsetLeft(
    chartRef,
    margins,
    chartRef.current?.parentElement?.offsetLeft ||
      initialParentElementOffsetLeft
  );

  const spacings = {
    x: xAxis.spacing || DEFAULT_X_AXIS_SPACING,
    y: yAxis.spacing || DEFAULT_Y_AXIS_SPACING,
  };

  const processedDataWithFilters = useProcessedData<T>({
    data: filteredData,
    xAccessor,
    options,
  });

  const groupedData = useGroupedData<T>({
    data: processedDataWithFilters,
    xAccessor,
    yAccessor,
    groupDataInsideBarsBy,
    options,
  });

  const xScaleMaxValue = useXScaleMaxValue<T>({
    groupedData,
    xAccessor,
  });

  const {
    chartDimensions,
    zoomIn,
    zoomOut,
    resetZoom,
    disableZoomIn,
    disableZoomOut,
    zoomFactor,
  } = useZoomableChart<T>({
    chartRef,
    groupedData,
    margins,
    spacings,
    xScaleMaxValue,
    zoomStepSize: options?.zoomStepSize || DEFAULT_ZOOM_STEP_SIZE,
  });

  const { xScale, yScale } = useChartScales<T>({
    data: filteredData,
    chartDimensions,
    margins,
    xScaleMaxValue,
    yAccessor,
    yScaleDomain,
  });

  const xAxisTicks = useMemo(
    () => (xAxis.ticks || DEFAULT_X_AXIS_TICKS) + zoomFactor,
    [zoomFactor]
  );

  const handleOnChangeLegendCheckbox = useCallback(
    (option: string, checked: boolean) => {
      if (isUndefined(barColorConfig)) return;

      setLegendCheckboxState((currentState) => {
        const updatedCheckboxState = {
          ...currentState,
          [option]: checked,
        };

        const filteredData = getFilteredData<T>(
          data,
          xAccessor,
          barColorConfig.accessor,
          updatedCheckboxState
        );

        setFilteredData(filteredData);
        return updatedCheckboxState;
      });

      if (onUpdate) onUpdate();
    },
    [stringifiedData]
  );

  const handleResetToDefault = useCallback(() => {
    setFilteredData(data);
    setLegendCheckboxState(initialCheckboxState);
    if (onUpdate) onUpdate();
  }, [stringifiedData]);

  const ChartDetails = useMemo(
    () => (
      <>
        {title && <ChartTitle>{title}</ChartTitle>}
        {subtitle && <ChartSubtitle>{subtitle}</ChartSubtitle>}
      </>
    ),
    [title, subtitle]
  );

  const ChartActions = useMemo(
    () => (
      <ChartActionButtonsContainer>
        <ZoomOutButton onClick={zoomOut} disabled={disableZoomOut} />
        <ZoomInButton onClick={zoomIn} disabled={disableZoomIn} />
        <ResetZoomButton onClick={resetZoom} />
      </ChartActionButtonsContainer>
    ),
    [zoomIn, zoomOut, resetZoom, disableZoomIn, disableZoomOut]
  );

  /**
   * This is to render the x-axis with sticky values
   */
  const ChartXAxisSticky = useMemo(() => {
    const translate = isXAxisOnTop
      ? `translate(0, ${margins.top})`
      : `translate(0, 0)`;

    return (
      <ChartStickyElement
        width={chartDimensions.width}
        height={X_AXIS_LABELS_HEIGHT[xAxisPlacement]}
      >
        <Axis
          placement={xAxisPlacement}
          scale={xScale}
          translate={translate}
          ticks={xAxisTicks}
        />
      </ChartStickyElement>
    );
  }, [chartDimensions, xScale, xAxisTicks]);

  const ChartContent = useMemo(
    () => (
      <ChartSVG
        width={chartDimensions.width}
        height={chartDimensions.height + CHART_HEIGHT_CORRECTION}
      >
        <Axes
          scales={{ x: xScale, y: yScale }}
          ticks={xAxisTicks}
          margins={margins}
          chartDimensions={chartDimensions}
        />

        <Bars
          groupedData={groupedData}
          scales={{ x: xScale, y: yScale }}
          accessors={{ x: xAccessor, y: yAccessor }}
          margins={margins}
          barComponentDimensions={{
            width: chartDimensions.width,
            height: spacings.y,
          }}
          options={options}
          formatTooltip={options?.formatTooltip}
          onClickBarLabel={onClickBarLabel}
        />
      </ChartSVG>
    ),
    [groupedData, chartDimensions, xScale, yScale, xAxisTicks]
  );

  const ChartLegend = useMemo(() => {
    if (isEmpty(data) || isUndefined(barColorConfig)) return null;

    const offsetBottom =
      isolateLegend && !isXAxisOnTop
        ? LEGEND_BOTTOM_SPACING.regular
        : LEGEND_BOTTOM_SPACING.isolated;

    return (
      <Legend
        checkboxState={legendCheckboxState}
        barColorConfig={barColorConfig}
        offset={{
          bottom: offsetBottom,
          left: chartAbsoluteOffsetLeft,
        }}
        onChange={handleOnChangeLegendCheckbox}
        title={options?.legendTitle}
        isolateLegend={isolateLegend}
      />
    );
  }, [legendCheckboxState, chartAbsoluteOffsetLeft]);

  const checkedLegendCheckboxOptions =
    getCheckedLegendCheckboxOptions(legendCheckboxState);

  const renderChart = () => (
    <>
      {isXAxisOnTop && xAxis.label && (
        <ChartDetailsContainer>
          <AxisLabel>{xAxis.label}</AxisLabel>
        </ChartDetailsContainer>
      )}

      <ChartContainer
        offsetbottom={spacings.y}
        enableFullHeight={isolateLegend && isXAxisOnTop}
      >
        {isXAxisOnTop && ChartXAxisSticky}
        {ChartContent}
        {!isXAxisOnTop && ChartXAxisSticky}
      </ChartContainer>

      {!isXAxisOnTop && xAxis.label && (
        <ChartDetailsContainer>
          <AxisLabel>{xAxis.label}</AxisLabel>
        </ChartDetailsContainer>
      )}
    </>
  );

  const renderNoResultsPage = () => (
    <ResetToDefault handleResetToDefault={handleResetToDefault} />
  );

  return (
    <>
      <StackedBarChartWrapper ref={chartRef}>
        <ChartDetailsContainer>
          {ChartDetails}
          {ChartActions}
        </ChartDetailsContainer>

        {isEmpty(checkedLegendCheckboxOptions)
          ? renderNoResultsPage()
          : renderChart()}
      </StackedBarChartWrapper>

      {ChartLegend}
    </>
  );
};
