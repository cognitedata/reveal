import { AxesProps, AxisPlacement } from '../types';

import { Axis } from './Axis';

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
