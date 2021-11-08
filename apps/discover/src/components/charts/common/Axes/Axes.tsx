import { Axis, AxisPlacement } from 'components/charts/common/Axis';

import { AxesProps } from './types';

export const Axes = ({
  scales,
  ticks,
  margins,
  chartDimensions,
}: AxesProps) => {
  const { x: xScale, y: yScale } = scales;

  const xAxisProps = {
    placement: AxisPlacement.Top,
    scale: xScale,
    translate: `translate(0, 0)`,
    tickSize: chartDimensions.height,
    ticks,
  };

  const yAxisProps = {
    placement: AxisPlacement.Left,
    scale: yScale,
    translate: `translate(${margins.left}, 0)`,
  };

  return (
    <g>
      <Axis {...xAxisProps} />
      <Axis {...yAxisProps} />
    </g>
  );
};
