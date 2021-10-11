import { useCallback, useEffect, useMemo, useState, useRef } from 'react';

import isEmpty from 'lodash/isEmpty';
import isUndefined from 'lodash/isUndefined';

import { ZoomOutButton, ZoomInButton, ResetZoomButton } from './Buttons';
import { Axes } from './common/Axes';
import { Axis } from './common/Axis';
import { Bars } from './common/Bars';
import { Legend } from './common/Legend';
import {
  AXIS_PLACEMENT,
  X_AXIS_LABELS_HEIGHT,
  DEFAULT_MARGINS,
  DEFAULT_X_AXIS_SPACING,
  DEFAULT_Y_AXIS_SPACING,
  DEFAULT_X_AXIS_TICKS,
  DEFAULT_ZOOM_STEP_SIZE,
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
import { DataObject, LegendCheckboxState, StackedBarChartProps } from './types';
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
  groupDataInsideBarsBy,
  title,
  subtitle,
  options,
  onUpdate,
  offsetLeftDependencies,
}: StackedBarChartProps<T>) => {
  const chartRef = useRef<HTMLDivElement>(null);

  const [filteredData, setFilteredData] = useState<T[]>(data);
  const [legendCheckboxState, setLegendCheckboxState] =
    useState<LegendCheckboxState>({});
  const [initialParentElementOffsetLeft, setInitialParentElementOffsetLeft] =
    useState<number>();

  const numberOfDataElements = data.length;
  const margins = options?.margins || DEFAULT_MARGINS;
  const barColorConfig =
    options?.barColorConfig ||
    getDefaultBarColorConfig(options?.legendAccessor);

  const initialCheckboxState: LegendCheckboxState = useMemo(() => {
    if (isEmpty(data) || isUndefined(barColorConfig)) return {};

    const checkboxState = getLegendInitialCheckboxState<T>(
      data,
      barColorConfig.accessor
    );

    setLegendCheckboxState(checkboxState);
    return checkboxState;
  }, [numberOfDataElements]);

  useEffect(() => {
    setFilteredData(data);
    setLegendCheckboxState(initialCheckboxState);
  }, [numberOfDataElements, initialCheckboxState]);

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
    xAxis,
    options,
  });

  const groupedData = useGroupedData<T>({
    data: processedDataWithFilters,
    xAxis,
    yAxis,
    groupDataInsideBarsBy,
    options,
  });

  const xScaleMaxValue = useXScaleMaxValue<T>({
    groupedData,
    xAccessor: xAxis.accessor,
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
    yAxis,
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
          xAxis.accessor,
          barColorConfig.accessor,
          updatedCheckboxState
        );

        setFilteredData(filteredData);
        return updatedCheckboxState;
      });

      if (onUpdate) onUpdate();
    },
    [numberOfDataElements]
  );

  const handleResetToDefault = useCallback(() => {
    setFilteredData(data);
    setLegendCheckboxState(initialCheckboxState);
    if (onUpdate) onUpdate();
  }, [numberOfDataElements]);

  const ChartDetails = useMemo(
    () => (
      <>
        {title && <ChartTitle>{title}</ChartTitle>}
        {subtitle && <ChartSubtitle>{subtitle}</ChartSubtitle>}
        {xAxis.label && <AxisLabel>{xAxis.label}</AxisLabel>}
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
  const ChartXAxisSticky = useMemo(
    () => (
      <ChartStickyElement>
        <ChartSVG width={chartDimensions.width} height={X_AXIS_LABELS_HEIGHT}>
          <Axis
            placement={AXIS_PLACEMENT.Top}
            scale={xScale}
            translate="translate(0, 24)"
            ticks={xAxisTicks}
          />
        </ChartSVG>
      </ChartStickyElement>
    ),
    [chartDimensions, xScale, xAxisTicks]
  );

  const ChartContent = useMemo(
    () => (
      <ChartSVG width={chartDimensions.width} height={chartDimensions.height}>
        <Axes
          scales={{ x: xScale, y: yScale }}
          ticks={xAxisTicks}
          margins={margins}
          chartDimensions={chartDimensions}
          hideXAxisValues
        />

        <Bars
          groupedData={groupedData}
          scales={{ x: xScale, y: yScale }}
          accessors={{ x: xAxis.accessor, y: yAxis.accessor }}
          margins={margins}
          barComponentDimensions={{
            width: chartDimensions.width,
            height: spacings.y,
          }}
          options={options}
          formatTooltip={options?.formatTooltip}
        />
      </ChartSVG>
    ),
    [groupedData, chartDimensions, xScale, yScale, xAxisTicks]
  );

  const ChartLegend = useMemo(() => {
    if (isEmpty(data) || isUndefined(barColorConfig)) return null;

    return (
      <Legend
        checkboxState={legendCheckboxState}
        barColorConfig={barColorConfig}
        offsetleft={chartAbsoluteOffsetLeft}
        onChange={handleOnChangeLegendCheckbox}
        title={options?.legendTitle}
      />
    );
  }, [legendCheckboxState, chartAbsoluteOffsetLeft]);

  const checkedLegendCheckboxOptions =
    getCheckedLegendCheckboxOptions(legendCheckboxState);

  const renderChart = () => (
    <ChartContainer paddingBottom={spacings.y}>
      {ChartXAxisSticky}
      {ChartContent}
    </ChartContainer>
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
