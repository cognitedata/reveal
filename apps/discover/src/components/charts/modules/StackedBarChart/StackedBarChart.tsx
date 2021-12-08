import { useCallback, useMemo, useRef } from 'react';

import { BaseChart } from 'components/charts/BaseChart';
import { AxisPlacement } from 'components/charts/common/Axis';
import { ChartPlane } from 'components/charts/common/ChartPlane';
import { useXScaleRange } from 'components/charts/hooks/useXScaleRange';

import { DEFAULT_X_AXIS_TICKS, DEFAULT_ZOOM_STEP_SIZE } from '../../constants';
import { useChartCommonEssentials } from '../../hooks/useChartCommonEssentials';
import { useChartScales } from '../../hooks/useChartScales';
import { useZoomableChart } from '../../hooks/useZoomableChart';
import { DataObject } from '../../types';

import { Bars } from './Bars';
import { useGroupedData } from './hooks/useGroupedData';
import { StackedBarChartProps } from './types';

export const StackedBarChart = <T extends DataObject<T>>({
  id,
  data: dataOriginal,
  xAxis,
  yAxis,
  yScaleDomain: yScaleDomainCustom,
  groupDataInsideBarsBy,
  title,
  subtitle,
  options,
  onUpdate,
  onSelectBar,
}: StackedBarChartProps<T>) => {
  const chartRef = useRef<HTMLDivElement>(null);

  const {
    data,
    filteredData,
    margins,
    accessors,
    xAxisPlacement,
    legendProps,
    colorConfig,
    chartOffsetBottom,
    spacings,
    handleResetToDefault,
  } = useChartCommonEssentials<T>({
    dataOriginal,
    xAxis,
    yAxis,
    options,
    onUpdate,
  });

  const initialGroupedData = useGroupedData<T>({
    data,
    accessors,
    groupDataInsideBarsBy,
    options,
  });

  const groupedData = useGroupedData<T>({
    data: filteredData,
    accessors,
    groupDataInsideBarsBy,
    options,
  });

  const [_unused, xScaleMaxValue] = useXScaleRange<T>({
    data: filteredData,
    accessors,
    useGroupedValues: true,
    scaleFactor: 0.1,
  });

  const { chartDimensions, zoomFactor, ...zoomActions } = useZoomableChart({
    data: filteredData,
    chartRef,
    margins,
    accessors,
    spacings,
    xScaleMaxValue,
    yScaleDomainCustom,
    zoomStepSize: options?.zoomStepSize || DEFAULT_ZOOM_STEP_SIZE,
  });

  const { xScale, yScale, yScaleDomain } = useChartScales<T>({
    data: filteredData,
    chartDimensions,
    margins,
    accessors,
    xScaleRange: [0, xScaleMaxValue],
    yScaleDomainCustom,
    reverseXScaleDomain: xAxis.reverseScaleDomain,
    reverseYScaleDomain: yAxis.reverseScaleDomain,
  });

  const xAxisTicks = useMemo(
    () => (xAxis.ticks || DEFAULT_X_AXIS_TICKS) + zoomFactor,
    [zoomFactor]
  );

  const handleSelectBar = useCallback((key: string, index: number) => {
    if (onSelectBar) {
      onSelectBar({
        key,
        index,
        data: initialGroupedData[key],
        groupedData: initialGroupedData,
      });
    }
  }, []);

  const renderChartData = () => (
    <Bars
      initialGroupedData={initialGroupedData}
      groupedData={groupedData}
      scales={{ x: xScale, y: yScale }}
      xScaleMaxValue={xScaleMaxValue}
      yScaleDomain={yScaleDomain}
      accessors={accessors}
      colorConfig={colorConfig}
      margins={margins}
      barComponentDimensions={{
        width: chartDimensions.width,
        height: spacings.y,
      }}
      options={options}
      onSelectBar={handleSelectBar}
    />
  );

  const renderChart = () => {
    return (
      <ChartPlane
        xScale={xScale}
        yScale={yScale}
        xAxisTitle={xAxis.title}
        xAxisPlacement={xAxisPlacement as AxisPlacement}
        xAxisTicks={xAxisTicks}
        chartDimensions={chartDimensions}
        margins={margins}
        chartOffsetBottom={chartOffsetBottom}
        renderChartData={renderChartData}
        yAxisExtraProps={{
          hideAxisTicks: true,
          hideAxisLabels: true,
        }}
      />
    );
  };

  return (
    <BaseChart<T>
      id={id}
      className="stacked-bar-chart"
      chartRef={chartRef}
      data={data}
      title={title}
      subtitle={subtitle}
      zoomActions={zoomActions}
      legendProps={legendProps}
      renderChart={renderChart}
      handleResetToDefault={handleResetToDefault}
    />
  );
};
