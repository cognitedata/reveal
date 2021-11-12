import {
  ChartContainer,
  ChartSVG,
  ChartWithYAxisTitle,
} from 'components/charts/elements';

import { Axis, AxisPlacement } from '../Axis';
import { XAxisSticky } from '../XAxisSticky';
import { XAxisTitle } from '../XAxisTitle';
import { YAxisTitle } from '../YAxisTitle';

import { ChartPlaneProps } from './types';

export const ChartPlane = ({
  xScale,
  yScale,
  xAxisTitle,
  yAxisTitle,
  xAxisPlacement,
  xAxisTicks,
  chartDimensions,
  margins,
  chartOffsetBottom,
  renderChartData,
  xAxisExtraProps,
  yAxisExtraProps,
}: ChartPlaneProps) => {
  const isXAxisOnTop = xAxisPlacement === AxisPlacement.Top;

  const ChartXAxisSticky = (
    <XAxisSticky
      chartDimensions={chartDimensions}
      xAxisPlacement={xAxisPlacement}
      xScale={xScale}
      xAxisTicks={xAxisTicks}
      xAxisExtraProps={xAxisExtraProps}
    />
  );

  const ChartContent = (
    <ChartSVG
      className="chart-content"
      width={chartDimensions.width}
      height={chartDimensions.height}
    >
      <Axis
        placement={AxisPlacement.Top}
        scale={xScale}
        translate="translate(0, 0)"
        tickSize={chartDimensions.height}
        ticks={xAxisTicks}
        hideAxisLabels
      />

      <Axis
        placement={AxisPlacement.Left}
        scale={yScale}
        translate={`translate(${margins.left}, 0)`}
        {...yAxisExtraProps}
      />

      {renderChartData()}
    </ChartSVG>
  );

  return (
    <>
      {isXAxisOnTop && <XAxisTitle title={xAxisTitle} />}

      <ChartWithYAxisTitle>
        <YAxisTitle title={yAxisTitle} />

        <ChartContainer offsetbottom={chartOffsetBottom}>
          {isXAxisOnTop && ChartXAxisSticky}
          {ChartContent}
          {!isXAxisOnTop && ChartXAxisSticky}
        </ChartContainer>
      </ChartWithYAxisTitle>

      {!isXAxisOnTop && <XAxisTitle title={xAxisTitle} />}
    </>
  );
};
