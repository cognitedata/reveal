import { ChartSVG, ChartWithXAxis } from 'components/charts/elements';
import { FlexColumn } from 'styles/layout';

import { ChartContentWrapper, ChartRowContent } from '../../elements';
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
  maxHeight,
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
      height={chartDimensions.height + (chartOffsetBottom || 0)}
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

  if (isXAxisOnTop) {
    return (
      <ChartContentWrapper>
        <XAxisTitle title={xAxisTitle} />

        <ChartRowContent>
          <YAxisTitle title={yAxisTitle} />

          <ChartWithXAxis>
            {ChartXAxisSticky}
            <div style={{ maxHeight }}>{ChartContent}</div>
          </ChartWithXAxis>
        </ChartRowContent>
      </ChartContentWrapper>
    );
  }

  /**
   * If xAxisPlacement is bottom.
   */
  return (
    <ChartContentWrapper>
      <ChartRowContent>
        <YAxisTitle title={yAxisTitle} />

        <ChartWithXAxis>
          <FlexColumn style={{ maxHeight }}>
            {ChartContent}
            {ChartXAxisSticky}
          </FlexColumn>
        </ChartWithXAxis>
      </ChartRowContent>

      <XAxisTitle title={xAxisTitle} />
    </ChartContentWrapper>
  );
};
