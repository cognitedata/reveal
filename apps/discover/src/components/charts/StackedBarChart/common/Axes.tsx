import { AXIS_PLACEMENT } from '../constants';
import { AxesProps } from '../types';

import { Axis } from './Axis';

export const Axes = ({
  scales,
  ticks,
  margins,
  chartDimensions,
  hideXAxisValues,
}: AxesProps) => {
  const { x: xScale, y: yScale } = scales;

  const xAxisTranslate = hideXAxisValues
    ? `translate(0, 0)`
    : `translate(0, ${margins.top})`;

  const xAxisProps = {
    placement: AXIS_PLACEMENT.Top,
    scale: xScale,
    translate: xAxisTranslate,
    tickSize: chartDimensions.height - margins.top - margins.bottom,
    ticks,
  };

  const yAxisProps = {
    placement: AXIS_PLACEMENT.Left,
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
