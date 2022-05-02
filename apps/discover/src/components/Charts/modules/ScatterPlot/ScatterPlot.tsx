import { useMemo, useRef } from 'react';

import { BaseChart } from 'components/Charts/BaseChart';
import { AxisPlacement } from 'components/Charts/common/Axis';
import { ChartPlane } from 'components/Charts/common/ChartPlane';
import { useChartCommonEssentials } from 'components/Charts/hooks/useChartCommonEssentials';
import { useXScaleRange } from 'components/Charts/hooks/useXScaleRange';
import { useYScaleRange } from 'components/Charts/hooks/useYScaleRange';

import { DEFAULT_X_AXIS_TICKS, DEFAULT_ZOOM_STEP_SIZE } from '../../constants';
import { useChartScales } from '../../hooks/useChartScales';
import { useZoomableChart } from '../../hooks/useZoomableChart';
import { DataObject } from '../../types';

import { Plots } from './Plots';
import { ScatterPlotProps } from './types';
import { getCalculatedYAxisTicks } from './utils';

export const ScatterPlot = <T extends DataObject<T>>({
  id,
  data: dataOriginal,
  xAxis,
  yAxis,
  title,
  subtitle,
  options,
  renderPlotHoverComponent,
  onUpdate,
}: ScatterPlotProps<T>) => {
  const chartRef = useRef<HTMLDivElement>(null);

  const {
    data,
    filteredData,
    margins,
    yAccessor,
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

  const xScaleRange = useXScaleRange<T>({
    data,
    accessors,
  });
  const yScaleRange = useYScaleRange<T>({
    data,
    yAccessor,
    scaleFactor: 0.02,
  });

  const { chartDimensions, zoomFactor, ...zoomActions } = useZoomableChart({
    data,
    chartRef,
    margins,
    accessors,
    spacings,
    xScaleMaxValue: xScaleRange[1],
    zoomStepSize: options?.zoomStepSize || DEFAULT_ZOOM_STEP_SIZE,
  });

  const { xScale, yScale } = useChartScales<T>({
    data,
    chartDimensions,
    margins,
    accessors,
    xScaleRange,
    yScaleRange: [0, yScaleRange[1]],
    reverseXScaleDomain: xAxis.reverseScaleDomain,
    reverseYScaleDomain: yAxis.reverseScaleDomain,
  });

  const xAxisTicks = useMemo(
    () => (xAxis.ticks || DEFAULT_X_AXIS_TICKS) + zoomFactor,
    [zoomFactor]
  );
  const yAxisTicks = yAxis.ticks || getCalculatedYAxisTicks<T>(data, yAccessor);

  const renderChartData = () => (
    <Plots
      data={filteredData}
      scales={{ x: xScale, y: yScale }}
      accessors={accessors}
      colorConfig={colorConfig}
      options={options}
      renderPlotHoverComponent={renderPlotHoverComponent}
    />
  );

  const renderChart = () => {
    return (
      <ChartPlane
        xScale={xScale}
        yScale={yScale}
        xAxisTitle={xAxis.title}
        yAxisTitle={yAxis.title}
        xAxisPlacement={xAxisPlacement as AxisPlacement}
        xAxisTicks={xAxisTicks}
        chartDimensions={chartDimensions}
        margins={margins}
        chartOffsetBottom={chartOffsetBottom}
        renderChartData={renderChartData}
        xAxisExtraProps={{
          formatAxisLabel: xAxis.formatAxisLabel,
        }}
        yAxisExtraProps={{
          tickSize: chartDimensions.width,
          ticks: yAxisTicks,
          formatAxisLabel: yAxis.formatAxisLabel,
        }}
        maxHeight={options?.maxHeight}
      />
    );
  };

  return (
    <BaseChart<T>
      id={id}
      className="scatter-plot"
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
